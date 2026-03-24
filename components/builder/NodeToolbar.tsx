"use client";

import { NODE_CONFIGS } from "@/constants/nodes";
import type { NodeType } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NodeToolbarProps {
  constraintCount?: number;
  estimatedProofSize?: number;
}

export function NodeToolbar({ constraintCount = 0, estimatedProofSize = 0 }: NodeToolbarProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <TooltipProvider>
      <div className="w-[240px] border-r border-border bg-surface p-4">
        <h3 className="mb-4 font-heading text-lg font-bold">ZK Nodes</h3>
        <div className="mb-4 rounded-lg border border-border bg-background p-2 text-xs">
          <p className="font-semibold text-primary">ZK Cost Estimator</p>
          <p className="text-muted">Constraints: {constraintCount}</p>
          <p className="text-muted">Proof size: {estimatedProofSize} bytes</p>
        </div>
        <div className="space-y-3">
          {Object.values(NODE_CONFIGS).map((config) => {
            const Icon = config.icon;
            return (
              <Tooltip key={config.type}>
                <TooltipTrigger asChild>
                  <div
                    draggable
                    onDragStart={(event) => onDragStart(event, config.type)}
                    className="cursor-grab rounded-xl border border-border bg-background p-3 active:cursor-grabbing"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Icon style={{ color: config.color }} className="h-4 w-4" />
                      <span className="font-semibold">{config.label}</span>
                    </div>
                    <p className="text-xs text-muted">{config.zkLabel}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{config.description}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
