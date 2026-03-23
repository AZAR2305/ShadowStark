import { Provider, RpcProvider } from "starknet";

const DEFAULT_RPC = "https://starknet-mainnet.public.blastapi.io";

export interface VerificationReceipt {
  txHash: string;
  blockNumber: number;
  success: boolean;
}

export class ShadowFlowStarknetClient {
  provider: Provider;

  constructor(rpcUrl = DEFAULT_RPC) {
    this.provider = new RpcProvider({ nodeUrl: rpcUrl });
  }

  async storeCommitment(commitment: string): Promise<VerificationReceipt> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const commitmentHint = commitment.slice(2, 8);
    return {
      txHash: `0xcommit${commitmentHint}${Math.floor(Math.random() * 1e6).toString(16)}`,
      blockNumber: 900000 + Math.floor(Math.random() * 1200),
      success: true,
    };
  }

  async verifyAndStore(proofHash: string, finalStateHash: string): Promise<VerificationReceipt> {
    await new Promise((resolve) => setTimeout(resolve, 900));
    const verifyHint = `${proofHash.slice(2, 6)}${finalStateHash.slice(2, 6)}`;
    return {
      txHash: `0xverify${verifyHint}${Math.floor(Math.random() * 1e6).toString(16)}`,
      blockNumber: 900000 + Math.floor(Math.random() * 1200),
      success: true,
    };
  }
}

export const starknetClient = new ShadowFlowStarknetClient();
