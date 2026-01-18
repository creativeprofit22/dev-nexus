"use client";

/**
 * useVariableAutoFill Hook
 * Auto-populates prompt variables from project context
 */

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/core/trpc/utils";

/**
 * Variable suggestion from project context
 */
export interface VariableSuggestion {
  value: string;
  source: "project" | "recent" | "default";
  label: string;
}

/**
 * Variable value with metadata
 */
export interface VariableValue {
  name: string;
  value: string;
  suggestions: VariableSuggestion[];
}

/**
 * Storage key for recently used variable values
 */
const RECENT_VALUES_KEY = "devnexus_recent_variable_values";
const MAX_RECENT_VALUES = 10;

/**
 * Get recently used values from localStorage
 */
function getRecentValues(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(RECENT_VALUES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save a value to recently used
 */
function saveRecentValue(variableName: string, value: string): void {
  if (typeof window === "undefined" || !value.trim()) return;
  try {
    const recent = getRecentValues();
    const values = recent[variableName] ?? [];
    // Remove if exists, then add to front
    const filtered = values.filter((v) => v !== value);
    recent[variableName] = [value, ...filtered].slice(0, MAX_RECENT_VALUES);
    localStorage.setItem(RECENT_VALUES_KEY, JSON.stringify(recent));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Map common variable names to project context fields
 * Supports multiple naming conventions (camelCase, snake_case, etc.)
 */
const VARIABLE_MAPPINGS: Record<
  string,
  (project: ProjectContext) => string | undefined
> = {
  // Project name variations
  projectname: (p) => p.name,
  project_name: (p) => p.name,
  projectName: (p) => p.name,
  name: (p) => p.name,
  project: (p) => p.name,

  // Project path variations
  projectpath: (p) => p.pathWSL,
  project_path: (p) => p.pathWSL,
  projectPath: (p) => p.pathWSL,
  path: (p) => p.pathWSL,
  wslpath: (p) => p.pathWSL,
  wsl_path: (p) => p.pathWSL,
  windowspath: (p) => p.pathWindows,
  windows_path: (p) => p.pathWindows,
  windowsPath: (p) => p.pathWindows,

  // Tech stack variations
  technologies: (p) => p.techStack?.join(", "),
  tech_stack: (p) => p.techStack?.join(", "),
  techStack: (p) => p.techStack?.join(", "),
  techstack: (p) => p.techStack?.join(", "),
  stack: (p) => p.techStack?.join(", "),
  frameworks: (p) => p.techStack?.join(", "),

  // Description variations
  description: (p) => p.description ?? undefined,
  project_description: (p) => p.description ?? undefined,
  projectDescription: (p) => p.description ?? undefined,

  // Status variations
  status: (p) => p.status ?? undefined,
  project_status: (p) => p.status ?? undefined,
  projectStatus: (p) => p.status ?? undefined,
};

interface ProjectContext {
  id: string;
  name: string;
  pathWSL: string;
  pathWindows: string;
  techStack: string[] | null;
  description: string | null;
  status: string;
}

interface UseVariableAutoFillOptions {
  projectId?: string;
  variables: string[];
}

interface UseVariableAutoFillResult {
  variableValues: VariableValue[];
  isLoading: boolean;
  updateValue: (name: string, value: string) => void;
  interpolate: (content: string, values: Record<string, string>) => string;
  saveRecent: (values: Record<string, string>) => void;
}

/**
 * Hook for auto-filling prompt variables from project context
 *
 * Features:
 * - Maps common variable names to project context (name, path, tech stack, etc.)
 * - Suggests recently used values
 * - Allows manual override of auto-filled values
 *
 * @param options - projectId and list of variables to fill
 * @returns Variable values with suggestions, update function, and interpolation helper
 *
 * @example
 * const { variableValues, updateValue, interpolate } = useVariableAutoFill({
 *   projectId: "proj_123",
 *   variables: ["projectName", "filePath"]
 * });
 */
export function useVariableAutoFill(
  options: UseVariableAutoFillOptions
): UseVariableAutoFillResult {
  const { projectId, variables } = options;
  const trpc = useTRPC();

  // Fetch project context if projectId provided
  const projectQuery = useQuery(
    trpc.projects.get.queryOptions(
      { id: projectId! },
      {
        enabled: !!projectId,
        staleTime: 60_000, // 1 minute
      }
    )
  );

  const project = projectQuery.data as ProjectContext | undefined;

  // Build variable values with suggestions
  const variableValues = useMemo<VariableValue[]>(() => {
    const recentValues = getRecentValues();

    return variables.map((name) => {
      const suggestions: VariableSuggestion[] = [];
      let autoValue = "";

      // Try to get value from project context
      if (project) {
        const normalizedName = name.toLowerCase();
        const mappingFn =
          VARIABLE_MAPPINGS[name] ?? VARIABLE_MAPPINGS[normalizedName];

        if (mappingFn) {
          const contextValue = mappingFn(project);
          if (contextValue) {
            autoValue = contextValue;
            suggestions.push({
              value: contextValue,
              source: "project",
              label: `From project: ${contextValue.length > 40 ? contextValue.slice(0, 40) + "..." : contextValue}`,
            });
          }
        }
      }

      // Add recently used values
      const recent = recentValues[name] ?? [];
      recent.forEach((value) => {
        if (!suggestions.some((s) => s.value === value)) {
          suggestions.push({
            value,
            source: "recent",
            label: `Recent: ${value.length > 40 ? value.slice(0, 40) + "..." : value}`,
          });
        }
      });

      return {
        name,
        value: autoValue,
        suggestions,
      };
    });
  }, [variables, project]);

  // Update function placeholder - actual state managed by parent component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateValue = useCallback((_name: string, _value: string) => {}, []);

  // Interpolate content with variable values
  const interpolate = useCallback(
    (content: string, values: Record<string, string>): string => {
      let result = content;
      for (const [name, value] of Object.entries(values)) {
        result = result.replace(new RegExp(`\\{\\{${name}\\}\\}`, "g"), value);
      }
      return result;
    },
    []
  );

  // Save values to recent history
  const saveRecent = useCallback((values: Record<string, string>) => {
    for (const [name, value] of Object.entries(values)) {
      saveRecentValue(name, value);
    }
  }, []);

  return {
    variableValues,
    isLoading: projectQuery.isLoading,
    updateValue,
    interpolate,
    saveRecent,
  };
}
