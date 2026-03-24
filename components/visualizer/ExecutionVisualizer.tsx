"use client";

import { motion } from "framer-motion";
import { Zap, Target, Cpu, Lock, Landmark, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface PipelineStage {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  status: "pending" | "active" | "complete";
}

const stages: PipelineStage[] = [
  {
    id: 1,
    title: "Strategy Input",
    description: "Your graph is submitted",
    icon: <Target className="h-8 w-8" />,
    color: "bg-cyan-500/20",
    textColor: "text-cyan-400",
    status: "complete",
  },
  {
    id: 2,
    title: "Commitment",
    description: "Hash & serialize",
    icon: <Cpu className="h-8 w-8" />,
    color: "bg-indigo-500/20",
    textColor: "text-indigo-400",
    status: "complete",
  },
  {
    id: 3,
    title: "Execution",
    description: "Steps run through",
    icon: <Zap className="h-8 w-8" />,
    color: "bg-amber-500/20",
    textColor: "text-amber-400",
    status: "active",
  },
  {
    id: 4,
    title: "ZK Proof",
    description: "Generate witness",
    icon: <Lock className="h-8 w-8" />,
    color: "bg-violet-500/20",
    textColor: "text-violet-400",
    status: "pending",
  },
  {
    id: 5,
    title: "Starknet",
    description: "Submit on-chain",
    icon: <Landmark className="h-8 w-8" />,
    color: "bg-blue-500/20",
    textColor: "text-blue-400",
    status: "pending",
  },
  {
    id: 6,
    title: "Final State",
    description: "Proof verified",
    icon: <CheckCircle2 className="h-8 w-8" />,
    color: "bg-emerald-500/20",
    textColor: "text-emerald-400",
    status: "pending",
  },
];

export function ExecutionVisualizer() {
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(stages[2]);

  return (
    <main className="space-y-6 p-4">
      {/* Header */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Private Execution Path</p>
            <h1 className="font-heading text-2xl font-semibold text-foreground">Simulation</h1>
          </div>
          <button className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors">
            Run Simulation
          </button>
        </div>
      </section>

      {/* Pipeline Visualization */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface/50 p-6">
        <div className="flex justify-between gap-4 min-w-max lg:min-w-0">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-start gap-4 flex-1 min-w-[160px]">
              {/* Stage Card */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedStage(stage)}
                className={`relative w-full rounded-xl border border-border p-4 text-center transition-all ${
                  selectedStage?.id === stage.id
                    ? "ring-2 ring-primary"
                    : ""
                } ${
                  stage.status === "complete"
                    ? `${stage.color} opacity-100`
                    : stage.status === "active"
                      ? `${stage.color} opacity-100 ring-1 ring-offset-2 ring-offset-[#0a0f1a]`
                      : "bg-background/20 opacity-40"
                }`}
              >
                {/* Status Indicator */}
                <div className="mb-3 flex justify-center">
                  {stage.status === "complete" ? (
                    <div className={`${stage.textColor}`}>
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  ) : stage.status === "active" ? (
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={stage.textColor}
                    >
                      {stage.icon}
                    </motion.div>
                  ) : (
                    <div className="h-8 w-8 rounded-full border-2 border-border" />
                  )}
                </div>

                {/* Stage Number */}
                <span className={`text-xs font-semibold ${stage.textColor}`}>
                  Stage {stage.id}
                </span>

                {/* Stage Title */}
                <h4 className="mt-1 font-heading text-sm font-semibold text-foreground">{stage.title}</h4>

                {/* Stage Description */}
                <p className="mt-1 text-xs text-muted">{stage.description}</p>

                {/* PRIVATE/PUBLIC Badge */}
                {stage.id % 2 === 0 ? (
                  <div className="mt-2 rounded px-2 py-1 text-[10px] bg-primary/20 text-primary inline-block">
                    PUBLIC
                  </div>
                ) : (
                  <div className="mt-2 rounded px-2 py-1 text-[10px] bg-red-500/20 text-red-400 inline-block">
                    PRIVATE
                  </div>
                )}
              </motion.button>

              {/* Arrow to next stage */}
              {idx < stages.length - 1 && (
                <div className="flex items-center justify-center">
                  <svg className="h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeDasharray="4 4" d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedStage && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className={selectedStage.textColor}>{selectedStage.icon}</div>
            <div>
              <h3 className="font-heading text-lg font-semibold">{selectedStage.title}</h3>
              <p className="text-xs text-muted">Stage {selectedStage.id} of {stages.length}</p>
            </div>
          </div>

          <p className="mb-4 text-sm text-foreground">{selectedStage.description}</p>

          {selectedStage.id === 1 && (
            <div className="space-y-2 text-xs text-muted">
              <p>• Graph nodes submitted to execution engine</p>
              <p>• 4 nodes detected: Condition, Split, Execute, Constraint</p>
              <p>• Strategy salt: shadowflow</p>
            </div>
          )}

          {selectedStage.id === 2 && (
            <div className="space-y-2 text-xs text-muted">
              <p>• Using Poseidon hash with private salt</p>
              <p>• Commitment: <code className="font-code text-cyan-400">0x3f2a5bc8...</code></p>
              <p>• Hash verified: ✓</p>
            </div>
          )}

          {selectedStage.id === 3 && (
            <div className="space-y-2 text-xs text-muted">
              <p>⚙ Executing strategy steps...</p>
              <p>• Current step: 2 of 4</p>
              <p>• Constraint checks: ALL PASS</p>
              <div className="mt-2 h-1 w-full rounded-full bg-background">
                <div className="h-full w-1/2 rounded-full bg-amber-400" />
              </div>
            </div>
          )}

          {selectedStage.id === 4 && (
            <div className="space-y-2 text-xs text-muted">
              <p>🔒 Generating zero-knowledge proof...</p>
              <p>• Constraints: 3 range proofs, 1 partition</p>
              <p>• Private witness: sealed from verifier</p>
            </div>
          )}

          {selectedStage.id === 5 && (
            <div className="space-y-2 text-xs text-muted">
              <p>📡 On-chain submission to Starknet...</p>
              <p>• Target network: Starknet Testnet</p>
              <p>• Contract: GaragaVerifier</p>
            </div>
          )}

          {selectedStage.id === 6 && (
            <div className="space-y-2 text-xs text-emerald-400">
              <p>✓ Proof verified successfully</p>
              <p>• Nullifier: locked on-chain</p>
              <p>• Execution logs: sealed</p>
            </div>
          )}
        </motion.div>
      )}
    </main>
  );
}
