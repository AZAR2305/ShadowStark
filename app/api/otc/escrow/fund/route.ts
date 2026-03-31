import { NextRequest, NextResponse } from "next/server";
import { OtcMatchingService } from "@/lib/server/otcMatchingService";
import { OtcEscrowService } from "@/lib/server/otcEscrowService";
import { verifySignature } from "@/lib/web3/zkProofVerification";

const otcService = OtcMatchingService.getInstance();
const escrowService = OtcEscrowService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      intentId,
      matchId,
      walletAddress,
      signature,
      fundAmount,
      sendChain,
    } = body;

    // Validate required fields
    if (
      !intentId ||
      !matchId ||
      !walletAddress ||
      !signature ||
      !fundAmount ||
      !sendChain
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: [
            "intentId",
            "matchId",
            "walletAddress",
            "signature",
            "fundAmount",
            "sendChain",
          ],
        },
        { status: 400 }
      );
    }

    // Get the match details to verify it exists
    const match = otcService.getMatchByIntentAndId(intentId, matchId);
    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    // Determine which party this is (A or B)
    const isPartyA = walletAddress.toLowerCase() === match.partyA.wallet.toLowerCase();
    const isPartyB = walletAddress.toLowerCase() === match.partyB.wallet.toLowerCase();

    if (!isPartyA && !isPartyB) {
      return NextResponse.json(
        { error: "Wallet address does not match either party in this match" },
        { status: 403 }
      );
    }

    // Verify the signature matches the intent and wallet
    const intentMessageHash = `OTC_ESCROW_FUND:${intentId}:${matchId}:${fundAmount}:${sendChain}`;
    const signatureValid = await verifySignature(
      walletAddress,
      intentMessageHash,
      signature
    );

    if (!signatureValid) {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 }
      );
    }

    // Check if user already funded
    if (isPartyA && match.partyA.fundedToEscrow) {
      return NextResponse.json(
        { error: "Party A has already funded the escrow" },
        { status: 400 }
      );
    }

    if (isPartyB && match.partyB.fundedToEscrow) {
      return NextResponse.json(
        { error: "Party B has already funded the escrow" },
        { status: 400 }
      );
    }

    // Verify the fund amount matches what was agreed upon
    const expectedAmount = isPartyA ? match.partyA.sendAmount : match.partyB.sendAmount;
    if (fundAmount !== expectedAmount) {
      return NextResponse.json(
        {
          error: `Fund amount mismatch. Expected ${expectedAmount}, got ${fundAmount}`,
        },
        { status: 400 }
      );
    }

    // Update match status to mark this party as funded
    let escrowTxHash = "";
    try {
      // Lock funds in escrow contract (this will call the blockchain)
      const fundingResult = await escrowService.lockFundsInEscrow(
        intentId,
        matchId,
        walletAddress,
        fundAmount,
        sendChain
      );

      escrowTxHash = fundingResult.transactionHash;
    } catch (escrowError) {
      console.error("Escrow funding error:", escrowError);
      return NextResponse.json(
        {
          error: "Failed to lock funds in escrow contract",
          details: escrowError instanceof Error ? escrowError.message : String(escrowError),
        },
        { status: 500 }
      );
    }

    // Update the match to show this party has funded
    const updatedMatch = otcService.updateMatchFundingStatus(
      intentId,
      matchId,
      isPartyA ? "partyA" : "partyB",
      true,
      escrowTxHash
    );

    if (!updatedMatch) {
      return NextResponse.json(
        { error: "Failed to update match funding status" },
        { status: 500 }
      );
    }

    // Check if both parties have now funded
    if (updatedMatch.partyA.fundedToEscrow && updatedMatch.partyB.fundedToEscrow) {
      // Both funded - initiate atomic swap execution
      try {
        const executeResult = await escrowService.executeAtomicSwap(
          intentId,
          matchId,
          updatedMatch
        );

        // Update match status to executing
        otcService.updateMatchStatus(intentId, matchId, "executing");

        return NextResponse.json(
          {
            success: true,
            message: "Funds locked in escrow and atomic swap initiated",
            fundingTxHash: escrowTxHash,
            swapInProgress: true,
            swapExecutionHashes: executeResult.transactionHashes,
            matchStatus: "executing",
          },
          { status: 200 }
        );
      } catch (executeError) {
        console.error("Atomic swap execution error:", executeError);

        // Mark the match as pending execution retry
        otcService.updateMatchStatus(intentId, matchId, "escrow_funded");

        return NextResponse.json(
          {
            success: true,
            message: "Funds locked in escrow. Atomic swap queued for execution.",
            fundingTxHash: escrowTxHash,
            swapInProgress: false,
            executionPending: true,
            matchStatus: "escrow_funded",
            warning: "Atomic swap execution will be retried",
          },
          { status: 200 }
        );
      }
    }

    // Only this party has funded so far
    return NextResponse.json(
      {
        success: true,
        message: `${isPartyA ? "Party A" : "Party B"} funds locked in escrow. Waiting for counterparty to fund.`,
        fundingTxHash: escrowTxHash,
        matchStatus: "escrow_funding",
        partyAFunded: updatedMatch.partyA.fundedToEscrow,
        partyBFunded: updatedMatch.partyB.fundedToEscrow,
        waitingForCounterparty: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in escrow fund route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check escrow funding status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const intentId = searchParams.get("intentId");
    const matchId = searchParams.get("matchId");

    if (!intentId || !matchId) {
      return NextResponse.json(
        { error: "Missing intentId or matchId" },
        { status: 400 }
      );
    }

    const match = otcService.getMatchByIntentAndId(intentId, matchId);
    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        intentId,
        matchId,
        status: match.status,
        partyA: {
          wallet: match.partyA.wallet,
          sendAmount: match.partyA.sendAmount,
          fundedToEscrow: match.partyA.fundedToEscrow || false,
          escrowTxHash: match.partyA.escrowTxHash || null,
        },
        partyB: {
          wallet: match.partyB.wallet,
          sendAmount: match.partyB.sendAmount,
          fundedToEscrow: match.partyB.fundedToEscrow || false,
          escrowTxHash: match.partyB.escrowTxHash || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking escrow status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
