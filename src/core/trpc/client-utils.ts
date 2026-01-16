/**
 * Client-Only tRPC Utilities
 *
 * This file contains only client-side exports that are safe to use in
 * React components and hooks. It does NOT include server-side code.
 */

import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "./types";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
