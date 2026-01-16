import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { db } from "@/core/db/client";

/**
 * Creates the tRPC context for each request.
 *
 * Context includes:
 * - db: Drizzle database client
 * - session: User session (Phase 2 - authentication)
 * - user: User object (Phase 2 - authentication)
 *
 * Phase 1: No authentication, only db access
 * Future: Add auth() call when implementing authentication
 */
export const createTRPCContext = cache(async () => {
  // Phase 1: No authentication
  // Phase 2: Uncomment when implementing auth
  // const session = await auth();

  return {
    db,
    // Phase 2: Add session and user
    // session,
    // user: session?.user,
  };
});

/**
 * Initialize tRPC with context type and SuperJSON transformer
 */
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
    errorFormatter({ shape }) {
      return shape;
    },
  });

/**
 * Export router builder and procedure builders
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected procedure middleware (for future authentication)
 *
 * Phase 1: Placeholder - all procedures are public
 * Phase 2: Uncomment and use when implementing authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // Phase 2: Uncomment when implementing authentication
  // if (!ctx.session || !ctx.user) {
  //   throw new TRPCError({ code: "UNAUTHORIZED" });
  // }
  // return next({
  //   ctx: {
  //     session: ctx.session,
  //     user: ctx.user,
  //   },
  // });

  // Phase 1: Allow all requests
  return next({ ctx });
});
