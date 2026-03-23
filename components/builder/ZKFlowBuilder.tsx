"use client";

import "reactflow/dist/style.css";

import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import { nanoid } from "nanoid";

import { ConditionNode } from "@/components/nodes/ConditionNode";
import { ConstraintNode } from "@/components/nodes/ConstraintNode";
import { ExecuteNode } from "@/components/nodes/ExecuteNode";
import { SplitNode } from "@/components/nodes/SplitNode";
import { useStrategyStore } from "@/store/strategyStore";
import { GraphValidator } from "@/components/builder/GraphValidator";
import { CompileButton } from "@/components/builder/CompileButton";
import { NodeToolbar } from "@/components/builder/NodeToolbar";
import { NodeConfigPanel } from "@/components/builder/NodeConfigPanel";
import { validateGraphAsDag } from "@/lib/graphCompiler";

const nodeTypes: NodeTypes = {
  condition: ConditionNode,
  split: SplitNode,
  execute: ExecuteNode,
  constraint: ConstraintNode,
};

export function ZKFlowBuilder() {
  const { graph, selectedNodeId, setSelectedNode, addNode, updateNodeData, updateNodePosition, addEdge: addStoreEdge, setCommitment } =
    useStrategyStore();

  const [toast, setToast] = useState<string | null>(null);

  const nodes: Node[] = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        data: node.data,
      })),
    [graph.nodes],
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((edge) => ({
        ...edge,
        animated: true,
        style: { strokeDasharray: 5, stroke: "#00FF88" },
      })),
    [graph.edges],
  );

  const onConnect = (params: Edge | Connection) => {
    if (!params.source || !params.target) {
      return;
    }
    const withId = { ...params, id: `${params.source}-${params.target}-${nanoid(4)}` };
    addStoreEdge({ source: withId.source!, target: withId.target!, id: withId.id });
  };

  const onNodesChange: OnNodesChange = (changes) => {
    const nextNodes = applyNodeChanges(changes, nodes);
    nextNodes.forEach((node) => {
      const original = graph.nodes.find((item) => item.id === node.id);
      if (!original || original.position.x !== node.position.x || original.position.y !== node.position.y) {
        updateNodePosition(node.id, node.position);
      }
    });
  };

  const onEdgesChange: OnEdgesChange = (changes) => {
    const next = applyEdgeChanges(changes, edges);
    next.forEach((edge) => {
      if (!graph.edges.find((item) => item.id === edge.id) && edge.source && edge.target) {
        addStoreEdge({ id: edge.id, source: edge.source, target: edge.target });
      }
    });
  };

  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId) ?? null;
  const validation = validateGraphAsDag(graph);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow") as
      | "condition"
      | "split"
      | "execute"
      | "constraint";
    if (!type) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    addNode(type, {
      x: event.clientX - bounds.left - 90,
      y: event.clientY - bounds.top - 24,
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex min-h-0 flex-1">
        <NodeToolbar />

        <div className="relative flex-1" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            fitView
          >
            <Background color="#1E1E32" gap={16} />
            <MiniMap position="bottom-right" pannable zoomable />
            <Controls position="bottom-left" />
          </ReactFlow>

          {!nodes.length ? (
            <div className="pointer-events-none absolute inset-8 flex items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
              Drag nodes to start building
            </div>
          ) : null}

          {toast ? (
            <div className="absolute right-4 top-4 rounded-lg border border-primary/50 bg-surface px-3 py-2 text-xs text-primary">
              {toast}
            </div>
          ) : null}
        </div>

        <NodeConfigPanel node={selectedNode} onUpdate={updateNodeData} />
      </div>

      <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-3">
        <GraphValidator graph={graph} />
        <CompileButton
          disabled={!validation.valid}
          strategy={{ id: "local-strategy", graph, salt: "shadowflow", createdAt: Date.now() }}
          onCompiled={(commitment) => {
            setCommitment(commitment);
            setToast(`Commitment stored locally: ${commitment.slice(0, 14)}...`);
            setTimeout(() => setToast(null), 2500);
          }}
        />
      </div>
    </div>
  );
}
