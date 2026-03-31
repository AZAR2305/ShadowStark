import { Navigation } from "@/components/navigation";
import { SwapMatchingInterface } from "@/components/swap-matching-interface-new";

interface SwapMatchingPageProps {
  searchParams: {
    intentId?: string;
    matchId?: string;
    wallet?: string;
    direction?: "buy" | "sell";
    amount?: string;
    price?: string;
    sendChain?: "btc" | "strk";
    receiveChain?: "btc" | "strk";
  };
}

export const metadata = {
  title: "Swap Matching - ShadowFlowBTC++",
  description: "Atomic swap execution with escrow funding",
};

export default function SwapMatchingPage({ searchParams }: SwapMatchingPageProps) {
  const intentId = searchParams.intentId || "";
  const matchId = searchParams.matchId || "";
  const walletAddress = searchParams.wallet || "0x...";
  const direction = (searchParams.direction || "buy") as "buy" | "sell";
  const amount = searchParams.amount || "0";
  const price = searchParams.price || "0";
  const sendChain = (searchParams.sendChain || "btc") as "btc" | "strk";
  const receiveChain = (searchParams.receiveChain || "strk") as "btc" | "strk";

  if (!intentId || !matchId) {
    return (
      <main className="flex flex-col min-h-screen bg-white p-6">
        <Navigation />
        <div className="mt-8 max-w-2xl">
          <h1 className="text-xl font-bold">Missing match details</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Intent ID and Match ID are required for the swap matching interface.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Navigation />
      <div className="flex-1">
        <SwapMatchingInterface
          intentId={intentId}
          matchId={matchId}
          walletAddress={walletAddress}
          initialIntent={{
            direction,
            amount,
            priceThreshold: price,
          }}
          sendChain={sendChain}
          receiveChain={receiveChain}
        />
      </div>
    </main>
  );
}
