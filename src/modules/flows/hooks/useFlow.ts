"use client";

/**
 * useFlow Hook
 * Fetches a single flow by ID
 */

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type { Flow } from "../types/flow.types";

interface UseFlowResult {
  flow: Flow | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching a single flow by ID
 *
 * @param id - Flow ID (optional - query disabled if undefined)
 * @returns Flow data, loading state, error state, and refetch function
 *
 * @example
 * const { flow, isLoading } = useFlow(flowId);
 * const { flow } = useFlow(undefined); // Query disabled, no API call
 */
export function useFlow(id: string | undefined): UseFlowResult {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.flows.get.queryOptions(
      { id: id! }, // Non-null assertion safe because query is disabled when id is undefined
      {
        enabled: !!id, // Only run query if id is provided
        staleTime: 60_000, // 60 seconds - single flow data is more stable
        refetchOnWindowFocus: true,
        refetchOnMount: true,
      }
    )
  );

  return {
    flow: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
