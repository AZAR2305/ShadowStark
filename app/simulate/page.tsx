import { ExecutionVisualizer } from "@/components/visualizer/ExecutionVisualizer";
import { TEEAttestationCard } from "@/components/tee/TEEAttestationCard";
import { MerkleTreeVisualizer, NullifierStatus, ProofInspector, RangeProofWidget } from "@/components/zk";
import type { ZKProof } from "@/types";

const mockProof: ZKProof = {
  proofHash: "0x91ab3f2ec984ad57f0de1245779bca1f0f3d2a4c9e66b77f9a4e5cc1aa76ef11",
  commitment: "0x3f2a5bc8d1e7944cf2b3a5e9c1f6d8a2b4e7f9c3d6a8b1e4f7c9d2e5a8b1f4",
  finalStateHash: "0x8be6dc9f3451f9f4e2a412ff995233ad155e19d31b59f54a31b20e572c1da229",
  nullifier: "0x2f18ab7791e2d4c6",
  merkleRoot: "0x57c1d29ab8e44c8f9bbf1e374aa991ac9d2a11b2ed4d37b9f44150a81e5c9af2",
  publicInputs: {
    commitment: "0x3f2a5bc8",
    finalStateHash: "0x8be6dc9f",
    nullifier: "0x2f18ab77",
    merkleRoot: "0x57c1d29a",
  },
  verified: true,
  constraintCount: 42,
  proofSize: 21504,
  timestamp: Date.now(),
};

export default function SimulatePage() {
  return (
    <div className="space-y-6 p-4">
      <ExecutionVisualizer />

      <section className="grid gap-4 xl:grid-cols-2">
        <TEEAttestationCard />
        <RangeProofWidget valueCommitment={mockProof.commitment} proofGenerated={true} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <NullifierStatus nullifier={0x2f18ab7791e2d4c6n} isSpent={false} isNew={true} />
        <MerkleTreeVisualizer root={0x57c1d29ab8e44c8fn} leafCount={4} depth={3} highlightedLeaf={1} />
      </section>

      <section>
        <ProofInspector proof={mockProof} />
      </section>
    </div>
  );
}
