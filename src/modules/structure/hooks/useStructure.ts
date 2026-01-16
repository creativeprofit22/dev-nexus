"use client";

/**
 * useStructure Hook
 * Fetches project structure data with caching
 */

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type { ProjectStructure } from "../types/structure.types";

interface UseStructureResult {
  structure: ProjectStructure | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching project structure
 *
 * @param projectId - The project ID to fetch structure for
 * @returns Structure data, loading state, error state, and refetch function
 *
 * @example
 * const { structure, isLoading, isError } = useStructure("proj_123");
 */
export function useStructure(projectId: string): UseStructureResult {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.structure.get.queryOptions(
      { projectId },
      {
        staleTime: 60_000, // 1 minute - data considered fresh
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        refetchOnMount: true, // Refetch when component mounts
        enabled: !!projectId, // Only fetch if projectId is provided
      }
    )
  );

  return {
    structure: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
