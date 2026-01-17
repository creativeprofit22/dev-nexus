import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/core/trpc/init";
import { notes } from "@/core/db/schema/notes.schema";
import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";

/**
 * Generate a unique ID for notes
 * Format: note_<timestamp>_<random>
 */
function generateNoteId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `note_${timestamp}_${random}`;
}

/**
 * Notes Router
 *
 * Handles all note operations:
 * - list: Get all notes with search/filter capabilities
 * - getById: Get single note by ID
 * - create: Create new note
 * - update: Update existing note
 * - delete: Delete note
 * - duplicate: Create a copy of an existing note
 * - togglePin: Toggle isPinned status
 *
 * Design:
 * - All inputs validated with Zod schemas
 * - Fuzzy search across title and content
 * - Filter by tags, projectId, isPinned
 * - Sort by isPinned first, then by updatedAt desc
 * - Indexed queries for performance
 * - Protected procedures (authentication required)
 */
export const notesRouter = router({
  /**
   * List all notes with optional filters and sorting
   *
   * Input:
   * - tags?: string[] - Filter by tags (any match)
   * - search?: string - Fuzzy search on title and content
   * - projectId?: string - Filter by project
   * - isPinned?: boolean - Filter by pinned status
   * - sortBy?: string - Sort field (default: updatedAt)
   * - sortOrder?: "asc" | "desc" - Sort direction (default: desc)
   * - limit?: number - Max results (default: 50, max: 100)
   * - offset?: number - Pagination offset (default: 0)
   *
   * Output: { notes: Note[], total: number, hasMore: boolean }
   *
   * Note: Pinned notes are always shown first, regardless of sort settings
   */
  list: protectedProcedure
    .input(
      z.object({
        tags: z.array(z.string()).optional(),
        search: z.string().optional(),
        projectId: z.string().optional(),
        isPinned: z.boolean().optional(),
        sortBy: z
          .enum(["createdAt", "updatedAt", "title"])
          .default("updatedAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters = [];

      // Add projectId filter if provided
      if (input.projectId) {
        filters.push(eq(notes.projectId, input.projectId));
      }

      // Add isPinned filter if provided
      if (input.isPinned !== undefined) {
        filters.push(eq(notes.isPinned, input.isPinned));
      }

      // Add search filter if provided (fuzzy search on title and content)
      if (input.search && input.search.trim()) {
        const searchTerm = `%${input.search.trim()}%`;
        filters.push(
          or(like(notes.title, searchTerm), like(notes.content, searchTerm))
        );
      }

      // Add tag filter if provided (check if any tag matches)
      // SQLite JSON support is limited, so we do string contains check
      if (input.tags && input.tags.length > 0) {
        const tagFilters = input.tags.map((tag) =>
          like(notes.tags, `%"${tag}"%`)
        );
        filters.push(or(...tagFilters));
      }

      // Build order by clause - pinned notes first, then by selected sort
      const orderByColumn = notes[input.sortBy];
      const orderByFn = input.sortOrder === "asc" ? asc : desc;

      // Execute query with filters and pagination
      // Order by: isPinned DESC (true first), then by selected column
      const result = await ctx.db
        .select()
        .from(notes)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(notes.isPinned), orderByFn(orderByColumn))
        .limit(input.limit + 1) // Fetch one extra to check if there are more
        .offset(input.offset);

      // Get total count for pagination
      const countResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(notes)
        .where(filters.length > 0 ? and(...filters) : undefined);

      const total = countResult[0]?.count ?? 0;
      const hasMore = result.length > input.limit;

      // Remove the extra item if we fetched more than limit
      if (hasMore) {
        result.pop();
      }

      return {
        notes: result,
        total,
        hasMore,
      };
    }),

  /**
   * Get single note by ID
   *
   * Input:
   * - id: string - Note ID
   *
   * Output: Single note object
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Note ID is required"),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(notes)
        .where(eq(notes.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Note with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Create new note
   *
   * Input:
   * - title: string (1-500 chars) - Note title
   * - content: string (min 1 char) - Note content (Tiptap JSON or HTML)
   * - tags?: string[] - Optional tags
   * - projectId?: string - Optional project link
   * - isPinned?: boolean - Pin status (default: false)
   *
   * Output: Created note object
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(1, "Title is required")
          .max(500, "Title too long"),
        content: z.string().min(1, "Content is required"),
        tags: z.array(z.string()).default([]),
        projectId: z.string().optional(),
        isPinned: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate ID and timestamps
      const id = generateNoteId();
      const now = new Date().toISOString();

      // Insert into database
      await ctx.db.insert(notes).values({
        id,
        title: input.title,
        content: input.content,
        tags: input.tags,
        projectId: input.projectId ?? null,
        isPinned: input.isPinned,
        createdAt: now,
        updatedAt: now,
      });

      // Return the created note
      const result = await ctx.db
        .select()
        .from(notes)
        .where(eq(notes.id, id))
        .limit(1);

      return result[0];
    }),

  /**
   * Update existing note
   *
   * Input:
   * - id: string - Note ID
   * - data: UpdateNoteInput - Fields to update
   *   - title?: string (1-500 chars) - New title
   *   - content?: string - New content
   *   - tags?: string[] - New tags
   *   - projectId?: string | null - New project link (null to unlink)
   *   - isPinned?: boolean - New pin status
   *
   * Output: Updated note object
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Note ID is required"),
        data: z.object({
          title: z.string().min(1).max(500).optional(),
          content: z.string().min(1).optional(),
          tags: z.array(z.string()).optional(),
          projectId: z.string().nullable().optional(),
          isPinned: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build update object
      const updateData: {
        title?: string;
        content?: string;
        tags?: string[];
        projectId?: string | null;
        isPinned?: boolean;
        updatedAt: string;
      } = {
        updatedAt: new Date().toISOString(),
      };

      // Add fields that are being updated
      if (input.data.title !== undefined) updateData.title = input.data.title;
      if (input.data.content !== undefined)
        updateData.content = input.data.content;
      if (input.data.tags !== undefined) updateData.tags = input.data.tags;
      if (input.data.projectId !== undefined)
        updateData.projectId = input.data.projectId;
      if (input.data.isPinned !== undefined)
        updateData.isPinned = input.data.isPinned;

      // Update the note
      await ctx.db.update(notes).set(updateData).where(eq(notes.id, input.id));

      // Return the updated note
      const result = await ctx.db
        .select()
        .from(notes)
        .where(eq(notes.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Note with ID "${input.id}" not found`,
        });
      }

      return result[0];
    }),

  /**
   * Delete note
   *
   * Input:
   * - id: string - Note ID
   *
   * Output: { success: true }
   *
   * Note: Idempotent - doesn't fail if note doesn't exist
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Note ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(notes).where(eq(notes.id, input.id));

      return { success: true };
    }),

  /**
   * Duplicate an existing note
   *
   * Input:
   * - id: string - Note ID to duplicate
   *
   * Output: Newly created duplicate note
   *
   * Note: Appends " (Copy)" to title and resets pin status
   */
  duplicate: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Note ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch original note
      const original = await ctx.db
        .select()
        .from(notes)
        .where(eq(notes.id, input.id))
        .limit(1);

      if (original.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Note with ID "${input.id}" not found`,
        });
      }

      const originalNote = original[0]!;

      // Generate new ID and timestamps
      const id = generateNoteId();
      const now = new Date().toISOString();

      // Insert duplicate note
      await ctx.db.insert(notes).values({
        id,
        title: `${originalNote.title} (Copy)`,
        content: originalNote.content,
        tags: originalNote.tags,
        projectId: originalNote.projectId,
        isPinned: false, // Reset pin status for duplicate
        createdAt: now,
        updatedAt: now,
      });

      // Return constructed duplicate instead of re-fetching (saves 1 query)
      return {
        id,
        title: `${originalNote.title} (Copy)`,
        content: originalNote.content,
        tags: originalNote.tags,
        projectId: originalNote.projectId,
        isPinned: false,
        createdAt: now,
        updatedAt: now,
      };
    }),

  /**
   * Toggle isPinned status for a note
   *
   * Input:
   * - id: string - Note ID
   *
   * Output: Updated note object with new isPinned status
   *
   * Optimized: Reduced from 3 queries to 2 by constructing return value
   */
  togglePin: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Note ID is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();

      // Fetch current note to get isPinned status
      const current = await ctx.db
        .select()
        .from(notes)
        .where(eq(notes.id, input.id))
        .limit(1);

      if (current.length === 0 || !current[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Note with ID "${input.id}" not found`,
        });
      }

      const currentNote = current[0];
      const newPinnedStatus = !currentNote.isPinned;

      // Update isPinned status
      await ctx.db
        .update(notes)
        .set({
          isPinned: newPinnedStatus,
          updatedAt: now,
        })
        .where(eq(notes.id, input.id));

      // Return constructed object instead of re-fetching (saves 1 query)
      return {
        ...currentNote,
        isPinned: newPinnedStatus,
        updatedAt: now,
      };
    }),
});
