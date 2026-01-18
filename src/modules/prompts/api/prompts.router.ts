import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/core/trpc/init";
import { prompts } from "@/core/db/schema/prompts.schema";
import { versions } from "@/core/db/schema/versions.schema";
import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";
import type { PromptCategory } from "../types/prompt.types";

/**
 * Extract variables from prompt content
 * Detects patterns like {{variable_name}} and returns unique variable names
 *
 * Examples:
 * - "Hello {{name}}" → ["name"]
 * - "{{greeting}} {{name}}!" → ["greeting", "name"]
 * - "No variables here" → []
 */
function extractVariables(content: string): string[] {
  const variablePattern = /\{\{(\w+)\}\}/g;
  const matches = content.matchAll(variablePattern);
  const variables = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables);
}

/**
 * Generate a unique ID for prompts
 * Format: prompt_<timestamp>_<random>
 */
function generatePromptId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `prompt_${timestamp}_${random}`;
}

/**
 * Generate a unique ID for versions
 * Format: version_<timestamp>_<random>
 */
function generateVersionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `version_${timestamp}_${random}`;
}

/**
 * Prompts Router
 *
 * Handles all prompt library operations:
 * - list: Get all prompts with search/filter capabilities
 * - get: Get single prompt by ID
 * - create: Create new prompt with auto-variable detection
 * - update: Update existing prompt (re-detects variables)
 * - delete: Delete prompt
 * - duplicate: Create a copy of an existing prompt
 * - incrementUsage: Track prompt usage statistics
 *
 * Ultra Think Design:
 * - All inputs validated with Zod schemas
 * - Variable detection runs on create/update
 * - Fuzzy search across title and content
 * - Indexed queries for performance (category, projectId, usageCount)
 * - Proper error handling with tRPC error codes
 */
export const promptsRouter = router({
  /**
   * List all prompts with optional filters and sorting
   *
   * Input:
   * - category?: PromptCategory - Filter by category
   * - tags?: string[] - Filter by tags (any match)
   * - projectId?: string - Filter by project
   * - search?: string - Fuzzy search on title and content
   * - sortBy?: string - Sort field (default: updatedAt)
   * - sortOrder?: "asc" | "desc" - Sort direction (default: desc)
   * - limit?: number - Max results (default: 50, max: 100)
   * - offset?: number - Pagination offset (default: 0)
   *
   * Output: { prompts: Prompt[], total: number, hasMore: boolean }
   *
   * Ultra Think:
   * - Uses indexed columns (category, projectId) for fast filtering
   * - LIKE queries for search (acceptable for small datasets)
   * - Tag filtering uses JSON contains check
   * - Pagination prevents memory issues with large datasets
   */
  list: publicProcedure
    .input(
      z.object({
        category: z
          .enum([
            "claude",
            "code",
            "architecture",
            "testing",
            "documentation",
            "debugging",
            "refactoring",
            "review",
            "general",
          ])
          .optional(),
        tags: z.array(z.string()).optional(),
        projectId: z.string().optional(),
        search: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "updatedAt", "lastUsed", "usageCount", "title"])
          .default("updatedAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters = [];

      // Add category filter if provided
      if (input.category) {
        filters.push(eq(prompts.category, input.category));
      }

      // Add projectId filter if provided
      if (input.projectId) {
        filters.push(eq(prompts.projectId, input.projectId));
      }

      // Add search filter if provided (fuzzy search on title and content)
      if (input.search && input.search.trim()) {
        const searchTerm = `%${input.search.trim()}%`;
        filters.push(
          or(like(prompts.title, searchTerm), like(prompts.content, searchTerm))
        );
      }

      // Add tag filter if provided (check if any tag matches)
      // Note: SQLite JSON support is limited, so we do string contains check
      if (input.tags && input.tags.length > 0) {
        const tagFilters = input.tags.map((tag) =>
          like(prompts.tags, `%"${tag}"%`)
        );
        filters.push(or(...tagFilters));
      }

      // Build order by clause
      const orderByColumn = prompts[input.sortBy];
      const orderByFn = input.sortOrder === "asc" ? asc : desc;

      // Execute query with filters and pagination
      const result = await ctx.db
        .select()
        .from(prompts)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(orderByFn(orderByColumn))
        .limit(input.limit + 1) // Fetch one extra to check if there are more
        .offset(input.offset);

      // Get total count for pagination
      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(prompts)
        .where(filters.length > 0 ? and(...filters) : undefined);

      const total = countResult[0]?.count ?? 0;
      const hasMore = result.length > input.limit;

      // Remove the extra item if we fetched more than limit
      if (hasMore) {
        result.pop();
      }

      return {
        prompts: result,
        total,
        hasMore,
      };
    }),

  /**
   * Get single prompt by ID
   *
   * Input:
   * - id: string - Prompt ID
   *
   * Output: Single prompt object
   *
   * Ultra Think:
   * - Primary key lookup (fastest query)
   * - Returns 404 if not found (standard HTTP semantics)
   */
  get: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Prompt ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(prompts)
        .where(eq(prompts.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Prompt with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Create new prompt
   *
   * Input:
   * - title: string (1-200 chars) - Prompt title
   * - content: string (min 1 char) - Prompt content (supports markdown and {{variables}})
   * - category: PromptCategory - Prompt category
   * - tags?: string[] - Optional tags
   * - projectId?: string - Optional project link
   *
   * Output: Created prompt object
   *
   * Ultra Think:
   * 1. Validate input (Zod handles this)
   * 2. Auto-detect variables from content
   * 3. Generate ID and timestamps
   * 4. Insert into database
   * 5. Return created prompt
   *
   * Variable Detection:
   * - Scans content for {{variable_name}} patterns
   * - Extracts unique variable names
   * - Stores in variables array for UI autocomplete
   */
  create: publicProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(1, "Title is required")
          .max(200, "Title too long"),
        content: z.string().min(1, "Content is required"),
        category: z.enum([
          "claude",
          "code",
          "architecture",
          "testing",
          "documentation",
          "debugging",
          "refactoring",
          "review",
          "general",
        ]),
        tags: z.array(z.string()).default([]),
        projectId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Step 1: Auto-detect variables from content
      const variables = extractVariables(input.content);

      // Step 2: Generate ID and timestamps
      const id = generatePromptId();
      const now = new Date().toISOString();

      // Step 3: Insert into database
      await ctx.db.insert(prompts).values({
        id,
        title: input.title,
        content: input.content,
        category: input.category,
        tags: input.tags,
        variables,
        projectId: input.projectId ?? null,
        usageCount: 0,
        lastUsed: null,
        createdAt: now,
        updatedAt: now,
      });

      // Step 4: Return the created prompt
      const result = await ctx.db
        .select()
        .from(prompts)
        .where(eq(prompts.id, id))
        .limit(1);

      return result[0];
    }),

  /**
   * Update existing prompt
   *
   * Input:
   * - id: string - Prompt ID
   * - title?: string (1-200 chars) - New title
   * - content?: string - New content (re-detects variables)
   * - category?: PromptCategory - New category
   * - tags?: string[] - New tags
   * - projectId?: string | null - New project link (null to unlink)
   *
   * Output: Updated prompt object
   *
   * Ultra Think:
   * 1. Validate at least one field is being updated
   * 2. If content changed, re-detect variables
   * 3. Always update updatedAt timestamp
   * 4. Return 404 if prompt doesn't exist
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Prompt ID is required"),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(1).optional(),
        category: z
          .enum([
            "claude",
            "code",
            "architecture",
            "testing",
            "documentation",
            "debugging",
            "refactoring",
            "review",
            "general",
          ])
          .optional(),
        tags: z.array(z.string()).optional(),
        projectId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build update object
      const updateData: {
        title?: string;
        content?: string;
        category?: PromptCategory;
        tags?: string[];
        projectId?: string | null;
        variables?: string[];
        updatedAt: string;
      } = {
        updatedAt: new Date().toISOString(),
      };

      // Add fields that are being updated
      if (input.title !== undefined) updateData.title = input.title;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.projectId !== undefined) updateData.projectId = input.projectId;

      // If content is being updated, re-detect variables
      if (input.content !== undefined) {
        updateData.content = input.content;
        updateData.variables = extractVariables(input.content);
      }

      // Update the prompt
      await ctx.db
        .update(prompts)
        .set(updateData)
        .where(eq(prompts.id, input.id));

      // Return the updated prompt
      const result = await ctx.db
        .select()
        .from(prompts)
        .where(eq(prompts.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Prompt with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Delete prompt
   *
   * Input:
   * - id: string - Prompt ID
   *
   * Output: { success: true }
   *
   * Ultra Think:
   * - Doesn't fail if prompt doesn't exist (idempotent)
   * - No cascade needed (prompts don't have child records)
   */
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Prompt ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(prompts).where(eq(prompts.id, input.id));

      return { success: true };
    }),

  /**
   * Duplicate an existing prompt
   *
   * Input:
   * - id: string - Prompt ID to duplicate
   * - title?: string - Optional override for duplicated title
   *
   * Output: Newly created duplicate prompt
   *
   * Ultra Think:
   * 1. Fetch original prompt
   * 2. Create new prompt with same content
   * 3. Append " (Copy)" to title if no override provided
   * 4. Reset usage stats (usageCount = 0, lastUsed = null)
   */
  duplicate: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Prompt ID is required"),
        title: z.string().min(1).max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Step 1: Fetch original prompt
      const original = await ctx.db
        .select()
        .from(prompts)
        .where(eq(prompts.id, input.id))
        .limit(1);

      if (original.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Prompt with ID "${input.id}" not found`,
        });
      }

      const originalPrompt = original[0]!;

      // Step 2: Generate new ID and timestamps
      const id = generatePromptId();
      const now = new Date().toISOString();

      // Step 3: Determine title for duplicate
      const duplicateTitle = input.title ?? `${originalPrompt.title} (Copy)`;

      // Step 4: Insert duplicate prompt
      await ctx.db.insert(prompts).values({
        id,
        title: duplicateTitle,
        content: originalPrompt.content,
        category: originalPrompt.category,
        tags: originalPrompt.tags,
        variables: originalPrompt.variables,
        projectId: originalPrompt.projectId,
        usageCount: 0, // Reset usage stats
        lastUsed: null,
        createdAt: now,
        updatedAt: now,
      });

      // Step 5: Return the duplicate prompt
      const result = await ctx.db
        .select()
        .from(prompts)
        .where(eq(prompts.id, id))
        .limit(1);

      return result[0]!;
    }),

  /**
   * Increment usage count for a prompt
   *
   * Input:
   * - id: string - Prompt ID
   *
   * Output: { success: true, usageCount: number, lastUsed: string }
   *
   * Ultra Think:
   * - Atomic increment operation
   * - Updates lastUsed timestamp
   * - Used to track frequently used prompts
   */
  incrementUsage: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, "Prompt ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      // Update usage count and lastUsed timestamp
      await ctx.db
        .update(prompts)
        .set({
          usageCount: sql`${prompts.usageCount} + 1`,
          lastUsed: now,
        })
        .where(eq(prompts.id, input.id));

      // Fetch updated values
      const result = await ctx.db
        .select()
        .from(prompts)
        .where(eq(prompts.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Prompt with ID "${input.id}" not found`,
        });
      }

      const updated = result[0]!;

      return {
        success: true,
        usageCount: updated.usageCount,
        lastUsed: updated.lastUsed,
      };
    }),

  /**
   * Create a version snapshot of a prompt
   *
   * Input:
   * - promptId: string - ID of the prompt to snapshot
   *
   * Output: Created version object
   *
   * Ultra Think:
   * 1. Fetch current prompt state
   * 2. Generate version ID and timestamp
   * 3. Store snapshot with entityType="prompt"
   * 4. Return created version
   *
   * Use Case:
   * - Call before updating a prompt to preserve current state
   * - Enables undo/restore functionality
   */
  createVersion: publicProcedure
    .input(
      z.object({
        promptId: z.string().min(1, "Prompt ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Step 1: Fetch current prompt state
      const promptResult = await ctx.db
        .select()
        .from(prompts)
        .where(eq(prompts.id, input.promptId))
        .limit(1);

      if (promptResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Prompt with ID "${input.promptId}" not found`,
        });
      }

      const prompt = promptResult[0]!;

      // Step 2: Generate version ID and timestamp
      const versionId = generateVersionId();
      const now = new Date().toISOString();

      // Step 3: Store snapshot
      await ctx.db.insert(versions).values({
        id: versionId,
        entityType: "prompt",
        entityId: input.promptId,
        title: prompt.title,
        content: prompt.content,
        createdAt: now,
      });

      // Step 4: Return created version
      const result = await ctx.db
        .select()
        .from(versions)
        .where(eq(versions.id, versionId))
        .limit(1);

      return result[0]!;
    }),

  /**
   * List all versions for a prompt
   *
   * Input:
   * - promptId: string - ID of the prompt
   * - limit?: number - Max results (default: 50, max: 100)
   * - offset?: number - Pagination offset (default: 0)
   *
   * Output: { versions: Version[], total: number, hasMore: boolean }
   *
   * Ultra Think:
   * - Uses composite index (entityType, entityId) for fast lookup
   * - Sorted by createdAt DESC (newest first)
   * - Pagination for large version histories
   */
  listVersions: publicProcedure
    .input(
      z.object({
        promptId: z.string().min(1, "Prompt ID is required"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Build filter conditions
      const filters = [
        eq(versions.entityType, "prompt"),
        eq(versions.entityId, input.promptId),
      ];

      // Execute query with filters and pagination
      const result = await ctx.db
        .select()
        .from(versions)
        .where(and(...filters))
        .orderBy(desc(versions.createdAt))
        .limit(input.limit + 1) // Fetch one extra to check if there are more
        .offset(input.offset);

      // Get total count for pagination
      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(versions)
        .where(and(...filters));

      const total = countResult[0]?.count ?? 0;
      const hasMore = result.length > input.limit;

      // Remove the extra item if we fetched more than limit
      if (hasMore) {
        result.pop();
      }

      return {
        versions: result,
        total,
        hasMore,
      };
    }),

  /**
   * Restore a prompt to a previous version
   *
   * Input:
   * - versionId: string - ID of the version to restore
   *
   * Output: Restored prompt object
   *
   * Ultra Think:
   * 1. Fetch the version to restore
   * 2. Validate it's a prompt version
   * 3. Create a new version snapshot of CURRENT state (before restoring)
   * 4. Update the prompt with title/content from version
   * 5. Return the restored prompt
   *
   * Safety:
   * - Always creates a backup snapshot before restoring
   * - User can undo the restore by restoring the backup
   */
  restoreVersion: publicProcedure
    .input(
      z.object({
        versionId: z.string().min(1, "Version ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Step 1: Fetch the version to restore
      const versionResult = await ctx.db
        .select()
        .from(versions)
        .where(eq(versions.id, input.versionId))
        .limit(1);

      if (versionResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Version with ID "${input.versionId}" not found`,
        });
      }

      const version = versionResult[0]!;

      // Step 2: Validate it's a prompt version
      if (version.entityType !== "prompt") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Version "${input.versionId}" is not a prompt version`,
        });
      }

      // Step 3: Fetch current prompt state (to create backup)
      const promptResult = await ctx.db
        .select()
        .from(prompts)
        .where(eq(prompts.id, version.entityId))
        .limit(1);

      if (promptResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Prompt with ID "${version.entityId}" no longer exists`,
        });
      }

      const currentPrompt = promptResult[0]!;

      // Step 4: Create backup snapshot of current state
      const backupVersionId = generateVersionId();
      const now = new Date().toISOString();

      await ctx.db.insert(versions).values({
        id: backupVersionId,
        entityType: "prompt",
        entityId: version.entityId,
        title: currentPrompt.title,
        content: currentPrompt.content,
        createdAt: now,
      });

      // Step 5: Update prompt with title/content from version
      // Re-detect variables from restored content
      const restoredVariables = extractVariables(version.content);

      await ctx.db
        .update(prompts)
        .set({
          title: version.title,
          content: version.content,
          variables: restoredVariables,
          updatedAt: now,
        })
        .where(eq(prompts.id, version.entityId));

      // Step 6: Return the restored prompt
      const result = await ctx.db
        .select()
        .from(prompts)
        .where(eq(prompts.id, version.entityId))
        .limit(1);

      return result[0]!;
    }),
});
