"use client";

/**
 * useProjects Hook
 * Fetches list of projects with optional filtering
 */

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type { ProjectFilters, Project } from "../types/project.types";

interface UseProjectsResult {
  projects: Project[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching all projects with optional filters
 *
 * @param filters - Optional status and search filters
 * @returns Projects data, loading state, error state, and refetch function
 *
 * @example
 * const { projects, isLoading, isError } = useProjects();
 * const { projects: activeProjects } = useProjects({ status: "active" });
 * const { projects: searchResults } = useProjects({ search: "nexus" });
 */
export function useProjects(filters?: ProjectFilters): UseProjectsResult {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.projects.list.queryOptions(filters ?? {}, {
      staleTime: 30_000, // 30 seconds - data considered fresh
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnMount: true, // Refetch when component mounts
    })
  );

  return {
    projects: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
