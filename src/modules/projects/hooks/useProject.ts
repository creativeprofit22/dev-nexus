"use client";

/**
 * useProject Hook
 * Fetches a single project by ID
 */

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type { Project } from "../types/project.types";

interface UseProjectResult {
  project: Project | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching a single project by ID
 *
 * @param id - Project ID (optional - query disabled if undefined)
 * @returns Project data, loading state, error state, and refetch function
 *
 * @example
 * const { project, isLoading } = useProject(projectId);
 * const { project } = useProject(undefined); // Query disabled, no API call
 */
export function useProject(id: string | undefined): UseProjectResult {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.projects.get.queryOptions(
      { id: id! }, // Non-null assertion safe because query is disabled when id is undefined
      {
        enabled: !!id, // Only run query if id is provided
        staleTime: 60_000, // 60 seconds - single project data is more stable
        refetchOnWindowFocus: true,
        refetchOnMount: true,
      }
    )
  );

  return {
    project: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
