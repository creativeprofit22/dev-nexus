"use client";

/**
 * useProjectMutations Hook
 * Provides mutation hooks for CRUD operations on projects
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  Project,
} from "../types/project.types";

interface MutationResult<TVariables, TData = Project> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData | undefined>;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
}

interface UseProjectMutationsResult {
  createProject: MutationResult<CreateProjectInput>;
  updateProject: MutationResult<UpdateProjectInput>;
  deleteProject: MutationResult<{ id: string }, { success: boolean }>;
}

/**
 * Mutation hooks for project CRUD operations
 *
 * Features:
 * - Automatic cache invalidation on success
 * - Type-safe mutation inputs
 *
 * @returns Object containing createProject, updateProject, and deleteProject mutations
 *
 * @example
 * const { createProject, updateProject, deleteProject } = useProjectMutations();
 *
 * // Create project
 * createProject.mutate({
 *   name: "New Project",
 *   pathWSL: "/mnt/c/projects/new"
 * });
 *
 * // Update project
 * updateProject.mutate({
 *   id: "123",
 *   name: "Updated Name",
 *   status: "completed"
 * });
 *
 * // Delete project
 * deleteProject.mutate({ id: "123" });
 */
export function useProjectMutations(): UseProjectMutationsResult {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // CREATE PROJECT MUTATION
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: () => {
        // Invalidate projects list to refetch with new project
        queryClient.invalidateQueries({ queryKey: [["projects", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to create project:", error);
      },
    })
  );

  // UPDATE PROJECT MUTATION
  const updateProject = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate both the specific project and list
        queryClient.invalidateQueries({
          queryKey: [["projects", "get"], { id: variables.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["projects", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to update project:", error);
      },
    })
  );

  // DELETE PROJECT MUTATION
  const deleteProject = useMutation(
    trpc.projects.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate list to remove deleted project
        queryClient.invalidateQueries({ queryKey: [["projects", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to delete project:", error);
      },
    })
  );

  return {
    createProject: {
      mutate: createProject.mutate,
      mutateAsync: createProject.mutateAsync,
      isLoading: createProject.isPending,
      isError: createProject.isError,
      error: createProject.error,
    },
    updateProject: {
      mutate: updateProject.mutate,
      mutateAsync: updateProject.mutateAsync,
      isLoading: updateProject.isPending,
      isError: updateProject.isError,
      error: updateProject.error,
    },
    deleteProject: {
      mutate: deleteProject.mutate,
      mutateAsync: deleteProject.mutateAsync,
      isLoading: deleteProject.isPending,
      isError: deleteProject.isError,
      error: deleteProject.error,
    },
  };
}
