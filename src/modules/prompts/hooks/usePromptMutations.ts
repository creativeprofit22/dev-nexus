"use client";

/**
 * usePromptMutations Hook
 * Provides mutation hooks for CRUD operations on prompts
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type {
  CreatePromptInput,
  UpdatePromptInput,
  Prompt,
} from "../types/prompt.types";

interface MutationResult<TVariables, TData = Prompt> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData | undefined>;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
}

interface Version {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  content: string;
  createdAt: string;
}

interface UsePromptMutationsResult {
  createPrompt: MutationResult<CreatePromptInput>;
  updatePrompt: MutationResult<UpdatePromptInput>;
  deletePrompt: MutationResult<{ id: string }, { success: boolean }>;
  duplicatePrompt: MutationResult<{ id: string; title?: string }, Prompt>;
  incrementUsage: MutationResult<
    { id: string },
    { success: boolean; usageCount: number; lastUsed: string | null }
  >;
  createVersion: MutationResult<{ promptId: string }, Version>;
  restoreVersion: MutationResult<{ versionId: string }, Prompt>;
}

/**
 * Mutation hooks for prompt CRUD operations
 *
 * Features:
 * - Automatic cache invalidation on success
 * - Type-safe mutation inputs
 * - Error handling with proper error messages
 * - Optimistic updates where appropriate
 *
 * @returns Object containing createPrompt, updatePrompt, deletePrompt, duplicatePrompt, and incrementUsage mutations
 *
 * @example
 * const {
 *   createPrompt,
 *   updatePrompt,
 *   deletePrompt,
 *   duplicatePrompt,
 *   incrementUsage
 * } = usePromptMutations();
 *
 * // Create prompt
 * createPrompt.mutate({
 *   title: "Debug React Hook",
 *   content: "Debug the {{hook_name}} hook in {{component_name}}",
 *   category: "debugging",
 *   tags: ["react", "hooks"]
 * });
 *
 * // Update prompt
 * updatePrompt.mutate({
 *   id: "123",
 *   title: "Updated Title",
 *   category: "refactoring"
 * });
 *
 * // Delete prompt
 * deletePrompt.mutate({ id: "123" });
 *
 * // Duplicate prompt
 * duplicatePrompt.mutate({ id: "123", title: "Copied Prompt" });
 *
 * // Increment usage
 * incrementUsage.mutate({ id: "123" });
 */
export function usePromptMutations(): UsePromptMutationsResult {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // CREATE PROMPT MUTATION
  const createPrompt = useMutation(
    trpc.prompts.create.mutationOptions({
      onSuccess: () => {
        // Invalidate prompts list to refetch with new prompt
        queryClient.invalidateQueries({ queryKey: [["prompts", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to create prompt:", error);
      },
    })
  );

  // UPDATE PROMPT MUTATION
  const updatePrompt = useMutation(
    trpc.prompts.update.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate both the specific prompt and list
        queryClient.invalidateQueries({
          queryKey: [["prompts", "get"], { id: variables.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["prompts", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to update prompt:", error);
      },
    })
  );

  // DELETE PROMPT MUTATION
  const deletePrompt = useMutation(
    trpc.prompts.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate list to remove deleted prompt
        queryClient.invalidateQueries({ queryKey: [["prompts", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to delete prompt:", error);
      },
    })
  );

  // DUPLICATE PROMPT MUTATION
  const duplicatePrompt = useMutation(
    trpc.prompts.duplicate.mutationOptions({
      onSuccess: () => {
        // Invalidate list to include duplicated prompt
        queryClient.invalidateQueries({ queryKey: [["prompts", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to duplicate prompt:", error);
      },
    })
  );

  // INCREMENT USAGE MUTATION
  const incrementUsage = useMutation(
    trpc.prompts.incrementUsage.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate both the specific prompt and list to update usage stats
        queryClient.invalidateQueries({
          queryKey: [["prompts", "get"], { id: variables.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["prompts", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to increment usage:", error);
      },
    })
  );

  // CREATE VERSION MUTATION
  const createVersion = useMutation(
    trpc.prompts.createVersion.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: [
            ["prompts", "listVersions"],
            { promptId: variables.promptId },
          ],
        });
      },
      onError: (error) => {
        console.error("Failed to create version:", error);
      },
    })
  );

  // RESTORE VERSION MUTATION
  const restoreVersion = useMutation(
    trpc.prompts.restoreVersion.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [["prompts", "get"], { id: data.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["prompts", "list"]] });
        queryClient.invalidateQueries({
          queryKey: [["prompts", "listVersions"], { promptId: data.id }],
        });
      },
      onError: (error) => {
        console.error("Failed to restore version:", error);
      },
    })
  );

  return {
    createPrompt: {
      mutate: createPrompt.mutate,
      mutateAsync: createPrompt.mutateAsync,
      isLoading: createPrompt.isPending,
      isError: createPrompt.isError,
      error: createPrompt.error,
    },
    updatePrompt: {
      mutate: updatePrompt.mutate,
      mutateAsync: updatePrompt.mutateAsync,
      isLoading: updatePrompt.isPending,
      isError: updatePrompt.isError,
      error: updatePrompt.error,
    },
    deletePrompt: {
      mutate: deletePrompt.mutate,
      mutateAsync: deletePrompt.mutateAsync,
      isLoading: deletePrompt.isPending,
      isError: deletePrompt.isError,
      error: deletePrompt.error,
    },
    duplicatePrompt: {
      mutate: duplicatePrompt.mutate,
      mutateAsync: duplicatePrompt.mutateAsync,
      isLoading: duplicatePrompt.isPending,
      isError: duplicatePrompt.isError,
      error: duplicatePrompt.error,
    },
    incrementUsage: {
      mutate: incrementUsage.mutate,
      mutateAsync: incrementUsage.mutateAsync,
      isLoading: incrementUsage.isPending,
      isError: incrementUsage.isError,
      error: incrementUsage.error,
    },
    createVersion: {
      mutate: createVersion.mutate,
      mutateAsync: createVersion.mutateAsync,
      isLoading: createVersion.isPending,
      isError: createVersion.isError,
      error: createVersion.error,
    },
    restoreVersion: {
      mutate: restoreVersion.mutate,
      mutateAsync: restoreVersion.mutateAsync,
      isLoading: restoreVersion.isPending,
      isError: restoreVersion.isError,
      error: restoreVersion.error,
    },
  };
}
