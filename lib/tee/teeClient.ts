import type { ExecutionLog, Strategy, TEEAttestation } from "@/types";

export async function runInTEE(
  strategy: Strategy,
  executionFn: () => ExecutionLog[]
): Promise<{ logs: ExecutionLog[]; attestation: TEEAttestation }> {
  const logs = executionFn();

  const attestation: TEEAttestation = {
    enclaveType: "simulated",
    measurementHash: `0xtee${strategy.id}${Date.now().toString(16)}`,
    timestamp: Date.now(),
    valid: true,
  };

  return { logs, attestation };
}
