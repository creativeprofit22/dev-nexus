import "server-only";

import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./router";

/**
 * Cached query client factory for server-side usage
 * Creates one QueryClient per request
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * Server-side tRPC client
 *
 * Used in Server Components to:
 * - Prefetch data
 * - Execute queries server-side
 * - Populate React Query cache
 *
 * Example usage in Server Component:
 * import { trpc } from "@/core/trpc/server";
 *
 * export default async function Page() {
 *   const data = await trpc.healthcheck.query();
 *   return <div>{data.status}</div>;
 * }
 */
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

/**
 * HydrateClient Component
 *
 * Transfers server-side query results to client
 * Wraps Server Components that prefetch data
 *
 * Usage in Server Component:
 * import { HydrateClient, prefetch, trpc } from "@/core/trpc/server";
 *
 * export default async function Page() {
 *   prefetch(trpc.snippets.list.queryOptions());
 *   return (
 *     <HydrateClient>
 *       <SnippetList />
 *     </HydrateClient>
 *   );
 * }
 */
export function HydrateClient({ children }: { children: React.ReactNode }) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      {children}
    </HydrationBoundary>
  );
}

/**
 * Prefetch utility for server-side data loading
 *
 * Prefetches query data and populates React Query cache
 * Supports both regular and infinite queries
 *
 * Usage:
 * prefetch(trpc.snippets.list.queryOptions({ limit: 10 }));
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}
