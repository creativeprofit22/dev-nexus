import { createTRPCContext } from "@trpc/tanstack-react-query";

// Import ONLY the type, use the types-only file to avoid bundling implementation
import type { AppRouter } from "./types";

/**
 * Export tRPC React hooks and utilities
 *
 * This creates type-safe React hooks from the AppRouter type:
 * - TRPCProvider: Wraps app to provide tRPC context
 * - useTRPC: Hook to access tRPC client in components
 * - useTRPCClient: Hook to access raw tRPC client
 *
 * Usage in components:
 * const { data } = useTRPC().healthcheck.useQuery();
 * const utils = useTRPC().useUtils();
 */
export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
