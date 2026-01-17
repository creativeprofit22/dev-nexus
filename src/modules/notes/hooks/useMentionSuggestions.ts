"use client";

/**
 * useMentionSuggestions Hook
 * Provides project suggestions for @mention autocomplete
 */

import { useMemo } from "react";
import { useProjects } from "@/modules/projects/hooks/useProjects";

export interface MentionSuggestion {
  id: string;
  label: string;
  type: "project";
  status?: string;
}

interface UseMentionSuggestionsResult {
  suggestions: MentionSuggestion[];
  isLoading: boolean;
}

/**
 * Hook for fetching mention suggestions
 * Filters projects by search query
 *
 * @param query - Search query to filter suggestions
 * @returns Filtered suggestions and loading state
 */
export function useMentionSuggestions(
  query: string
): UseMentionSuggestionsResult {
  const { projects, isLoading } = useProjects();

  const suggestions = useMemo(() => {
    if (!projects) return [];

    const normalizedQuery = query.toLowerCase().trim();

    return projects
      .filter((project) => project.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 8)
      .map((project) => ({
        id: project.id,
        label: project.name,
        type: "project" as const,
        status: project.status,
      }));
  }, [projects, query]);

  return { suggestions, isLoading };
}
