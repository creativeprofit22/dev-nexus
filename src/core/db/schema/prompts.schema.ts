import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const prompts = sqliteTable(
  "prompts",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`)
      .notNull(),
    variables: text("variables", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`)
      .notNull(),
    usageCount: integer("usageCount").default(0).notNull(),
    lastUsed: text("lastUsed"),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
  },
  (table) => ({
    categoryIdx: index("idx_prompts_category").on(table.category),
    usageCountIdx: index("idx_prompts_usageCount").on(table.usageCount),
  })
);
