import { z } from "zod";
import { publicProcedure, router } from "./init";
import { projectsRouter } from "@/modules/projects/api/projects.router";

/**
 * Main application router
 *
 * This is the root router that merges all module routers.
 *
 * Structure:
 * - healthcheck: Basic health check endpoint
 * - hello: Example query with input validation
 *
 * Phase 1 Module Routers (to be added):
 * - snippets: Code snippet CRUD operations
 * - projects: Project management operations (ADDED)
 * - tags: Tag management operations
 * - analytics: Usage analytics and stats
 *
 * Usage:
 * import { snippetsRouter } from "@/modules/snippets/api/router";
 *
 * export const appRouter = router({
 *   snippets: snippetsRouter,
 *   projects: projectsRouter,
 *   // ... other module routers
 * });
 */
export const appRouter = router({
  /**
   * Health check endpoint
   * Returns current status and timestamp
   */
  healthcheck: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Example hello endpoint with optional name input
   * Demonstrates input validation with Zod
   */
  hello: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? "World"}!`,
      };
    }),

  // Phase 1: Module routers
  projects: projectsRouter,

  // Phase 1: Module routers (to be added):
  // snippets: snippetsRouter,
  // tags: tagsRouter,
  // analytics: analyticsRouter,
});

/**
 * Export type definition for use in client
 * This enables end-to-end type safety
 */
export type AppRouter = typeof appRouter;
