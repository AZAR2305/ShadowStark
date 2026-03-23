import type { LucideIcon } from "lucide-react";
import { GitBranch, Lock, Split, Zap } from "lucide-react";

import type { NodeType } from "@/types";

export interface NodeConfig {
  type: NodeType;
  label: string;
  color: string;
  icon: LucideIcon;
  zkLabel: string;
  description: string;
}

export const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  condition: {
    type: "condition",
    label: "Condition",
    color: "#00FF88",
    icon: GitBranch,
    zkLabel: "Range Check",
    description: "Evaluates BTC threshold conditions inside private witness",
  },
  split: {
    type: "split",
    label: "Split",
    color: "#FF6B35",
    icon: Split,
    zkLabel: "Partition",
    description: "Splits order flow into randomized private partitions",
  },
  execute: {
    type: "execute",
    label: "Execute",
    color: "#4FC3F7",
    icon: Zap,
    zkLabel: "State Transition",
    description: "Applies deterministic buy/sell transition logic",
  },
  constraint: {
    type: "constraint",
    label: "Constraint",
    color: "#CE93D8",
    icon: Lock,
    zkLabel: "Assertion",
    description: "Asserts private constraints in zero knowledge",
  },
};
