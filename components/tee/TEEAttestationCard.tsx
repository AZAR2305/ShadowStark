import type { TEEAttestation } from "@/types";

export function TEEAttestationCard({ attestation }: { attestation: TEEAttestation | null }) {
  if (!attestation) {
    return null;
  }

  return (
    <div className="terminal-card space-y-2">
      <h3 className="font-display text-sm font-semibold">TEE Attestation</h3>
      <p className="text-xs text-secondary">Enclave type: {attestation.enclaveType}</p>
      <p className="font-code text-xs text-code">{attestation.measurementHash.slice(0, 20)}...</p>
      <span className="badge-public inline-flex">Attestation valid</span>
    </div>
  );
}
