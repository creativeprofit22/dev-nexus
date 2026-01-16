import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects.schema";

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(), // Tiptap JSON or HTML as string
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`)
      .notNull(),
    projectId: text("projectId").references(() => projects.id, {
      onDelete: "set null",
    }),
    isPinned: integer("isPinned", { mode: "boolean" }).default(false).notNull(),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
  },
  (table) => ({
    projectIdIdx: index("idx_notes_projectId").on(table.projectId),
    updatedAtIdx: index("idx_notes_updatedAt").on(table.updatedAt),
    isPinnedIdx: index("idx_notes_isPinned").on(table.isPinned),
  })
);
