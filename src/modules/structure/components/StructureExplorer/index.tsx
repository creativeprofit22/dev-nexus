/**
 * StructureExplorer Component
 * Main 3D canvas for visualizing file tree structures
 */

"use client";

import { Suspense, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FileTreeNode } from "./FileTreeNode";
import { calculateTreeLayout, type FileNode } from "./TreeLayout";

export type { FileNode };

interface StructureExplorerProps {
  fileTree: FileNode | null;
  isLoading?: boolean;
  onNodeClick?: (node: FileNode) => void;
  selectedPath?: string | null;
}

/** Loading spinner component */
function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0f1115]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading structure...</span>
      </div>
    </div>
  );
}

/** Empty state component */
function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0f1115]">
      <div className="flex flex-col items-center gap-3 text-center px-4">
        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <p className="text-sm text-slate-400">No file structure to display</p>
        <p className="text-xs text-slate-500">
          Select a project to view its structure
        </p>
      </div>
    </div>
  );
}

/** Flatten tree to array for rendering */
function flattenTree(node: FileNode | null): FileNode[] {
  if (!node) return [];
  const nodes: FileNode[] = [node];
  if (node.children) {
    node.children.forEach((child) => {
      nodes.push(...flattenTree(child));
    });
  }
  return nodes;
}

/** Scene content with all nodes */
function SceneContent({
  fileTree,
  selectedPath,
  onNodeClick,
}: {
  fileTree: FileNode;
  selectedPath?: string | null;
  onNodeClick?: (node: FileNode) => void;
}) {
  const layouts = useMemo(() => calculateTreeLayout(fileTree), [fileTree]);
  const nodes = useMemo(() => flattenTree(fileTree), [fileTree]);

  const handleNodeClick = useCallback(
    (node: FileNode) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  return (
    <>
      {nodes.map((node) => {
        const layout = layouts.get(node.path);
        if (!layout) return null;

        return (
          <FileTreeNode
            key={node.path}
            node={node}
            position={layout.position}
            depth={layout.depth}
            isSelected={selectedPath === node.path}
            onClick={() => handleNodeClick(node)}
          />
        );
      })}
    </>
  );
}

export function StructureExplorer({
  fileTree,
  isLoading = false,
  onNodeClick,
  selectedPath,
}: StructureExplorerProps) {
  if (isLoading) {
    return (
      <div className="relative w-full h-full min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!fileTree) {
    return (
      <div className="relative w-full h-full min-h-[400px]">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <Canvas
        camera={{
          position: [8, 6, 8],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: "#0f1115" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={50}
          enablePan
          panSpeed={0.5}
        />

        {/* Scene content */}
        <Suspense fallback={null}>
          <SceneContent
            fileTree={fileTree}
            selectedPath={selectedPath}
            onNodeClick={onNodeClick}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
