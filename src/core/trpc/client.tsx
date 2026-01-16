"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { TRPCProvider } from "./utils";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./types";

/**
 * Browser query client singleton
 * - Server-side: Creates new client per request
 * - Client-side: Reuses same client instance
 */
let browserQueryClient: ReturnType<typeof makeQueryClient> | undefined;

/**
 * Gets or creates a QueryClient instance
 * Server-side: Always creates new instance
 * Client-side: Reuses singleton instance
 */
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: Always create new client
    return makeQueryClient();
  }

  // Browser: Create client once and reuse
  return (browserQueryClient ??= makeQueryClient());
}

/**
 * tRPC React Provider Component
 *
 * Wraps application to provide:
 * - React Query client with SuperJSON serialization
 * - tRPC client with batching and type safety
 *
 * Features:
 * - HTTP batch link: Batches multiple requests into one
 * - SuperJSON transformer: Handles Date, BigInt, etc.
 * - Type-safe hooks throughout the app
 *
 * Usage in layout.tsx:
 * <TRPCReactProvider>
 *   {children}
 * </TRPCReactProvider>
 */
export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          // You can add headers here if needed
          // headers() {
          //   return {
          //     "x-custom-header": "value",
          //   };
          // },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
