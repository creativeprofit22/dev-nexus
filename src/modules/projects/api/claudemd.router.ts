import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/core/trpc/init";
import { projects } from "@/core/db/schema/projects.schema";
import { eq } from "drizzle-orm";
import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Claude.md Router
 *
 * Handles syncing CLAUDE.md files between DevNexus database and project directories.
 *
 * Procedures:
 * - readFromDisk: Read CLAUDE.md directly from project's filesystem
 * - get: Get cached CLAUDE.md content from database
 * - syncFromDisk: Read from disk and update database cache
 * - saveToDisk: Write content to disk and update database cache
 */
export const claudeMdRouter = router({
  /**
   * Read CLAUDE.md from project's disk path
   *
   * Input: { projectId: string }
   * Output: { content: string | null, exists: boolean, lastModified: string | null }
   */
  readFromDisk: publicProcedure
    .input(z.object({ projectId: z.string().min(1, "Project ID is required") }))
    .query(async ({ ctx, input }) => {
      // Get project to find pathWSL
      const result = await ctx.db
        .select({ pathWSL: projects.pathWSL })
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      const project = result[0];
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with ID "${input.projectId}" not found`,
        });
      }

      const claudeMdPath = join(project.pathWSL, "CLAUDE.md");

      if (!existsSync(claudeMdPath)) {
        return { content: null, exists: false, lastModified: null };
      }

      try {
        const content = readFileSync(claudeMdPath, "utf-8");
        const stats = statSync(claudeMdPath);
        return {
          content,
          exists: true,
          lastModified: stats.mtime.toISOString(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to read CLAUDE.md: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get cached CLAUDE.md from database
   *
   * Input: { projectId: string }
   * Output: { content: string | null, lastSynced: string | null }
   */
  get: publicProcedure
    .input(z.object({ projectId: z.string().min(1, "Project ID is required") }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ claudeMd: projects.claudeMd, updatedAt: projects.updatedAt })
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      const project = result[0];
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with ID "${input.projectId}" not found`,
        });
      }

      return {
        content: project.claudeMd,
        lastSynced: project.claudeMd ? project.updatedAt : null,
      };
    }),

  /**
   * Sync CLAUDE.md from disk to database
   *
   * Input: { projectId: string }
   * Output: { content: string | null, synced: boolean }
   */
  syncFromDisk: publicProcedure
    .input(z.object({ projectId: z.string().min(1, "Project ID is required") }))
    .mutation(async ({ ctx, input }) => {
      // Get project to find pathWSL
      const result = await ctx.db
        .select({ pathWSL: projects.pathWSL })
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      const project = result[0];
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with ID "${input.projectId}" not found`,
        });
      }

      const claudeMdPath = join(project.pathWSL, "CLAUDE.md");

      // If file doesn't exist, update DB to null
      if (!existsSync(claudeMdPath)) {
        await ctx.db
          .update(projects)
          .set({ claudeMd: null, updatedAt: new Date().toISOString() })
          .where(eq(projects.id, input.projectId));
        return { content: null, synced: true };
      }

      try {
        const content = readFileSync(claudeMdPath, "utf-8");

        await ctx.db
          .update(projects)
          .set({ claudeMd: content, updatedAt: new Date().toISOString() })
          .where(eq(projects.id, input.projectId));

        return { content, synced: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync CLAUDE.md: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Save content to disk and database
   *
   * Input: { projectId: string, content: string }
   * Output: { success: boolean }
   */
  saveToDisk: publicProcedure
    .input(
      z.object({
        projectId: z.string().min(1, "Project ID is required"),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get project to find pathWSL
      const result = await ctx.db
        .select({ pathWSL: projects.pathWSL })
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      const project = result[0];
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with ID "${input.projectId}" not found`,
        });
      }

      const claudeMdPath = join(project.pathWSL, "CLAUDE.md");

      // Validate project directory exists
      if (!existsSync(project.pathWSL)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Project directory does not exist: ${project.pathWSL}`,
        });
      }

      try {
        // Write to disk
        writeFileSync(claudeMdPath, input.content, "utf-8");

        // Update database
        await ctx.db
          .update(projects)
          .set({ claudeMd: input.content, updatedAt: new Date().toISOString() })
          .where(eq(projects.id, input.projectId));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to save CLAUDE.md: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
});
