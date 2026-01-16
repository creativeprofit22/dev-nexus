/**
 * FileTreeNode Component
 * Individual 3D node representation for files and directories
 */

"use client";

import { useState, useRef } from "react";
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

export interface FileTreeNodeProps {
  node: FileNode;
  position: [number, number, number];
  isSelected?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
  depth?: number;
}

export function FileTreeNode({
  node,
  position,
  isSelected = false,
  onClick,
}: FileTreeNodeProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const isDirectory = node.type === "directory";
  const color = isDirectory ? DIRECTORY_COLOR : getFileColor(node.name);
  const scale = hovered ? 1.15 : 1;

  // Size based on type
  const baseSize = isDirectory ? 0.5 : 0.3;

  return (
    <group position={position}>
      {/* Node geometry */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        scale={scale}
      >
        {isDirectory ? (
          <boxGeometry args={[baseSize, baseSize, baseSize]} />
        ) : (
          <sphereGeometry args={[baseSize, 16, 16]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[baseSize + 0.2, baseSize + 0.3, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Label using drei Html */}
      <Html
        position={[0, baseSize + 0.4, 0]}
        center
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            background: "rgba(15, 17, 21, 0.85)",
            color: isSelected ? "#ffffff" : "#cbd5e1",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "10px",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            border: isSelected ? "1px solid #3b82f6" : "1px solid #2d3548",
            maxWidth: "120px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {node.name}
        </div>
      </Html>
    </group>
  );
}
