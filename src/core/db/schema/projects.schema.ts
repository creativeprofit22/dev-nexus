import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    pathWSL: text("pathWSL").notNull().unique(),
    pathWindows: text("pathWindows").notNull().unique(),
    techStack: text("techStack", { mode: "json" })
      .$type<string[]>()
      .default(sql`'[]'`)
      .notNull(),
    status: text("status", { enum: ["active", "paused", "completed"] })
      .default("active")
      .notNull(),
    claudeMd: text("claudeMd"),
    lastAccessed: text("lastAccessed").notNull(),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
  },
  (table) => ({
    statusIdx: index("idx_projects_status").on(table.status),
    lastAccessedIdx: index("idx_projects_lastAccessed").on(table.lastAccessed),
  })
);

export const projectStructure = sqliteTable(
  "project_structure",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .unique()
      .references(() => projects.id, { onDelete: "cascade" }),
    fileTree: text("fileTree", { mode: "json" }).$type<FileNode>().notNull(),
    dependencies: text("dependencies", { mode: "json" })
      .$type<DependencyGraph>()
      .notNull(),
    components: text("components", { mode: "json" })
      .$type<ComponentNode[]>()
      .notNull(),
    lastScanned: text("lastScanned").notNull(),
  },
  (table) => ({
    projectIdIdx: index("idx_project_structure_projectId").on(table.projectId),
  })
);

// Type definitions for JSON fields
export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: FileNode[];
}

export interface DependencyGraph {
  [filePath: string]: {
    imports: string[];
    exports: string[];
  };
}

export interface ComponentNode {
  name: string;
  path: string;
  props: ProjectComponentProp[];
  children: string[];
}

export interface ProjectComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  description?: string;
}
