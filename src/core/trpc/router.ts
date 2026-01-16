import { z } from "zod";
import { publicProcedure, router } from "./init";
import { projectsRouter } from "@/modules/projects/api/projects.router";
import { promptsRouter } from "@/modules/prompts/api/prompts.router";
import { notesRouter } from "@/modules/notes/api/notes.router";
import { componentsRouter } from "@/modules/components/api/components.router";
import { flowsRouter } from "@/modules/flows/api/flows.router";

/**
 * Main application router
 *
 * This is the root router that merges all module routers.
 *
 * Structure:
 * - healthcheck: Basic health check endpoint
 * - hello: Example query with input validation
 *
 * Phase 1 Module Routers:
 * - projects: Project management operations (ADDED)
 * - prompts: Prompt library CRUD operations (ADDED)
 * - notes: Rich text notes with organization (ADDED)
 * - components: Component library with live previews (ADDED)
 *
 * Phase 1 Module Routers (to be added):
 * - snippets: Code snippet CRUD operations
 * - tags: Tag management operations
 * - analytics: Usage analytics and stats
 *
 * Usage:
 * import { snippetsRouter } from "@/modules/snippets/api/router";
 *
 * export const appRouter = router({
 *   snippets: snippetsRouter,
 *   projects: projectsRouter,
 *   prompts: promptsRouter,
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
  prompts: promptsRouter,
  notes: notesRouter,
  components: componentsRouter,
  flows: flowsRouter,

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
