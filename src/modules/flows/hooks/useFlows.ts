"use client";

/**
 * useFlows Hook
 * Fetches list of flows with optional filtering
 */

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type { FlowFilters, Flow } from "../types/flow.types";

interface UseFlowsResult {
  flows: Flow[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching all flows with optional filters
 *
 * @param filters - Optional projectId and search filters
 * @returns Flows data, loading state, error state, and refetch function
 *
 * @example
 * const { flows, isLoading, isError } = useFlows();
 * const { flows: projectFlows } = useFlows({ projectId: "proj_123" });
 * const { flows: searchResults } = useFlows({ search: "login" });
 */
export function useFlows(filters?: FlowFilters): UseFlowsResult {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.flows.list.queryOptions(filters ?? {}, {
      staleTime: 30_000, // 30 seconds - data considered fresh
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnMount: true, // Refetch when component mounts
    })
  );

  return {
    flows: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
