/**
 * Flow Types
 * Type definitions for flow entities and operations
 */

import type {
  ReactFlowNode,
  ReactFlowEdge,
} from "@/core/db/schema/flows.schema";

export type { ReactFlowNode, ReactFlowEdge };

/**
 * Flow node types for the Flow Mapper
 */
export type FlowNodeType = "screen" | "decision" | "action" | "apiCall";

/**
 * Data structure for flow nodes
 * Uses index signature for ReactFlow compatibility
 */
export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
}

/**
 * Viewport state for the canvas
 */
export interface FlowViewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Flow entity from database
 */
export interface Flow {
  id: string;
  name: string;
  description: string | null;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  viewport: FlowViewport;
  thumbnail: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new flow
 */
export interface CreateFlowInput {
  name: string;
  description?: string;
  projectId?: string;
}

/**
 * Input for updating an existing flow
 */
export interface UpdateFlowInput {
  id: string;
  name?: string;
  description?: string;
  nodes?: ReactFlowNode[];
  edges?: ReactFlowEdge[];
}

/**
 * Filters for querying flows
 */
export interface FlowFilters {
  projectId?: string;
  search?: string;
}
