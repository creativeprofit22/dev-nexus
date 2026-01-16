import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { projects } from "./projects.schema";
import { prompts } from "./prompts.schema";
import { flows } from "./flows.schema";
import { components } from "./components.schema";

export const projectPrompts = sqliteTable(
  "project_prompts",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    promptId: text("promptId")
      .notNull()
      .references(() => prompts.id, { onDelete: "cascade" }),
    createdAt: text("createdAt").notNull(),
  },
  (table) => ({
    projectIdIdx: index("idx_project_prompts_projectId").on(table.projectId),
    promptIdIdx: index("idx_project_prompts_promptId").on(table.promptId),
  })
);

export const flowComponents = sqliteTable(
  "flow_components",
  {
    id: text("id").primaryKey(),
    flowId: text("flowId")
      .notNull()
      .references(() => flows.id, { onDelete: "cascade" }),
    componentId: text("componentId")
      .notNull()
      .references(() => components.id, { onDelete: "cascade" }),
    nodeId: text("nodeId").notNull(),
    createdAt: text("createdAt").notNull(),
  },
  (table) => ({
    flowIdIdx: index("idx_flow_components_flowId").on(table.flowId),
    componentIdIdx: index("idx_flow_components_componentId").on(
      table.componentId
    ),
  })
);
