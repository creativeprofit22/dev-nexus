"use client";

/**
 * usePromptVersions Hook
 * Fetches version history for a specific prompt
 */

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";

interface Version {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  content: string;
  createdAt: string;
}

interface UsePromptVersionsOptions {
  promptId: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UsePromptVersionsResult {
  versions: Version[] | undefined;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching version history of a prompt
 *
 * @param options - promptId and pagination options
 * @returns Versions data, pagination info, loading state, error state
 *
 * @example
 * const { versions, isLoading } = usePromptVersions({ promptId: "prompt_123" });
 */
export function usePromptVersions(
  options: UsePromptVersionsOptions
): UsePromptVersionsResult {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.prompts.listVersions.queryOptions(
      {
        promptId: options.promptId,
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
      },
      {
        enabled: options.enabled !== false && !!options.promptId,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      }
    )
  );

  return {
    versions: query.data?.versions,
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
