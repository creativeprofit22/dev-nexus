"use client";

/**
 * useNoteVersions Hook
 * Fetches version history for a specific note
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

interface UseNoteVersionsOptions {
  noteId: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseNoteVersionsResult {
  versions: Version[] | undefined;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching version history of a note
 *
 * @param options - noteId and pagination options
 * @returns Versions data, pagination info, loading state, error state
 *
 * @example
 * const { versions, isLoading } = useNoteVersions({ noteId: "note_123" });
 */
export function useNoteVersions(
  options: UseNoteVersionsOptions
): UseNoteVersionsResult {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.notes.listVersions.queryOptions(
      {
        noteId: options.noteId,
        limit: options.limit ?? 20,
        offset: options.offset ?? 0,
      },
      {
        enabled: options.enabled !== false && !!options.noteId,
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
