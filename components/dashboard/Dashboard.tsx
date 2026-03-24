"use client";

import { useMemo, useState } from "react";

import { CommitmentCard } from "@/components/dashboard/CommitmentCard";
import { ExecutionTimeline } from "@/components/dashboard/ExecutionTimeline";
import { ProofStatusCard } from "@/components/dashboard/ProofStatusCard";
import { StarknetStatus } from "@/components/dashboard/StarknetStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useZKProver } from "@/hooks/useZKProver";
import { useStarknet } from "@/hooks/useStarknet";
import { useProofStore } from "@/store/proofStore";
import { useStrategyStore } from "@/store/strategyStore";

export function Dashboard() {
  const { graph, commitment } = useStrategyStore();
  const { proof } = useProofStore();
  const { generateProof } = useZKProver();
  const { verifyAndExecuteProof } = useStarknet();
  const [error, setError] = useState<string | null>(null);

  const constraints = useMemo(
    () =>
      graph.nodes.map((node) => ({
        nodeId: node.id,
        constraintType: node.type,
        publicInputs: [node.type],
      })),
    [graph.nodes],
  );

  const onGenerate = async () => {
    try {
      setError(null);

      if (!commitment) {
        throw new Error("No commitment found. Compile a strategy first.");
      }

      const executeNode = graph.nodes.find((node) => node.type === "execute");
      const conditionNode = graph.nodes.find((node) => node.type === "condition");

      const executionSteps = graph.nodes.map((node) => `${node.type}:${node.id}`);

      const amount = Number((executeNode?.data as { amount?: number } | undefined)?.amount ?? 0);
      const price = Number((conditionNode?.data as { price?: number } | undefined)?.price ?? 0);

      const tradeAmount = BigInt(Math.max(1, Math.floor(amount * 100_000_000))); // PRIVATE — never log or transmit
      const centerPrice = BigInt(Math.max(1, Math.floor(price || 50_000))); // PRIVATE — never log or transmit
      const spread = 2_000n;

      const proof = await generateProof({
        tradeAmount,
        priceLower: centerPrice - spread,
        priceUpper: centerPrice + spread,
        executionSteps,
      });

      await verifyAndExecuteProof(proof);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Execution failed";
      setError(message);
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        <TabsTrigger value="constraints">ZK Constraints</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CommitmentCard commitment={commitment} />
          <ProofStatusCard onGenerate={onGenerate} />
          <StarknetStatus />
        </div>
        <ExecutionTimeline />
      </TabsContent>

      <TabsContent value="logs">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 font-heading text-lg font-bold">Execution Log Table</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2">Step</th>
                <th>Node</th>
                <th>Action</th>
                <th>Masked</th>
              </tr>
            </thead>
            <tbody>
              {graph.nodes.map((node, index) => (
                <tr key={node.id} className="border-b border-border/50">
                  <td className="py-2">{index + 1}</td>
                  <td>{node.id.slice(0, 6)}</td>
                  <td>{node.type.toUpperCase()}</td>
                  <td className="redacted">████</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="constraints">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 font-heading text-lg font-bold">Constraint Set</h3>
          <ul className="space-y-2 text-sm">
            {constraints.map((item) => (
              <li key={item.nodeId} className="rounded-md border border-border p-2">
                {item.nodeId.slice(0, 8)} — {item.constraintType}
              </li>
            ))}
          </ul>
          {proof ? <p className="mt-3 text-xs text-primary">Proof hash: {proof.proofHash}</p> : null}
        </div>
      </TabsContent>
    </Tabs>
  );
}
