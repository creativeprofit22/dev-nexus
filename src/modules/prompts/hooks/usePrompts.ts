"use client";

/**
 * usePrompts Hook
 * Fetches list of prompts with optional filtering and search
 */

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type { Prompt, PromptCategory } from "../types/prompt.types";

interface UsePromptsOptions {
  category?: string;
  tags?: string[];
  projectId?: string;
  query?: string;
  sortBy?: "createdAt" | "updatedAt" | "lastUsed" | "usageCount" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

interface UsePromptsResult {
  prompts: Prompt[] | undefined;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching prompts with optional filters
 *
 * Features:
 * - Search/filter by category, tags, projectId, or query string
 * - Sort by multiple fields (createdAt, updatedAt, lastUsed, usageCount, title)
 * - Pagination support with limit/offset
 * - Automatic cache management with React Query
 *
 * @param options - Filter and sort options
 * @returns Prompts data, pagination info, loading state, error state, and refetch function
 *
 * @example
 * // Basic usage - fetch all prompts
 * const { prompts, isLoading } = usePrompts();
 *
 * // Filter by category
 * const { prompts: debugPrompts } = usePrompts({ category: "debugging" });
 *
 * // Search with query
 * const { prompts: searchResults } = usePrompts({ query: "react hooks" });
 *
 * // Filter by tags
 * const { prompts: taggedPrompts } = usePrompts({ tags: ["frontend", "typescript"] });
 *
 * // Sort by usage
 * const { prompts: popularPrompts } = usePrompts({
 *   sortBy: "usageCount",
 *   sortOrder: "desc"
 * });
 *
 * // Pagination
 * const { prompts, hasMore } = usePrompts({ limit: 20, offset: 0 });
 */
export function usePrompts(options: UsePromptsOptions = {}): UsePromptsResult {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.prompts.list.queryOptions(
      {
        category: options.category as PromptCategory | undefined,
        tags: options.tags,
        projectId: options.projectId,
        search: options.query,
        sortBy: options.sortBy ?? "updatedAt",
        sortOrder: options.sortOrder ?? "desc",
        limit: options.limit ?? 50,
        offset: options.offset ?? 0,
      },
      {
        staleTime: 30_000, // 30 seconds - data considered fresh
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        refetchOnMount: true, // Refetch when component mounts
      }
    )
  );

  return {
    prompts: query.data?.prompts,
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
