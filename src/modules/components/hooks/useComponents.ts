"use client";

/**
 * useComponents Hook
 * Fetches list of components with optional filtering
 */

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type { ComponentFilters, Component } from "../types/component.types";

interface UseComponentsResult {
  components: Component[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching all components with optional filters
 *
 * @param filters - Optional category, search, and favorite filters
 * @returns Components data, loading state, error state, and refetch function
 *
 * @example
 * const { components, isLoading, isError } = useComponents();
 * const { components: reactComponents } = useComponents({ category: "react" });
 * const { components: favorites } = useComponents({ isFavorite: true });
 */
export function useComponents(filters?: ComponentFilters): UseComponentsResult {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.components.list.queryOptions(filters ?? {}, {
      staleTime: 30_000, // 30 seconds - data considered fresh
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchOnMount: true, // Refetch when component mounts
    })
  );

  return {
    components: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
