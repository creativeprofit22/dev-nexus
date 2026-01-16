import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects.schema";

export type ComponentCategory = "react" | "threejs" | "gsap" | "ui" | "layout";

export const components = sqliteTable(
  "components",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    code: text("code").notNull(),
    props: text("props", { mode: "json" })
      .$type<ComponentProp[]>()
      .default(sql`'[]'`)
      .notNull(),
    variants: text("variants", { mode: "json" })
      .$type<ComponentVariant[]>()
      .default(sql`'[]'`)
      .notNull(),
    category: text("category").$type<ComponentCategory>().notNull(),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`)
      .notNull(),
    preview: text("preview"),
    projectId: text("projectId").references(() => projects.id, {
      onDelete: "set null",
    }),
    isFavorite: integer("isFavorite", { mode: "boolean" })
      .default(false)
      .notNull(),
    usageCount: integer("usageCount").default(0).notNull(),
    lastUsed: text("lastUsed"),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
  },
  (table) => ({
    categoryIdx: index("idx_components_category").on(table.category),
    projectIdIdx: index("idx_components_projectId").on(table.projectId),
  })
);

// Type definitions for JSON fields
export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  description?: string;
}

export interface ComponentVariant {
  name: string;
  props: Record<string, unknown>;
}
