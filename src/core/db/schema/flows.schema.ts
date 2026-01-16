import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects.schema";

export const flows = sqliteTable(
  "flows",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    nodes: text("nodes", { mode: "json" })
      .$type<ReactFlowNode[]>()
      .default(sql`'[]'`)
      .notNull(),
    edges: text("edges", { mode: "json" })
      .$type<ReactFlowEdge[]>()
      .default(sql`'[]'`)
      .notNull(),
    viewport: text("viewport", { mode: "json" })
      .$type<{ x: number; y: number; zoom: number }>()
      .notNull(),
    thumbnail: text("thumbnail"),
    projectId: text("projectId").references(() => projects.id, {
      onDelete: "cascade",
    }),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
  },
  (table) => ({
    projectIdIdx: index("idx_flows_projectId").on(table.projectId),
  })
);

// Type definitions for ReactFlow (these would normally come from @xyflow/react)
export interface ReactFlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: unknown;
  [key: string]: unknown;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  [key: string]: unknown;
}
