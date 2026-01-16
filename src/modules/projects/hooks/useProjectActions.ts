"use client";

/**
 * useProjectActions Hook
 *
 * Provides action hooks for project operations:
 * - Open in VS Code
 * - Open Terminal
 * - Copy Path to clipboard
 */

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";
import type {
  ActionResult,
  ProjectActionInput,
  PathFormat,
} from "../types/project.types";

interface ActionState {
  isLoading: boolean;
  error: string | null;
}

interface UseProjectActionsResult {
  openVSCode: {
    execute: (input: ProjectActionInput) => Promise<ActionResult>;
    state: ActionState;
  };
  openTerminal: {
    execute: (input: ProjectActionInput) => Promise<ActionResult>;
    state: ActionState;
  };
  copyPath: {
    execute: (path: string, format: PathFormat) => Promise<ActionResult>;
    state: ActionState;
  };
}

/**
 * Hook for project action operations
 *
 * Features:
 * - API mutations for VS Code and terminal
 * - Clipboard API for path copying (frontend-only)
 * - Loading and error states for each action
 * - Automatic cache invalidation on success
 *
 * @example
 * const { openVSCode, openTerminal, copyPath } = useProjectActions();
 *
 * // Open in VS Code
 * await openVSCode.execute({ id: "proj_123", pathWSL: "/mnt/e/Projects/foo" });
 *
 * // Open terminal
 * await openTerminal.execute({ id: "proj_123", pathWSL: "/mnt/e/Projects/foo" });
 *
 * // Copy path
 * await copyPath.execute("/mnt/e/Projects/foo", "wsl");
 */
export function useProjectActions(): UseProjectActionsResult {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // State for each action
  const [vsCodeState, setVSCodeState] = useState<ActionState>({
    isLoading: false,
    error: null,
  });
  const [terminalState, setTerminalState] = useState<ActionState>({
    isLoading: false,
    error: null,
  });
  const [copyState, setCopyState] = useState<ActionState>({
    isLoading: false,
    error: null,
  });

  // Mutations
  const openVSCodeMutation = useMutation(
    trpc.projects.openInVSCode.mutationOptions({
      onSuccess: () => {
        // Invalidate to refresh lastAccessed timestamp
        queryClient.invalidateQueries({ queryKey: [["projects", "list"]] });
      },
    })
  );

  const openTerminalMutation = useMutation(
    trpc.projects.openTerminal.mutationOptions({
      onSuccess: () => {
        // Invalidate to refresh lastAccessed timestamp
        queryClient.invalidateQueries({ queryKey: [["projects", "list"]] });
      },
    })
  );

  // Open VS Code action
  const executeOpenVSCode = useCallback(
    async (input: ProjectActionInput): Promise<ActionResult> => {
      setVSCodeState({ isLoading: true, error: null });
      try {
        const result = await openVSCodeMutation.mutateAsync(input);
        setVSCodeState({ isLoading: false, error: null });
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to open VS Code";
        setVSCodeState({ isLoading: false, error: message });
        return { success: false, message };
      }
    },
    [openVSCodeMutation]
  );

  // Open terminal action
  const executeOpenTerminal = useCallback(
    async (input: ProjectActionInput): Promise<ActionResult> => {
      setTerminalState({ isLoading: true, error: null });
      try {
        const result = await openTerminalMutation.mutateAsync(input);
        setTerminalState({ isLoading: false, error: null });
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to open terminal";
        setTerminalState({ isLoading: false, error: message });
        return { success: false, message };
      }
    },
    [openTerminalMutation]
  );

  // Copy path action (frontend-only, uses Clipboard API)
  const executeCopyPath = useCallback(
    async (path: string, format: PathFormat): Promise<ActionResult> => {
      setCopyState({ isLoading: true, error: null });
      try {
        // The path passed should already be in the correct format
        // (either pathWSL or pathWindows from the project)
        await navigator.clipboard.writeText(path);
        setCopyState({ isLoading: false, error: null });
        return {
          success: true,
          message: `Copied ${format.toUpperCase()} path to clipboard`,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to copy to clipboard";
        setCopyState({ isLoading: false, error: message });
        return { success: false, message };
      }
    },
    []
  );

  return {
    openVSCode: {
      execute: executeOpenVSCode,
      state: vsCodeState,
    },
    openTerminal: {
      execute: executeOpenTerminal,
      state: terminalState,
    },
    copyPath: {
      execute: executeCopyPath,
      state: copyState,
    },
  };
}
