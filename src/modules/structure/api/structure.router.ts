import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/core/trpc/init";
import {
  projects,
  projectStructure,
  FileNode,
  DependencyGraph,
  ComponentNode,
} from "@/core/db/schema/projects.schema";
import { eq } from "drizzle-orm";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Generate a unique ID for project structures
 * Format: struct_<timestamp>_<random>
 */
function generateStructureId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `struct_${timestamp}_${random}`;
}

/**
 * Directories to ignore during scanning
 */
const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "__pycache__",
  ".cache",
  "coverage",
];

/**
 * Maximum depth for recursive directory scanning
 */
const MAX_DEPTH = 10;

/**
 * Default max age for structure cache (24 hours)
 */
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Recursively scan a directory and build FileNode tree
 *
 * @param dirPath - Absolute path to scan
 * @param depth - Current recursion depth
 * @returns FileNode tree structure
 */
async function scanDirectory(
  dirPath: string,
  depth: number = 0
): Promise<FileNode> {
  const stats = await fs.stat(dirPath);
  const name = path.basename(dirPath);

  // Handle files
  if (!stats.isDirectory()) {
    return {
      name,
      path: dirPath,
      type: "file",
      size: stats.size,
    };
  }

  // Max depth reached - return empty directory
  if (depth > MAX_DEPTH) {
    return {
      name,
      path: dirPath,
      type: "directory",
      children: [],
    };
  }

  // Read directory contents
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const children: FileNode[] = [];

  for (const entry of entries) {
    // Skip ignored directories and hidden files
    if (IGNORE_DIRS.includes(entry.name) || entry.name.startsWith(".")) {
      continue;
    }

    const childPath = path.join(dirPath, entry.name);
    children.push(await scanDirectory(childPath, depth + 1));
  }

  // Sort: directories first, then files, alphabetically
  children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return {
    name,
    path: dirPath,
    type: "directory",
    children,
  };
}

/**
 * Structure Explorer Router
 *
 * Handles project structure scanning and retrieval:
 * - scan: Scan a project directory and build file tree
 * - get: Get existing structure for a project
 * - getForProject: Get structure with auto-scan if stale
 *
 * Design Notes:
 * - All inputs validated with Zod schemas
 * - Database queries use Drizzle ORM with proper indexes
 * - Proper error handling with tRPC error codes
 * - Type-safe operations matching the database schema
 */
export const structureRouter = router({
  /**
   * Scan a project directory and build file tree
   *
   * Input:
   * - projectId: string - Project ID to scan
   *
   * Output: ProjectStructure record with file tree
   *
   * Design:
   * 1. Lookup project to get path
   * 2. Validate path exists and is accessible
   * 3. Recursively scan directory (max depth 10)
   * 4. Exclude: node_modules, .git, dist, build, .next, __pycache__, .cache, coverage
   * 5. Sort: directories first, then files, alphabetically
   * 6. Upsert into projectStructure table
   */
  scan: publicProcedure
    .input(
      z.object({
        projectId: z.string().min(1, "Project ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Lookup project to get path
      const projectResult = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (projectResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with ID "${input.projectId}" not found`,
        });
      }

      const project = projectResult[0];
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with ID "${input.projectId}" not found`,
        });
      }

      // Validate path exists and is accessible
      try {
        await fs.access(project.pathWSL);
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Project path "${project.pathWSL}" is not accessible`,
        });
      }

      // Scan the directory
      let fileTree: FileNode;
      try {
        fileTree = await scanDirectory(project.pathWSL);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to scan directory: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }

      const now = new Date().toISOString();

      // Check if structure already exists for this project
      const existingStructure = await ctx.db
        .select()
        .from(projectStructure)
        .where(eq(projectStructure.projectId, input.projectId))
        .limit(1);

      if (existingStructure.length > 0 && existingStructure[0]) {
        // Update existing structure
        await ctx.db
          .update(projectStructure)
          .set({
            fileTree,
            lastScanned: now,
          })
          .where(eq(projectStructure.projectId, input.projectId));

        // Return updated structure
        const result = await ctx.db
          .select()
          .from(projectStructure)
          .where(eq(projectStructure.projectId, input.projectId))
          .limit(1);

        return result[0];
      }

      // Create new structure record
      const id = generateStructureId();

      // Default empty values for dependencies and components
      // These can be populated by separate analysis procedures later
      const emptyDependencies: DependencyGraph = {};
      const emptyComponents: ComponentNode[] = [];

      await ctx.db.insert(projectStructure).values({
        id,
        projectId: input.projectId,
        fileTree,
        dependencies: emptyDependencies,
        components: emptyComponents,
        lastScanned: now,
      });

      // Return the created structure
      const result = await ctx.db
        .select()
        .from(projectStructure)
        .where(eq(projectStructure.id, id))
        .limit(1);

      return result[0];
    }),

  /**
   * Get existing structure for a project
   *
   * Input:
   * - projectId: string - Project ID
   *
   * Output: ProjectStructure record or null
   *
   * Design:
   * - Simple lookup by projectId (indexed column)
   * - Returns null if no structure exists (not an error)
   */
  get: publicProcedure
    .input(
      z.object({
        projectId: z.string().min(1, "Project ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(projectStructure)
        .where(eq(projectStructure.projectId, input.projectId))
        .limit(1);

      return result[0] ?? null;
    }),

  /**
   * Get structure with auto-scan if stale
   *
   * Input:
   * - projectId: string - Project ID
   * - maxAge?: number - Max age in milliseconds (default 24h)
   *
   * Output: ProjectStructure record (triggers scan if stale or missing)
   *
   * Design:
   * 1. Check if structure exists
   * 2. If missing or older than maxAge, trigger scan
   * 3. Return fresh structure
   */
  getForProject: publicProcedure
    .input(
      z.object({
        projectId: z.string().min(1, "Project ID is required"),
        maxAge: z.number().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const maxAgeMs = input.maxAge ?? DEFAULT_MAX_AGE_MS;

      // Check if structure exists
      const existingResult = await ctx.db
        .select()
        .from(projectStructure)
        .where(eq(projectStructure.projectId, input.projectId))
        .limit(1);

      const existing = existingResult[0];

      // Determine if we need to rescan
      let needsRescan = false;

      if (!existing) {
        needsRescan = true;
      } else {
        const lastScannedTime = new Date(existing.lastScanned).getTime();
        const age = Date.now() - lastScannedTime;
        needsRescan = age > maxAgeMs;
      }

      // If fresh enough, return existing
      if (!needsRescan && existing) {
        return existing;
      }

      // Need to scan - lookup project to get path
      const projectResult = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (projectResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with ID "${input.projectId}" not found`,
        });
      }

      const project = projectResult[0];
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with ID "${input.projectId}" not found`,
        });
      }

      // Validate path exists and is accessible
      try {
        await fs.access(project.pathWSL);
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Project path "${project.pathWSL}" is not accessible`,
        });
      }

      // Scan the directory
      let fileTree: FileNode;
      try {
        fileTree = await scanDirectory(project.pathWSL);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to scan directory: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }

      const now = new Date().toISOString();

      if (existing) {
        // Update existing structure
        await ctx.db
          .update(projectStructure)
          .set({
            fileTree,
            lastScanned: now,
          })
          .where(eq(projectStructure.projectId, input.projectId));
      } else {
        // Create new structure record
        const id = generateStructureId();
        const emptyDependencies: DependencyGraph = {};
        const emptyComponents: ComponentNode[] = [];

        await ctx.db.insert(projectStructure).values({
          id,
          projectId: input.projectId,
          fileTree,
          dependencies: emptyDependencies,
          components: emptyComponents,
          lastScanned: now,
        });
      }

      // Return the updated/created structure
      const result = await ctx.db
        .select()
        .from(projectStructure)
        .where(eq(projectStructure.projectId, input.projectId))
        .limit(1);

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve structure after scan",
        });
      }

      return result[0];
    }),
});
