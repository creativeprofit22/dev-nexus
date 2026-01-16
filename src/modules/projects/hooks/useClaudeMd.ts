"use client";

/**
 * useClaudeMd Hooks
 * Query and mutation hooks for Claude Code Sync (CLAUDE.md management)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";

interface MutationResult<TVariables, TData = unknown> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isPending: boolean;
  isError: boolean;
  error: { message: string } | null;
}

interface UseClaudeMdResult {
  data: { content: string | null; lastSynced: string | null } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
  refetch: () => void;
}

interface UseClaudeMdFromDiskResult {
  content: string | null;
  exists: boolean;
  lastModified: string | null;
  isLoading: boolean;
  isError: boolean;
}

interface SyncFromDiskInput {
  projectId: string;
}

interface SaveToDiskInput {
  projectId: string;
  content: string;
}

interface SyncFromDiskResult {
  content: string | null;
  synced: boolean;
}

interface UseClaudeMdMutationsResult {
  syncFromDisk: MutationResult<SyncFromDiskInput, SyncFromDiskResult>;
  saveToDisk: MutationResult<SaveToDiskInput, { success: boolean }>;
}

/** Query hook for cached CLAUDE.md content from database */
export function useClaudeMd(projectId: string | undefined): UseClaudeMdResult {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.claudeMd.get.queryOptions(
      { projectId: projectId! },
      { enabled: !!projectId, staleTime: 60_000 }
    )
  );

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Query hook for CLAUDE.md content directly from disk */
export function useClaudeMdFromDisk(
  projectId: string | undefined
): UseClaudeMdFromDiskResult {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.claudeMd.readFromDisk.queryOptions(
      { projectId: projectId! },
      { enabled: !!projectId, staleTime: 30_000 }
    )
  );

  return {
    content: query.data?.content ?? null,
    exists: query.data?.exists ?? false,
    lastModified: query.data?.lastModified ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/** Mutation hooks for CLAUDE.md sync operations */
export function useClaudeMdMutations(): UseClaudeMdMutationsResult {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const invalidateQueries = (projectId: string) => {
    queryClient.invalidateQueries({
      queryKey: [["claudeMd", "get"], { projectId }],
    });
    queryClient.invalidateQueries({
      queryKey: [["claudeMd", "readFromDisk"], { projectId }],
    });
  };

  const syncFromDisk = useMutation(
    trpc.claudeMd.syncFromDisk.mutationOptions({
      onSuccess: (_data, variables) => invalidateQueries(variables.projectId),
      onError: (error) =>
        console.error("Failed to sync CLAUDE.md from disk:", error),
    })
  );

  const saveToDisk = useMutation(
    trpc.claudeMd.saveToDisk.mutationOptions({
      onSuccess: (_data, variables) => invalidateQueries(variables.projectId),
      onError: (error) =>
        console.error("Failed to save CLAUDE.md to disk:", error),
    })
  );

  return {
    syncFromDisk: {
      mutate: syncFromDisk.mutate,
      mutateAsync: syncFromDisk.mutateAsync,
      isPending: syncFromDisk.isPending,
      isError: syncFromDisk.isError,
      error: syncFromDisk.error,
    },
    saveToDisk: {
      mutate: saveToDisk.mutate,
      mutateAsync: saveToDisk.mutateAsync,
      isPending: saveToDisk.isPending,
      isError: saveToDisk.isError,
      error: saveToDisk.error,
    },
  };
}
