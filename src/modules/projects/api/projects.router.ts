import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/core/trpc/init";
import { projects } from "@/core/db/schema/projects.schema";
import { eq, and, like, desc } from "drizzle-orm";
import { existsSync } from "node:fs";
import { convertToWindowsPath, convertToWSLPath } from "@/shared/utils/paths";
import { detectTechStack } from "./techstack";
import { openInVSCode, openTerminal } from "./vscode";
import { getAvailableDrives, listDirectories } from "./filesystem";

/**
 * Normalize a path to WSL format
 * Accepts either Windows (E:\Projects\foo) or WSL (/mnt/e/Projects/foo) paths
 */
function normalizeToWSLPath(inputPath: string): string {
  // Check if it's a Windows path (starts with drive letter like C:\ or D:\)
  if (/^[A-Za-z]:[\\\/]/.test(inputPath)) {
    return convertToWSLPath(inputPath);
  }
  // Already a WSL path or assume it is
  return inputPath;
}

/**
 * Generate a unique ID for projects
 * Format: proj_<timestamp>_<random>
 */
function generateProjectId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `proj_${timestamp}_${random}`;
}

/**
 * Projects Router
 *
 * Handles all project management operations:
 * - list: Get all projects with optional filters
 * - get: Get single project by ID
 * - create: Create new project with auto-detection
 * - update: Update existing project
 * - delete: Delete project
 *
 * Ultra Think Design:
 * - All inputs validated with Zod schemas
 * - Database queries use Drizzle ORM with proper indexes
 * - File system validation before creating projects
 * - Auto-detection of tech stack from package.json
 * - Proper error handling with tRPC error codes
 */
export const projectsRouter = router({
  /**
   * List all projects with optional filters
   *
   * Input:
   * - status?: "active" | "paused" | "completed" - Filter by status
   * - search?: string - Search by name (case-insensitive, partial match)
   *
   * Output: Array of projects ordered by lastAccessed desc
   *
   * Ultra Think:
   * - Uses indexed status and lastAccessed columns for performance
   * - LIKE query for search is acceptable (small dataset, rarely used)
   * - Filters use AND logic (both must match if provided)
   */
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["active", "paused", "completed"]).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters = [];

      // Add status filter if provided
      if (input.status) {
        filters.push(eq(projects.status, input.status));
      }

      // Add search filter if provided (case-insensitive partial match)
      if (input.search && input.search.trim()) {
        filters.push(like(projects.name, `%${input.search.trim()}%`));
      }

      // Execute query with filters
      const result = await ctx.db
        .select()
        .from(projects)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(projects.lastAccessed));

      return result;
    }),

  /**
   * Get single project by ID
   *
   * Input:
   * - id: string - Project ID
   *
   * Output: Single project object
   *
   * Ultra Think:
   * - Primary key lookup (fastest query)
   * - Returns 404 if not found (standard HTTP semantics)
   */
  get: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Project ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Create new project
   *
   * Input:
   * - name: string (1-100 chars) - Project name
   * - pathWSL: string (must start with /mnt/) - WSL path to project
   * - description?: string - Optional description
   * - status?: "active" | "paused" | "completed" - Default: "active"
   *
   * Output: Created project object
   *
   * Ultra Think:
   * 1. Validate pathWSL exists on filesystem (fail fast)
   * 2. Convert to Windows path (may throw if invalid format)
   * 3. Auto-detect tech stack (non-blocking, returns [] if fails)
   * 4. Generate ID and timestamps
   * 5. Insert into database (may fail on unique constraint)
   *
   * Error Cases:
   * - Path doesn't exist → BAD_REQUEST
   * - Path not in WSL format → BAD_REQUEST (from convertToWindowsPath)
   * - Duplicate path → Database will throw unique constraint error
   * - Name too short/long → Zod validation error
   */
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name too long"),
        path: z
          .string()
          .min(1, "Path is required")
          .refine(
            (p) => p.startsWith("/mnt/") || /^[A-Za-z]:[\\\/]/.test(p),
            "Path must be a WSL path (/mnt/...) or Windows path (E:\\...)"
          ),
        description: z.string().optional(),
        status: z.enum(["active", "paused", "completed"]).default("active"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Step 1: Normalize path to WSL format (accepts both Windows and WSL)
      const pathWSL = normalizeToWSLPath(input.path);

      // Step 2: Validate path exists on filesystem
      if (!existsSync(pathWSL)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Path does not exist: ${pathWSL}`,
        });
      }

      // Step 3: Convert to Windows path
      let pathWindows: string;
      try {
        pathWindows = convertToWindowsPath(pathWSL);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Invalid path format",
        });
      }

      // Step 4: Auto-detect tech stack
      const techStack = await detectTechStack(pathWSL);

      // Step 4: Generate ID and timestamps
      const id = generateProjectId();
      const now = new Date().toISOString();

      // Step 5: Insert into database
      try {
        await ctx.db.insert(projects).values({
          id,
          name: input.name,
          description: input.description,
          pathWSL,
          pathWindows,
          techStack,
          status: input.status,
          claudeMd: null, // Will be populated later when scanning
          lastAccessed: now,
          createdAt: now,
          updatedAt: now,
        });

        // Return the created project
        const result = await ctx.db
          .select()
          .from(projects)
          .where(eq(projects.id, id))
          .limit(1);

        return result[0];
      } catch (error) {
        // Handle unique constraint violations
        if (
          error instanceof Error &&
          error.message.includes("UNIQUE constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A project with this path already exists",
          });
        }
        throw error;
      }
    }),

  /**
   * Update existing project
   *
   * Input:
   * - id: string - Project ID
   * - name?: string (1-100 chars) - New name
   * - description?: string - New description
   * - status?: "active" | "paused" | "completed" - New status
   * - pathWSL?: string - New WSL path (will re-detect tech stack)
   *
   * Output: Updated project object
   *
   * Ultra Think:
   * 1. Validate at least one field is being updated
   * 2. If pathWSL changed, validate and convert to Windows path
   * 3. Always update updatedAt timestamp
   * 4. Return 404 if project doesn't exist
   *
   * Note: We don't re-detect tech stack unless path changes
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Project ID is required"),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        status: z.enum(["active", "paused", "completed"]).optional(),
        path: z
          .string()
          .refine(
            (p) => p.startsWith("/mnt/") || /^[A-Za-z]:[\\\/]/.test(p),
            "Path must be a WSL path (/mnt/...) or Windows path (E:\\...)"
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build update object
      const updateData: {
        name?: string;
        description?: string;
        status?: "active" | "paused" | "completed";
        pathWSL?: string;
        pathWindows?: string;
        techStack?: string[];
        updatedAt: string;
      } = {
        updatedAt: new Date().toISOString(),
      };

      // Add fields that are being updated
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;

      // If path is being updated, validate and convert
      if (input.path !== undefined) {
        // Normalize to WSL path (accepts both Windows and WSL)
        const pathWSL = normalizeToWSLPath(input.path);

        // Validate path exists
        if (!existsSync(pathWSL)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Path does not exist: ${pathWSL}`,
          });
        }

        // Convert to Windows path
        try {
          updateData.pathWSL = pathWSL;
          updateData.pathWindows = convertToWindowsPath(pathWSL);
          // Re-detect tech stack for new path
          updateData.techStack = await detectTechStack(pathWSL);
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              error instanceof Error ? error.message : "Invalid path format",
          });
        }
      }

      // Update the project
      try {
        await ctx.db
          .update(projects)
          .set(updateData)
          .where(eq(projects.id, input.id));

        // Return the updated project
        const result = await ctx.db
          .select()
          .from(projects)
          .where(eq(projects.id, input.id))
          .limit(1);

        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Project with ID "${input.id}" not found`,
          });
        }

        return result[0];
      } catch (error) {
        // Handle unique constraint violations
        if (
          error instanceof Error &&
          error.message.includes("UNIQUE constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A project with this path already exists",
          });
        }
        throw error;
      }
    }),

  /**
   * Delete project
   *
   * Input:
   * - id: string - Project ID
   *
   * Output: { success: true }
   *
   * Ultra Think:
   * - Cascade delete will remove related project_structure records
   * - Doesn't fail if project doesn't exist (idempotent)
   */
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Project ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(projects).where(eq(projects.id, input.id));

      return { success: true };
    }),

  /**
   * Open project in VS Code
   *
   * Input:
   * - pathWSL: string - WSL path to project directory
   *
   * Output: { success: boolean, message: string }
   *
   * Ultra Think:
   * - Executes `code <path>` shell command
   * - Path validation prevents shell injection
   * - Updates lastAccessed timestamp on success
   */
  openInVSCode: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Project ID is required"),
        pathWSL: z
          .string()
          .min(1, "Path is required")
          .startsWith("/mnt/", "Path must be a valid WSL path"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await openInVSCode(input.pathWSL);

      if (result.success) {
        // Update lastAccessed timestamp
        await ctx.db
          .update(projects)
          .set({ lastAccessed: new Date().toISOString() })
          .where(eq(projects.id, input.id));
      }

      return result;
    }),

  /**
   * Open terminal in project directory
   *
   * Input:
   * - pathWSL: string - WSL path to project directory
   *
   * Output: { success: boolean, message: string }
   *
   * Ultra Think:
   * - Uses Windows Terminal (wt.exe) via WSL interop
   * - Falls back to cmd.exe if WT not available
   * - Path validation prevents shell injection
   */
  openTerminal: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Project ID is required"),
        pathWSL: z
          .string()
          .min(1, "Path is required")
          .startsWith("/mnt/", "Path must be a valid WSL path"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await openTerminal(input.pathWSL);

      if (result.success) {
        // Update lastAccessed timestamp
        await ctx.db
          .update(projects)
          .set({ lastAccessed: new Date().toISOString() })
          .where(eq(projects.id, input.id));
      }

      return result;
    }),

  /**
   * Get available Windows drives mounted in WSL
   * Returns drives like C:, D:, E: with their /mnt paths
   */
  getDrives: publicProcedure.query(() => {
    return getAvailableDrives();
  }),

  /**
   * Browse directories in a given path
   * Used by the folder picker UI
   */
  browseDirectory: publicProcedure
    .input(
      z.object({
        path: z.string().min(1, "Path is required"),
      })
    )
    .query(({ input }) => {
      // Normalize path if it's a Windows path
      const wslPath = normalizeToWSLPath(input.path);

      if (!existsSync(wslPath)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Directory not found: ${wslPath}`,
        });
      }

      return {
        currentPath: wslPath,
        directories: listDirectories(wslPath),
      };
    }),
});
