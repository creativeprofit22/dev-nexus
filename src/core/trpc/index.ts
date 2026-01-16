/**
 * tRPC Core Exports
 *
 * Central export file for tRPC infrastructure.
 * Import from this file in your code for consistency.
 */

// Client-side exports
export { TRPCReactProvider } from "./client";
export { useTRPC, useTRPCClient } from "./utils";

// Server-side exports
export { trpc, HydrateClient, prefetch } from "./server";

// Type exports
export type { AppRouter } from "./router";

// Router builder (for module routers)
export { router, publicProcedure, protectedProcedure } from "./init";
