/**
 * InstancedTreeNodes Component
 * High-performance 3D rendering using InstancedMesh for large file trees
 *
 * Performance benefits:
 * - Single draw call per geometry type (vs N draw calls for N nodes)
 * - Shared geometry and material (vs N instances)
 * - 10-50x performance improvement for 1000+ nodes
 */

"use client";

import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { FileNode } from "./TreeLayout";

// Color mapping for file extensions
const FILE_COLORS: Record<string, string> = {
  ts: "#38bdf8",
  tsx: "#38bdf8",
  js: "#facc15",
  jsx: "#facc15",
  css: "#f472b6",
  scss: "#f472b6",
  json: "#4ade80",
  md: "#a78bfa",
  default: "#94a3b8",
};

const DIRECTORY_COLOR = "#3b82f6";

function getFileColor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_COLORS[ext] || FILE_COLORS["default"] || "#94a3b8";
}

interface NodeData {
  node: FileNode;
  position: [number, number, number];
  color: THREE.Color;
  isDirectory: boolean;
}

interface InstancedTreeNodesProps {
  nodes: FileNode[];
  layouts: Map<string, { position: [number, number, number]; depth: number }>;
  selectedPath?: string | null;
  onNodeClick?: (node: FileNode) => void;
}

/**
 * InstancedMesh component for directories (boxes)
 */
function DirectoryInstances({
  nodeData,
  selectedPath,
  hoveredIndex,
  onHover,
  onClick,
}: {
  nodeData: NodeData[];
  selectedPath?: string | null;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  onClick: (index: number) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Update instance matrices and colors
  useEffect(() => {
    if (!meshRef.current) return;

    nodeData.forEach((data, i) => {
      tempObject.position.set(...data.position);
      tempObject.scale.setScalar(1);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      meshRef.current!.setColorAt(i, data.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [nodeData, tempObject]);

  // Update emissive for hovered/selected states
  useFrame(() => {
    if (!meshRef.current?.instanceColor) return;

    nodeData.forEach((data, i) => {
      const isSelected = data.node.path === selectedPath;
      const isHovered = i === hoveredIndex;

      // Adjust color brightness based on state
      tempColor.copy(data.color);
      if (isSelected) {
        tempColor.multiplyScalar(1.5);
      } else if (isHovered) {
        tempColor.multiplyScalar(1.3);
      }

      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceColor.needsUpdate = true;
  });

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined) {
        onHover(e.instanceId);
        document.body.style.cursor = "pointer";
      }
    },
    [onHover]
  );

  const handlePointerOut = useCallback(() => {
    onHover(null);
    document.body.style.cursor = "auto";
  }, [onHover]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined) {
        onClick(e.instanceId);
      }
    },
    [onClick]
  );

  if (nodeData.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodeData.length]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        vertexColors
        emissive="#000000"
        emissiveIntensity={0.1}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}

/**
 * InstancedMesh component for files (spheres)
 */
function FileInstances({
  nodeData,
  selectedPath,
  hoveredIndex,
  onHover,
  onClick,
}: {
  nodeData: NodeData[];
  selectedPath?: string | null;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  onClick: (index: number) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Update instance matrices and colors
  useEffect(() => {
    if (!meshRef.current) return;

    nodeData.forEach((data, i) => {
      tempObject.position.set(...data.position);
      tempObject.scale.setScalar(1);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      meshRef.current!.setColorAt(i, data.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [nodeData, tempObject]);

  // Update emissive for hovered/selected states
  useFrame(() => {
    if (!meshRef.current?.instanceColor) return;

    nodeData.forEach((data, i) => {
      const isSelected = data.node.path === selectedPath;
      const isHovered = i === hoveredIndex;

      tempColor.copy(data.color);
      if (isSelected) {
        tempColor.multiplyScalar(1.5);
      } else if (isHovered) {
        tempColor.multiplyScalar(1.3);
      }

      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceColor.needsUpdate = true;
  });

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined) {
        onHover(e.instanceId);
        document.body.style.cursor = "pointer";
      }
    },
    [onHover]
  );

  const handlePointerOut = useCallback(() => {
    onHover(null);
    document.body.style.cursor = "auto";
  }, [onHover]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined) {
        onClick(e.instanceId);
      }
    },
    [onClick]
  );

  if (nodeData.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodeData.length]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Reduced tessellation: 8x8 vs 16x16 for performance */}
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshStandardMaterial
        vertexColors
        emissive="#000000"
        emissiveIntensity={0.1}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}

/**
 * Label component - only shown for selected or hovered nodes
 */
function NodeLabel({
  node,
  position,
  isSelected,
  isDirectory,
}: {
  node: FileNode;
  position: [number, number, number];
  isSelected: boolean;
  isDirectory: boolean;
}) {
  const labelPosition: [number, number, number] = [
    position[0],
    position[1] + (isDirectory ? 0.5 : 0.3) + 0.4,
    position[2],
  ];

  return (
    <Html
      position={labelPosition}
      center
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      <div
        style={{
          background: "rgba(15, 17, 21, 0.95)",
          color: isSelected ? "#ffffff" : "#cbd5e1",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          fontFamily: "monospace",
          whiteSpace: "nowrap",
          border: isSelected ? "1px solid #3b82f6" : "1px solid #2d3548",
          maxWidth: "150px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {node.name}
      </div>
    </Html>
  );
}

/**
 * Selection ring for selected node
 */
function SelectionRing({
  position,
  isDirectory,
}: {
  position: [number, number, number];
  isDirectory: boolean;
}) {
  const size = isDirectory ? 0.5 : 0.3;
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[size + 0.2, size + 0.3, 32]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
    </mesh>
  );
}

/**
 * Main InstancedTreeNodes component
 * Renders file tree using instanced meshes for performance
 */
export function InstancedTreeNodes({
  nodes,
  layouts,
  selectedPath,
  onNodeClick,
}: InstancedTreeNodesProps) {
  const [hoveredDirIndex, setHoveredDirIndex] = useState<number | null>(null);
  const [hoveredFileIndex, setHoveredFileIndex] = useState<number | null>(null);

  // Split nodes into directories and files with their data
  const { directories, files } = useMemo(() => {
    const dirs: NodeData[] = [];
    const fileNodes: NodeData[] = [];

    nodes.forEach((node) => {
      const layout = layouts.get(node.path);
      if (!layout) return;

      const isDirectory = node.type === "directory";
      const color = new THREE.Color(
        isDirectory ? DIRECTORY_COLOR : getFileColor(node.name)
      );

      const data: NodeData = {
        node,
        position: layout.position,
        color,
        isDirectory,
      };

      if (isDirectory) {
        dirs.push(data);
      } else {
        fileNodes.push(data);
      }
    });

    return { directories: dirs, files: fileNodes };
  }, [nodes, layouts]);

  // Get hovered/selected node for label display
  const hoveredNode = useMemo(() => {
    if (hoveredDirIndex !== null && directories[hoveredDirIndex]) {
      return directories[hoveredDirIndex];
    }
    if (hoveredFileIndex !== null && files[hoveredFileIndex]) {
      return files[hoveredFileIndex];
    }
    return null;
  }, [hoveredDirIndex, hoveredFileIndex, directories, files]);

  const selectedNode = useMemo(() => {
    if (!selectedPath) return null;
    const dirNode = directories.find((d) => d.node.path === selectedPath);
    if (dirNode) return dirNode;
    return files.find((f) => f.node.path === selectedPath) || null;
  }, [selectedPath, directories, files]);

  // Click handlers
  const handleDirClick = useCallback(
    (index: number) => {
      const node = directories[index];
      if (node && onNodeClick) {
        onNodeClick(node.node);
      }
    },
    [directories, onNodeClick]
  );

  const handleFileClick = useCallback(
    (index: number) => {
      const node = files[index];
      if (node && onNodeClick) {
        onNodeClick(node.node);
      }
    },
    [files, onNodeClick]
  );

  return (
    <>
      {/* Directory instances */}
      <DirectoryInstances
        nodeData={directories}
        selectedPath={selectedPath}
        hoveredIndex={hoveredDirIndex}
        onHover={setHoveredDirIndex}
        onClick={handleDirClick}
      />

      {/* File instances */}
      <FileInstances
        nodeData={files}
        selectedPath={selectedPath}
        hoveredIndex={hoveredFileIndex}
        onHover={setHoveredFileIndex}
        onClick={handleFileClick}
      />

      {/* Selection ring for selected node */}
      {selectedNode && (
        <SelectionRing
          position={selectedNode.position}
          isDirectory={selectedNode.isDirectory}
        />
      )}

      {/* Label for selected node (always visible) */}
      {selectedNode && (
        <NodeLabel
          node={selectedNode.node}
          position={selectedNode.position}
          isSelected={true}
          isDirectory={selectedNode.isDirectory}
        />
      )}

      {/* Label for hovered node (if different from selected) */}
      {hoveredNode && hoveredNode.node.path !== selectedPath && (
        <NodeLabel
          node={hoveredNode.node}
          position={hoveredNode.position}
          isSelected={false}
          isDirectory={hoveredNode.isDirectory}
        />
      )}
    </>
  );
}
