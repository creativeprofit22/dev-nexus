import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects.schema";

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content", { mode: "json" })
      .$type<TiptapDocument>()
      .notNull(),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`)
      .notNull(),
    projectId: text("projectId").references(() => projects.id, {
      onDelete: "set null",
    }),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
  },
  (table) => ({
    projectIdIdx: index("idx_notes_projectId").on(table.projectId),
    updatedAtIdx: index("idx_notes_updatedAt").on(table.updatedAt),
  })
);

// Type definition for Tiptap document structure
export interface TiptapDocument {
  type: "doc";
  content?: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}
