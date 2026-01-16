"use client";

/**
 * useComponentMutations Hook
 * Provides mutation hooks for CRUD operations on components
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type {
  CreateComponentInput,
  UpdateComponentInput,
  Component,
} from "../types/component.types";

interface MutationResult<TVariables, TData = Component> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData | undefined>;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
}

interface UseComponentMutationsResult {
  createComponent: MutationResult<CreateComponentInput>;
  updateComponent: MutationResult<UpdateComponentInput>;
  deleteComponent: MutationResult<{ id: string }, { success: boolean }>;
  duplicateComponent: MutationResult<{ id: string }>;
  toggleFavorite: MutationResult<{ id: string }>;
  incrementUsage: MutationResult<{ id: string }>;
}

/**
 * Mutation hooks for component CRUD operations
 *
 * Features:
 * - Automatic cache invalidation on success
 * - Type-safe mutation inputs
 *
 * @returns Object containing createComponent, updateComponent, deleteComponent, duplicateComponent, toggleFavorite, and incrementUsage mutations
 *
 * @example
 * const { createComponent, updateComponent, deleteComponent, duplicateComponent, toggleFavorite, incrementUsage } = useComponentMutations();
 *
 * // Create component
 * createComponent.mutate({
 *   name: "Button",
 *   code: "export function Button() { ... }",
 *   category: "ui"
 * });
 *
 * // Update component
 * updateComponent.mutate({
 *   id: "123",
 *   name: "Updated Button",
 *   code: "export function Button() { ... }"
 * });
 *
 * // Delete component
 * deleteComponent.mutate({ id: "123" });
 *
 * // Duplicate component
 * duplicateComponent.mutate({ id: "123" });
 *
 * // Toggle favorite
 * toggleFavorite.mutate({ id: "123" });
 *
 * // Increment usage count
 * incrementUsage.mutate({ id: "123" });
 */
export function useComponentMutations(): UseComponentMutationsResult {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // CREATE COMPONENT MUTATION
  const createComponent = useMutation(
    trpc.components.create.mutationOptions({
      onSuccess: () => {
        // Invalidate components list to refetch with new component
        queryClient.invalidateQueries({ queryKey: [["components", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to create component:", error);
      },
    })
  );

  // UPDATE COMPONENT MUTATION
  const updateComponent = useMutation(
    trpc.components.update.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate both the specific component and list
        queryClient.invalidateQueries({
          queryKey: [["components", "get"], { id: variables.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["components", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to update component:", error);
      },
    })
  );

  // DELETE COMPONENT MUTATION
  const deleteComponent = useMutation(
    trpc.components.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate list to remove deleted component
        queryClient.invalidateQueries({ queryKey: [["components", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to delete component:", error);
      },
    })
  );

  // DUPLICATE COMPONENT MUTATION
  const duplicateComponent = useMutation(
    trpc.components.duplicate.mutationOptions({
      onSuccess: () => {
        // Invalidate list to include duplicated component
        queryClient.invalidateQueries({ queryKey: [["components", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to duplicate component:", error);
      },
    })
  );

  // TOGGLE FAVORITE MUTATION
  const toggleFavorite = useMutation(
    trpc.components.toggleFavorite.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate both the specific component and list
        queryClient.invalidateQueries({
          queryKey: [["components", "get"], { id: variables.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["components", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to toggle favorite:", error);
      },
    })
  );

  // INCREMENT USAGE MUTATION
  const incrementUsage = useMutation(
    trpc.components.incrementUsage.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate both the specific component and list
        queryClient.invalidateQueries({
          queryKey: [["components", "get"], { id: variables.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["components", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to increment usage:", error);
      },
    })
  );

  return {
    createComponent: {
      mutate: createComponent.mutate,
      mutateAsync: createComponent.mutateAsync,
      isLoading: createComponent.isPending,
      isError: createComponent.isError,
      error: createComponent.error,
    },
    updateComponent: {
      mutate: updateComponent.mutate,
      mutateAsync: updateComponent.mutateAsync,
      isLoading: updateComponent.isPending,
      isError: updateComponent.isError,
      error: updateComponent.error,
    },
    deleteComponent: {
      mutate: deleteComponent.mutate,
      mutateAsync: deleteComponent.mutateAsync,
      isLoading: deleteComponent.isPending,
      isError: deleteComponent.isError,
      error: deleteComponent.error,
    },
    duplicateComponent: {
      mutate: duplicateComponent.mutate,
      mutateAsync: duplicateComponent.mutateAsync,
      isLoading: duplicateComponent.isPending,
      isError: duplicateComponent.isError,
      error: duplicateComponent.error,
    },
    toggleFavorite: {
      mutate: toggleFavorite.mutate,
      mutateAsync: toggleFavorite.mutateAsync,
      isLoading: toggleFavorite.isPending,
      isError: toggleFavorite.isError,
      error: toggleFavorite.error,
    },
    incrementUsage: {
      mutate: incrementUsage.mutate,
      mutateAsync: incrementUsage.mutateAsync,
      isLoading: incrementUsage.isPending,
      isError: incrementUsage.isError,
      error: incrementUsage.error,
    },
  };
}
