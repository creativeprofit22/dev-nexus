import type { notes } from "@/core/db/schema/notes.schema";

/**
 * Note entity type inferred from database schema
 */
export type NoteSelect = typeof notes.$inferSelect;

/**
 * Input type for inserting a new note
 */
export type NoteInsert = typeof notes.$inferInsert;

/**
 * Input for creating a new note
 */
export interface CreateNoteInput {
  title: string;
  content: string; // Tiptap JSON or HTML content
  tags?: string[];
  projectId?: string;
  isPinned?: boolean;
}

/**
 * Input for updating an existing note
 */
export interface UpdateNoteInput {
  title?: string;
  content?: string; // Tiptap JSON or HTML content
  tags?: string[];
  projectId?: string | null;
  isPinned?: boolean;
}

/**
 * Filter options for listing notes
 */
export interface NoteFilters {
  tags?: string[];
  search?: string; // Fuzzy search on title
  projectId?: string;
  isPinned?: boolean;
}

/**
 * Sort options for listing notes
 */
export type NoteSortBy = "createdAt" | "updatedAt" | "title";

export type NoteSortOrder = "asc" | "desc";

/**
 * Options for listing notes
 */
export interface NoteListOptions {
  filters?: NoteFilters;
  sortBy?: NoteSortBy;
  sortOrder?: NoteSortOrder;
  limit?: number;
  offset?: number;
}

/**
 * Result of note list query
 */
export interface NoteListResult {
  notes: NoteSelect[];
  total: number;
  hasMore: boolean;
}

/**
 * Input for duplicating a note
 */
export interface DuplicateNoteInput {
  id: string;
  title?: string; // Optional override for duplicated title
}
