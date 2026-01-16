import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/core/trpc/init";
import { appRouter } from "@/core/trpc/router";

/**
 * Next.js 15 App Router API Route Handler for tRPC
 *
 * Handles all tRPC requests at /api/trpc/*
 *
 * Features:
 * - Supports GET and POST requests
 * - Batching enabled (multiple procedures in one request)
 * - SuperJSON serialization for complex types
 * - Type-safe end-to-end
 *
 * The [trpc] dynamic segment captures the procedure path:
 * - /api/trpc/healthcheck -> healthcheck procedure
 * - /api/trpc/snippets.list -> snippets.list procedure
 *
 * Request handling:
 * 1. Next.js routes request to this handler
 * 2. fetchRequestHandler parses the request
 * 3. createContext creates context for the request
 * 4. appRouter executes the procedure
 * 5. Response is serialized with SuperJSON
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

/**
 * Export handler for both GET and POST methods
 * GET: Used for queries (with URL-encoded params)
 * POST: Used for mutations and batched requests
 */
export { handler as GET, handler as POST };
