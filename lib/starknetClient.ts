import { Provider, RpcProvider } from "starknet";

const DEFAULT_RPC =
  process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
  "https://starknet-sepolia.public.blastapi.io/rpc/v0_8";

export interface VerificationReceipt {
  txHash: string;
  blockNumber: number;
  success: boolean;
}

export class ShadowFlowStarknetClient {
  provider: Provider;
  private executionApiUrl?: string;
  private realExecutionEnabled: boolean;

  constructor(rpcUrl = DEFAULT_RPC) {
    this.provider = new RpcProvider({ nodeUrl: rpcUrl });
    this.executionApiUrl = process.env.NEXT_PUBLIC_EXECUTION_API_URL;
    this.realExecutionEnabled = process.env.NEXT_PUBLIC_ENABLE_REAL_EXECUTION === "true";
  }

  async storeCommitment(commitment: string): Promise<VerificationReceipt> {
    if (!this.realExecutionEnabled) {
      throw new Error(
        "Real execution is disabled. Set NEXT_PUBLIC_ENABLE_REAL_EXECUTION=true and configure NEXT_PUBLIC_EXECUTION_API_URL."
      );
    }

    if (!this.executionApiUrl) {
      throw new Error("Missing NEXT_PUBLIC_EXECUTION_API_URL for real commitment storage.");
    }

    const response = await fetch(`${this.executionApiUrl}/commitment/store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commitment }),
    });

    if (!response.ok) {
      throw new Error(`Commitment store failed: ${response.status}`);
    }

    const data = (await response.json()) as VerificationReceipt;
    return data;
  }

  async verifyAndStore(proofHash: string, finalStateHash: string): Promise<VerificationReceipt> {
    if (!this.realExecutionEnabled) {
      throw new Error(
        "Real execution is disabled. Set NEXT_PUBLIC_ENABLE_REAL_EXECUTION=true and configure NEXT_PUBLIC_EXECUTION_API_URL."
      );
    }

    if (!this.executionApiUrl) {
      throw new Error("Missing NEXT_PUBLIC_EXECUTION_API_URL for on-chain verification.");
    }

    const response = await fetch(`${this.executionApiUrl}/proof/verify-and-store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proofHash, finalStateHash }),
    });

    if (!response.ok) {
      throw new Error(`Proof verify/store failed: ${response.status}`);
    }

    const data = (await response.json()) as VerificationReceipt;
    return data;
  }
}

export const starknetClient = new ShadowFlowStarknetClient();
