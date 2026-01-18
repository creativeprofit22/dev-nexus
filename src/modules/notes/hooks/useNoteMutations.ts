"use client";

/**
 * useNoteMutations Hook
 * Provides mutation hooks for CRUD operations on notes
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type {
  CreateNoteInput,
  UpdateNoteInput,
  NoteSelect,
  NoteListResult,
} from "../types/note.types";

interface MutationResult<TVariables, TData = NoteSelect> {
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

interface UseNoteMutationsResult {
  createNote: MutationResult<CreateNoteInput>;
  updateNote: MutationResult<{ id: string; data: UpdateNoteInput }>;
  deleteNote: MutationResult<{ id: string }, { success: boolean }>;
  duplicateNote: MutationResult<{ id: string; title?: string }, NoteSelect>;
  togglePin: MutationResult<{ id: string }, NoteSelect>;
  createVersion: MutationResult<{ noteId: string }, Version>;
  restoreVersion: MutationResult<{ versionId: string }, NoteSelect>;
}

/**
 * Mutation hooks for note CRUD operations
 *
 * Features:
 * - Automatic cache invalidation on success
 * - Type-safe mutation inputs
 * - Optimistic updates for toggle operations
 *
 * @example
 * const { createNote, updateNote, deleteNote, duplicateNote, togglePin } = useNoteMutations();
 * createNote.mutate({ title: "Meeting Notes", content: "...", tags: ["work"] });
 * updateNote.mutate({ id: "123", title: "Updated" });
 * deleteNote.mutate({ id: "123" });
 * duplicateNote.mutate({ id: "123", title: "Copy" });
 * togglePin.mutate({ id: "123" });
 */
export function useNoteMutations(): UseNoteMutationsResult {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // CREATE NOTE MUTATION
  const createNote = useMutation(
    trpc.notes.create.mutationOptions({
      onSuccess: () => {
        // Invalidate notes list to refetch with new note
        queryClient.invalidateQueries({ queryKey: [["notes", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to create note:", error);
      },
    })
  );

  // UPDATE NOTE MUTATION
  const updateNote = useMutation(
    trpc.notes.update.mutationOptions({
      onSuccess: (_data, variables) => {
        // Invalidate both the specific note and list
        queryClient.invalidateQueries({
          queryKey: [["notes", "get"], { id: variables.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["notes", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to update note:", error);
      },
    })
  );

  // DELETE NOTE MUTATION
  const deleteNote = useMutation(
    trpc.notes.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate list to remove deleted note
        queryClient.invalidateQueries({ queryKey: [["notes", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to delete note:", error);
      },
    })
  );

  // DUPLICATE NOTE MUTATION
  const duplicateNote = useMutation(
    trpc.notes.duplicate.mutationOptions({
      onSuccess: () => {
        // Invalidate list to include duplicated note
        queryClient.invalidateQueries({ queryKey: [["notes", "list"]] });
      },
      onError: (error) => {
        console.error("Failed to duplicate note:", error);
      },
    })
  );

  // TOGGLE PIN MUTATION
  const togglePin = useMutation(
    trpc.notes.togglePin.mutationOptions({
      onMutate: async (variables) => {
        // Cancel any outgoing refetches to avoid overwriting optimistic update
        await queryClient.cancelQueries({ queryKey: [["notes", "list"]] });

        // Snapshot the previous value for rollback
        const previousNotes = queryClient.getQueryData([["notes", "list"]]);

        // Optimistically update the note's pin status in the cache
        queryClient.setQueryData(
          [["notes", "list"]],
          (old: NoteListResult | undefined) => {
            if (!old?.notes) return old;

            return {
              ...old,
              notes: old.notes.map((note: NoteSelect) =>
                note.id === variables.id
                  ? { ...note, isPinned: !note.isPinned }
                  : note
              ),
            };
          }
        );

        // Return context with snapshot for rollback
        return { previousNotes };
      },
      onSuccess: (_data, variables) => {
        // Invalidate both the specific note and list to ensure consistency
        queryClient.invalidateQueries({
          queryKey: [["notes", "get"], { id: variables.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["notes", "list"]] });
      },
      onError: (error, _variables, context) => {
        // Rollback to the previous value on error
        if (context?.previousNotes) {
          queryClient.setQueryData([["notes", "list"]], context.previousNotes);
        }
        console.error("Failed to toggle pin:", error);
      },
    })
  );

  // CREATE VERSION MUTATION
  const createVersion = useMutation(
    trpc.notes.createVersion.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: [["notes", "listVersions"], { noteId: variables.noteId }],
        });
      },
      onError: (error) => {
        console.error("Failed to create version:", error);
      },
    })
  );

  // RESTORE VERSION MUTATION
  const restoreVersion = useMutation(
    trpc.notes.restoreVersion.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [["notes", "get"], { id: data.id }],
        });
        queryClient.invalidateQueries({ queryKey: [["notes", "list"]] });
        queryClient.invalidateQueries({
          queryKey: [["notes", "listVersions"], { noteId: data.id }],
        });
      },
      onError: (error) => {
        console.error("Failed to restore version:", error);
      },
    })
  );

  return {
    createNote: {
      mutate: createNote.mutate,
      mutateAsync: createNote.mutateAsync,
      isLoading: createNote.isPending,
      isError: createNote.isError,
      error: createNote.error,
    },
    updateNote: {
      mutate: updateNote.mutate,
      mutateAsync: updateNote.mutateAsync,
      isLoading: updateNote.isPending,
      isError: updateNote.isError,
      error: updateNote.error,
    },
    deleteNote: {
      mutate: deleteNote.mutate,
      mutateAsync: deleteNote.mutateAsync,
      isLoading: deleteNote.isPending,
      isError: deleteNote.isError,
      error: deleteNote.error,
    },
    duplicateNote: {
      mutate: duplicateNote.mutate,
      mutateAsync: duplicateNote.mutateAsync,
      isLoading: duplicateNote.isPending,
      isError: duplicateNote.isError,
      error: duplicateNote.error,
    },
    togglePin: {
      mutate: togglePin.mutate,
      mutateAsync: togglePin.mutateAsync,
      isLoading: togglePin.isPending,
      isError: togglePin.isError,
      error: togglePin.error,
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
