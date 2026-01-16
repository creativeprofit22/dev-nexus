"use client";

/**
 * useStructureMutations Hook
 * Provides mutation hooks for structure scanning operations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type {
  ScanStructureInput,
  ProjectStructure,
} from "../types/structure.types";

interface MutationResult<TVariables, TData = ProjectStructure> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData | undefined>;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
}

interface UseStructureMutationsResult {
  scanStructure: MutationResult<ScanStructureInput>;
}

/**
 * Mutation hooks for structure scanning operations
 *
 * Features:
 * - Automatic cache invalidation on success
 * - Type-safe mutation inputs
 *
 * @returns Object containing scanStructure mutation
 *
 * @example
 * const { scanStructure } = useStructureMutations();
 *
 * // Trigger full scan
 * scanStructure.mutate({ projectId: "proj_123" });
 */
export function useStructureMutations(): UseStructureMutationsResult {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // SCAN STRUCTURE MUTATION - triggers full scan
  const scanStructure = useMutation(
    trpc.structure.scan.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate the structure cache for this project
        queryClient.invalidateQueries({
          queryKey: [["structure", "get"], { projectId: variables.projectId }],
        });
        // Also invalidate getForProject
        queryClient.invalidateQueries({
          queryKey: [
            ["structure", "getForProject"],
            { projectId: variables.projectId },
          ],
        });
      },
      onError: (error) => {
        console.error("Failed to scan structure:", error);
      },
    })
  );

  return {
    scanStructure: {
      mutate: scanStructure.mutate,
      mutateAsync: scanStructure.mutateAsync,
      isLoading: scanStructure.isPending,
      isError: scanStructure.isError,
      error: scanStructure.error,
    },
  };
}
