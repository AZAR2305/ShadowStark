"use client";

import { motion } from "framer-motion";
import { Handle, Position, type NodeProps } from "reactflow";

import { Badge } from "@/components/ui/badge";
import { colorByType, nodeCardClass } from "@/components/nodes/nodeStyles";

export function ConstraintNode({ data, selected }: NodeProps) {
  const color = colorByType("constraint");

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${nodeCardClass} ${selected ? "ring-2 ring-primary" : ""}`}
      style={{ borderLeft: `5px solid ${color}` }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div className="flex items-center gap-2 border-b border-border p-3 text-sm font-semibold">
        <span style={{ color }}>🔒</span>
        Constraint
      </div>
      <div className="space-y-1 p-3 text-xs text-muted">
        <div>Field: {data.field ?? "maxSlippage"}</div>
        <div>Operator: {data.operator ?? "<="}</div>
        <div>Value: <span className="redacted">████</span></div>
      </div>
      <div className="flex items-center justify-between border-t border-border p-2 text-[10px]">
        <Badge variant="private">PRIVATE 🔒</Badge>
        <Badge variant="public">PUBLIC ✅</Badge>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </motion.div>
  );
}
