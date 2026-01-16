/**
 * TreeLayout Component
 * Calculates 3D positions for file tree nodes using a radial tree layout
 */

"use client";

import { useMemo } from "react";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: FileNode[];
}

/**
 * Calculate 3D positions for all nodes in the file tree
 * Uses a semi-circular arc layout for children at each depth level
 */
export function calculateTreeLayout(
  root: FileNode | null,
  options: {
    horizontalSpacing?: number;
    verticalSpacing?: number;
  } = {}
): Map<string, { position: [number, number, number]; depth: number }> {
  const { horizontalSpacing = 3, verticalSpacing = 2.5 } = options;

  const positions = new Map<
    string,
    { position: [number, number, number]; depth: number }
  >();

  if (!root) return positions;

  function layoutNode(
    node: FileNode,
    depth: number,
    angleStart: number,
    angleEnd: number,
    parentX: number,
    parentZ: number
  ) {
    // Calculate position based on depth and angle
    const angle = (angleStart + angleEnd) / 2;

    const x = depth === 0 ? 0 : parentX + Math.sin(angle) * horizontalSpacing;
    const y = -depth * verticalSpacing;
    const z = depth === 0 ? 0 : parentZ + Math.cos(angle) * horizontalSpacing;

    positions.set(node.path, {
      position: [x, y, z],
      depth,
    });

    // Layout children in a semi-circular arc
    if (node.children && node.children.length > 0) {
      const childCount = node.children.length;
      const arcSpan = Math.min(Math.PI * 0.8, (childCount * Math.PI) / 6);
      const startAngle = angle - arcSpan / 2;

      node.children.forEach((child, index) => {
        const childAngleStart =
          startAngle + (index / Math.max(childCount - 1, 1)) * arcSpan;
        const childAngleEnd =
          startAngle + ((index + 1) / Math.max(childCount, 1)) * arcSpan;

        layoutNode(child, depth + 1, childAngleStart, childAngleEnd, x, z);
      });
    }
  }

  layoutNode(root, 0, -Math.PI / 2, Math.PI / 2, 0, 0);

  return positions;
}

interface TreeLayoutProps {
  fileTree: FileNode | null;
  children: (
    layouts: Map<string, { position: [number, number, number]; depth: number }>
  ) => React.ReactNode;
}

/**
 * TreeLayout component that provides calculated positions to children
 */
export function TreeLayout({ fileTree, children }: TreeLayoutProps) {
  const layouts = useMemo(() => calculateTreeLayout(fileTree), [fileTree]);

  return <>{children(layouts)}</>;
}
