"use client";

/**
 * useNotes Hook
 * Fetches list of notes with optional filtering and search
 */

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type { NoteSelect } from "../types/note.types";

interface UseNotesOptions {
  tags?: string[];
  projectId?: string;
  search?: string;
  isPinned?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

interface UseNotesResult {
  notes: NoteSelect[] | undefined;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

/**
 * Query hook for fetching notes with optional filters
 *
 * Features:
 * - Search/filter by tags, projectId, or search query
 * - Sort by multiple fields (createdAt, updatedAt, title)
 * - Filter by pinned status
 * - Automatic sorting with pinned notes first
 * - Pagination support with limit/offset
 * - Automatic cache management with React Query
 *
 * @param options - Filter and sort options
 * @returns Notes data, pagination info, loading state, error state, and refetch function
 *
 * @example
 * // Basic usage - fetch all notes (pinned first)
 * const { notes, isLoading } = useNotes();
 *
 * // Filter by tags
 * const { notes: taggedNotes } = useNotes({ tags: ["work", "important"] });
 *
 * // Search with query
 * const { notes: searchResults } = useNotes({ search: "react hooks" });
 *
 * // Filter by project
 * const { notes: projectNotes } = useNotes({ projectId: "123" });
 *
 * // Only pinned notes
 * const { notes: pinnedNotes } = useNotes({ isPinned: true });
 *
 * // Sort by update date
 * const { notes: recentNotes } = useNotes({
 *   sortBy: "updatedAt",
 *   sortOrder: "desc"
 * });
 *
 * // Pagination
 * const { notes, hasMore } = useNotes({ limit: 20, offset: 0 });
 */
export function useNotes(options: UseNotesOptions = {}): UseNotesResult {
  const trpc = useTRPC();

  const query = useQuery(
    trpc.notes.list.queryOptions(
      {
        tags: options.tags,
        projectId: options.projectId,
        search: options.search,
        isPinned: options.isPinned,
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
    notes: query.data?.notes,
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
