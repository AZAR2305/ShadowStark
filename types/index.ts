export type NodeType = "condition" | "split" | "execute" | "constraint";

export interface ConditionData {
  asset: "BTC";
  operator: "<" | ">" | "==";
  price: number; // PRIVATE — never log or transmit
}

export interface SplitData {
  splitCount: number; // PRIVATE — never log or transmit
  splitMode: "equal" | "random";
}

export interface ExecuteData {
  direction: "buy" | "sell";
  amount: number; // PRIVATE — never log or transmit
  delayMs: number; // PRIVATE — never log or transmit
}

export interface ConstraintData {
  field: string;
  operator: "<" | ">" | "==" | ">=" | "<=";
  value: number; // PRIVATE — never log or transmit
}

export interface StrategyNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: ConditionData | SplitData | ExecuteData | ConstraintData;
}

export interface NodeGraph {
  nodes: StrategyNode[];
  edges: { id: string; source: string; target: string }[];
}

export interface Strategy {
  id: string;
  graph: NodeGraph;
  salt: string;
  createdAt: number;
}

export interface ZKConstraint {
  nodeId: string;
  constraintType: "range_check" | "sum_partition" | "state_transition" | "assertion";
  publicInputs: string[];
  privateWitness: string[]; // PRIVATE — never log or transmit
}

export interface ZKProof {
  proofHash: string;
  commitment: string;
  finalStateHash: string;
  publicInputs: string[];
  verified: boolean;
}

export interface ExecutionLog {
  stepIndex: number;
  nodeId: string;
  action: "CONDITION_CHECK" | "SPLIT" | "EXECUTE" | "CONSTRAINT_PASS" | "DELAY";
  maskedAmount: string;
  timestamp: number; // PRIVATE — never log or transmit
  constraintsSatisfied: boolean;
}
