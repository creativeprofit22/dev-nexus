"use client";

/**
 * useFlowMutations Hook
 * Provides mutation hooks for CRUD operations on flows
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type {
  CreateFlowInput,
  UpdateFlowInput,
  Flow,
} from "../types/flow.types";

interface MutationResult<TVariables, TData = Flow> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData | undefined>;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
}

interface UseFlowMutationsResult {
  createFlow: MutationResult<CreateFlowInput>;
  updateFlow: MutationResult<UpdateFlowInput & { id: string }>;
  deleteFlow: MutationResult<{ id: string }, { success: boolean }>;
  duplicateFlow: MutationResult<{ id: string }>;
  updateViewport: MutationResult<{
    id: string;
    viewport: { x: number; y: number; zoom: number };
  }>;
  updateCanvas: MutationResult<{
    id: string;
    nodes: Flow["nodes"];
    edges: Flow["edges"];
    viewport?: { x: number; y: number; zoom: number };
  }>;
}

/**
 * Mutation hooks for flow CRUD operations
 *
 * Features:
 * - Automatic cache invalidation on success
 * - Type-safe mutation inputs
 * - Specialized mutations for viewport and canvas auto-save
 *
 * @returns Object containing createFlow, updateFlow, deleteFlow, duplicateFlow, updateViewport, and updateCanvas mutations
 *
 * @example
 * const { createFlow, updateFlow, deleteFlow, duplicateFlow, updateViewport, updateCanvas } = useFlowMutations();
 *
 * // Create flow
 * createFlow.mutate({
 *   name: "User Login Flow",
 *   description: "Authentication flow for user login",
 *   projectId: "proj_123"
 * });
 *
 * // Update flow
 * updateFlow.mutate({
 *   id: "flow_123",
 *   name: "Updated Flow Name",
 *   nodes: [...],
 *   edges: [...]
 * });
 *
 * // Delete flow
 * deleteFlow.mutate({ id: "flow_123" });
 *
 * // Duplicate flow
 * duplicateFlow.mutate({ id: "flow_123" });
 *
 * // Update viewport (for pan/zoom state)
 * updateViewport.mutate({
 *   id: "flow_123",
 *   viewport: { x: 100, y: 50, zoom: 1.5 }
 * });
 *
 * // Update canvas (for auto-save on node/edge changes)
 * updateCanvas.mutate({
 *   id: "flow_123",
 *   nodes: [...],
 *   edges: [...],
 *   viewport: { x: 100, y: 50, zoom: 1.5 }
 * });
 */
export function useFlowMutations(): UseFlowMutationsResult {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // CREATE FLOW MUTATION
  const createFlow = useMutation(
    trpc.flows.create.mutationOptions({
      onSuccess: () => {
        // Invalidate flows list to refetch with new flow
        queryClient.invalidateQueries({ queryKey: [["flows", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to create flow:", error);
      },
    })
  );

  // UPDATE FLOW MUTATION
  const updateFlow = useMutation(
    trpc.flows.update.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate both the specific flow and list
        queryClient.invalidateQueries({
          queryKey: [["flows", "get"], { id: variables.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["flows", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to update flow:", error);
      },
    })
  );

  // DELETE FLOW MUTATION
  const deleteFlow = useMutation(
    trpc.flows.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate list to remove deleted flow
        queryClient.invalidateQueries({ queryKey: [["flows", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to delete flow:", error);
      },
    })
  );

  // DUPLICATE FLOW MUTATION
  const duplicateFlow = useMutation(
    trpc.flows.duplicate.mutationOptions({
      onSuccess: () => {
        // Invalidate list to include duplicated flow
        queryClient.invalidateQueries({ queryKey: [["flows", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to duplicate flow:", error);
      },
    })
  );

  // UPDATE VIEWPORT MUTATION (for pan/zoom state persistence)
  const updateViewport = useMutation(
    trpc.flows.updateViewport.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate the specific flow cache
        queryClient.invalidateQueries({
          queryKey: [["flows", "get"], { id: variables.id }],
        });
        // Note: Not invalidating list as viewport changes don't affect list display
      },
      onError: (error) => {
        console.error("Failed to update viewport:", error);
      },
    })
  );

  // UPDATE CANVAS MUTATION (for auto-save on node/edge changes)
  const updateCanvas = useMutation(
    trpc.flows.updateCanvas.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate the specific flow cache
        queryClient.invalidateQueries({
          queryKey: [["flows", "get"], { id: variables.id }],
        });
        // Invalidate list as node count might be displayed
        queryClient.invalidateQueries({ queryKey: [["flows", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to update canvas:", error);
      },
    })
  );

  return {
    createFlow: {
      mutate: createFlow.mutate,
      mutateAsync: createFlow.mutateAsync,
      isLoading: createFlow.isPending,
      isError: createFlow.isError,
      error: createFlow.error,
    },
    updateFlow: {
      mutate: updateFlow.mutate,
      mutateAsync: updateFlow.mutateAsync,
      isLoading: updateFlow.isPending,
      isError: updateFlow.isError,
      error: updateFlow.error,
    },
    deleteFlow: {
      mutate: deleteFlow.mutate,
      mutateAsync: deleteFlow.mutateAsync,
      isLoading: deleteFlow.isPending,
      isError: deleteFlow.isError,
      error: deleteFlow.error,
    },
    duplicateFlow: {
      mutate: duplicateFlow.mutate,
      mutateAsync: duplicateFlow.mutateAsync,
      isLoading: duplicateFlow.isPending,
      isError: duplicateFlow.isError,
      error: duplicateFlow.error,
    },
    updateViewport: {
      mutate: updateViewport.mutate,
      mutateAsync: updateViewport.mutateAsync,
      isLoading: updateViewport.isPending,
      isError: updateViewport.isError,
      error: updateViewport.error,
    },
    updateCanvas: {
      mutate: updateCanvas.mutate,
      mutateAsync: updateCanvas.mutateAsync,
      isLoading: updateCanvas.isPending,
      isError: updateCanvas.isError,
      error: updateCanvas.error,
    },
  };
}
