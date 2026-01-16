/**
 * Project Types
 * Type definitions for project entities and operations
 */

export type ProjectStatus = "active" | "paused" | "completed";

/**
 * Project entity from database
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  pathWSL: string;
  pathWindows: string;
  techStack: string[];
  status: ProjectStatus;
  claudeMd: string | null;
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new project
 * Accepts both WSL paths (/mnt/e/...) and Windows paths (E:\...)
 */
export interface CreateProjectInput {
  name: string;
  path: string; // Accepts WSL or Windows path format
  description?: string;
  status?: ProjectStatus;
}

/**
 * Input for updating an existing project
 * Accepts both WSL paths (/mnt/e/...) and Windows paths (E:\...)
 */
export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  path?: string; // Accepts WSL or Windows path format
}

/**
 * Filters for querying projects
 */
export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
}

/**
 * Result of a project action (open VS Code, open terminal, etc.)
 */
export interface ActionResult {
  success: boolean;
  message: string;
}

/**
 * Input for project actions that need project ID and path
 */
export interface ProjectActionInput {
  id: string;
  pathWSL: string;
}

/**
 * Available path formats for copy operation
 */
export type PathFormat = "wsl" | "windows";
