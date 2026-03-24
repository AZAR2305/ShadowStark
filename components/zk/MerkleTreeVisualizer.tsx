"use client";
import React, { useMemo } from "react";

import { motion } from "framer-motion";
import { Trees } from "lucide-react";
interface MerkleTreeVisualizerProps {
  root?: bigint;
  leafCount?: number;
  depth?: number;
  highlightedLeaf?: number;
}

/**
 * MerkleTreeVisualizer: SVG visualization of the Merkle tree structure.
 * Shows tree depth levels, animated leaf insertion, and highlights the Merkle path.
 * PRIVATE data (pathElements, pathIndices) remain hidden; only structure shown.
 */
export function MerkleTreeVisualizer({
  root = 123456789n,
  leafCount = 4,
  depth = 3,
  highlightedLeaf,
}: MerkleTreeVisualizerProps) {
  // Limit rendered tree depth to prevent UI overload
  const renderDepth = Math.min(depth, 4);
  const leafsPerLevel = Math.pow(2, renderDepth);

  // SVG dimensions
  const nodeRadius = 16;
  const levelHeight = 80;
  const horizontalSpacing = 40;

  // Calculate SVG dimensions
  const svgWidth = leafsPerLevel * horizontalSpacing + 100;
  const svgHeight = (renderDepth + 1) * levelHeight + 60;

  // Generate tree nodes for visualization (not cryptographic, just structure)
  const nodes = useMemo(() => {
    const treeNodes: {
      x: number;
      y: number;
      level: number;
      index: number;
      hash: string;
      isLeaf: boolean;
      active: boolean;
    }[] = [];

    // Leaves (level 0)
    for (let i = 0; i < Math.min(leafCount, leafsPerLevel); i++) {
      const x = 50 + i * horizontalSpacing;
      const y = svgHeight - 40;
      treeNodes.push({
        x,
        y,
        level: 0,
        index: i,
        hash: `L${i}`,
        isLeaf: true,
        active: i === highlightedLeaf,
      });
    }

    // Parent levels
    for (let level = 1; level <= renderDepth; level++) {
      const nodesAtLevel = Math.pow(2, renderDepth - level);
      for (let i = 0; i < nodesAtLevel; i++) {
        const x = 50 + (i * leafsPerLevel) / nodesAtLevel * horizontalSpacing + horizontalSpacing / 2;
        const y = svgHeight - 40 - level * levelHeight;
        treeNodes.push({
          x,
          y,
          level,
          index: i,
          hash: `H${level}${i}`,
          isLeaf: false,
          active: false,
        });
      }
    }

    return treeNodes;
  }, [leafCount, highlightedLeaf, leafsPerLevel, svgHeight, renderDepth]);

  // Generate edges between parent and children
  const edges = useMemo(() => {
    const edgesArray: { x1: number; y1: number; x2: number; y2: number; active: boolean }[] = [];

    for (const node of nodes) {
      if (node.level === 0) continue;

      const childIndex1 = node.index * 2;
      const childIndex2 = node.index * 2 + 1;

      const leftChild = nodes.find(
        (n) => n.level === node.level - 1 && n.index === childIndex1
      );
      const rightChild = nodes.find(
        (n) => n.level === node.level - 1 && n.index === childIndex2
      );

      if (leftChild) {
        edgesArray.push({
          x1: leftChild.x,
          y1: leftChild.y,
          x2: node.x,
          y2: node.y,
          active: node.active || leftChild.active,
        });
      }

      if (rightChild) {
        edgesArray.push({
          x1: rightChild.x,
          y1: rightChild.y,
          x2: node.x,
          y2: node.y,
          active: node.active || rightChild.active,
        });
      }
    }

    return edgesArray;
  }, [nodes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface p-5"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Trees className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold">Merkle Tree</h3>
          <p className="text-xs text-muted">{leafCount} leaves, {renderDepth} levels</p>
        </div>
      </div>

      {/* SVG */}
      <div className="flex justify-center mb-4">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="bg-background/50 border border-border rounded-lg"
        >
        {/* Draw edges */}
        {edges.map((edge, idx) => (
          <motion.line
            key={`edge-${idx}`}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
              stroke={edge.active ? "#10B981" : "#475569"}
            strokeWidth={edge.active ? 2 : 1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.01 }}
          />
        ))}

        {/* Draw nodes */}
        {nodes.map((node, idx) => (
          <motion.g key={`node-${idx}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: idx * 0.02 }}>
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
                fill={node.active ? "#10B981" : node.isLeaf ? "#1E293B" : "#264653"}
                stroke={node.active ? "#FFFF00" : node.isLeaf ? "#10B981" : "#94A3B8"}
              strokeWidth={node.active ? 2 : 1}
            />

            {/* Node label */}
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fontSize="10"
                fill={node.active ? "#000" : node.isLeaf ? "#10B981" : "#CBD5E1"}
              fontWeight="bold"
            >
              {node.isLeaf ? "L" : "H"}
            </text>
          </motion.g>
        ))}

        {/* Legend */}
          <text x={10} y={20} fontSize="11" fill="#94A3B8">
            ■ Leaf ■ Hash ▓ Active
        </text>
      </svg>
      </div>

      {/* Info */}
      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex justify-between text-xs text-muted">
          <span>Root:</span>
          <code className="text-cyan-400 font-code">0x{root.toString(16).slice(0, 8)}...</code>
        </div>
        <p className="text-xs text-muted">
          {highlightedLeaf !== undefined
            ? `Merkle path from leaf ${highlightedLeaf} to root (PRIVATE — proof data hidden)`
            : "Tree structure (individual hash values hidden for privacy)"}
        </p>
      </div>
    </motion.div>
  );
}
