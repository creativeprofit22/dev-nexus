import type { prompts } from "@/core/db/schema/prompts.schema";

/**
 * Prompt entity type inferred from database schema
 */
export type Prompt = typeof prompts.$inferSelect;

/**
 * Input type for creating a new prompt
 */
export type PromptInsert = typeof prompts.$inferInsert;

/**
 * Prompt categories
 * Used to organize prompts by their purpose
 */
export type PromptCategory =
  | "claude"
  | "code"
  | "architecture"
  | "testing"
  | "documentation"
  | "debugging"
  | "refactoring"
  | "review"
  | "general";

/**
 * Variable detected in prompt content
 * Pattern: {{variable_name}}
 */
export interface PromptVariable {
  name: string;
  position: number;
}

/**
 * Filter options for listing prompts
 */
export interface PromptListFilters {
  category?: PromptCategory;
  tags?: string[];
  projectId?: string;
  search?: string; // Fuzzy search on title and content
}

/**
 * Sort options for listing prompts
 */
export type PromptSortBy =
  | "createdAt"
  | "updatedAt"
  | "lastUsed"
  | "usageCount"
  | "title";

export type PromptSortOrder = "asc" | "desc";

/**
 * Options for listing prompts
 */
export interface PromptListOptions {
  filters?: PromptListFilters;
  sortBy?: PromptSortBy;
  sortOrder?: PromptSortOrder;
  limit?: number;
  offset?: number;
}

/**
 * Result of prompt list query
 */
export interface PromptListResult {
  prompts: Prompt[];
  total: number;
  hasMore: boolean;
}

/**
 * Input for creating a prompt
 */
export interface CreatePromptInput {
  title: string;
  content: string;
  category: PromptCategory;
  tags?: string[];
  projectId?: string;
}

/**
 * Input for updating a prompt
 */
export interface UpdatePromptInput {
  id: string;
  title?: string;
  content?: string;
  category?: PromptCategory;
  tags?: string[];
  projectId?: string | null;
}

/**
 * Input for duplicating a prompt
 */
export interface DuplicatePromptInput {
  id: string;
  title?: string; // Optional override for duplicated title
}

/**
 * Utility type for prompt with usage stats
 */
export interface PromptWithStats extends Prompt {
  isFrequentlyUsed: boolean;
  isRecentlyUsed: boolean;
}
