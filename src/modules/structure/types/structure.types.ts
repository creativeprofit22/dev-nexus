/**
 * Structure Types
 * Type definitions for project structure entities and operations
 */

// Re-export schema types for convenience
export type {
  FileNode,
  DependencyGraph,
  ComponentNode,
  ProjectComponentProp,
} from "@/core/db/schema/projects.schema";

/**
 * Structure record type (matches projectStructure table)
 */
export interface ProjectStructure {
  id: string;
  projectId: string;
  fileTree: import("@/core/db/schema/projects.schema").FileNode;
  dependencies: import("@/core/db/schema/projects.schema").DependencyGraph;
  components: import("@/core/db/schema/projects.schema").ComponentNode[];
  lastScanned: string;
}

/**
 * Input for scanning project structure
 */
export interface ScanStructureInput {
  projectId: string;
}

/**
 * Input for getting project structure
 */
export interface GetStructureInput {
  projectId: string;
  maxAge?: number; // milliseconds, default 24 hours
}
