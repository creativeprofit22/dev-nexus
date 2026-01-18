import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";

/**
 * Versions table - Stores content snapshots for prompts and notes
 *
 * Design:
 * - Generic versioning using entityType + entityId pattern
 * - Stores full content snapshot (not diffs) for simplicity
 * - Timestamps stored as ISO strings (consistent with other schemas)
 * - Cascade delete when parent entity is deleted
 *
 * Note: No foreign key constraint since entityId can reference
 * either prompts or notes table. Cleanup is handled by the
 * entity's delete procedure.
 */
export const versions = sqliteTable(
  "versions",
  {
    id: text("id").primaryKey(),
    entityType: text("entityType").notNull(), // "prompt" | "note"
    entityId: text("entityId").notNull(), // ID of the prompt or note
    title: text("title").notNull(), // Title at time of snapshot
    content: text("content").notNull(), // Content at time of snapshot
    createdAt: text("createdAt").notNull(), // When this version was created
  },
  (table) => ({
    entityIdx: index("idx_versions_entity").on(
      table.entityType,
      table.entityId
    ),
    createdAtIdx: index("idx_versions_createdAt").on(table.createdAt),
  })
);
