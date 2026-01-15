# DevNexus - Database Schema

**Version**: 1.0.0
**Database**: SQLite via better-sqlite3 + Drizzle ORM
**Date**: 2026-01-15

---

## 📊 Schema Overview

```
projects (1) ──< (M) project_prompts (M) >── (1) prompts
    │
    └── (1) ──< (M) notes
    │
    └── (1) ──< (1) project_structure
    │
    └── (1) ──< (M) components

flows (1) ──< (M) flow_components (M) >── (1) components
```

---

## 🗂️ Tables

### projects

Stores project metadata, paths, and configuration.

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,                    -- UUID
  name TEXT NOT NULL,
  description TEXT,
  pathWSL TEXT NOT NULL UNIQUE,          -- /mnt/e/Projects/...
  pathWindows TEXT NOT NULL UNIQUE,      -- E:\Projects\...
  techStack TEXT NOT NULL DEFAULT '[]',  -- JSON array: ["React", "Next.js"]
  status TEXT NOT NULL DEFAULT 'active', -- active | paused | completed
  claudeMd TEXT,                         -- Parsed CLAUDE.md content
  lastAccessed TEXT NOT NULL,            -- ISO timestamp
  createdAt TEXT NOT NULL,               -- ISO timestamp
  updatedAt TEXT NOT NULL                -- ISO timestamp
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_lastAccessed ON projects(lastAccessed DESC);
```

**Drizzle Schema**:
```typescript
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  pathWSL: text('pathWSL').notNull().unique(),
  pathWindows: text('pathWindows').notNull().unique(),
  techStack: text('techStack', { mode: 'json' })
    .$type<string[]>()
    .default(sql`'[]'`)
    .notNull(),
  status: text('status', { enum: ['active', 'paused', 'completed'] })
    .default('active')
    .notNull(),
  claudeMd: text('claudeMd'),
  lastAccessed: text('lastAccessed').notNull(),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});
```

---

### prompts

Stores reusable prompts with variable substitution.

```sql
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,                 -- Prompt with {{variables}}
  category TEXT NOT NULL,                -- debugging, refactoring, features
  tags TEXT NOT NULL DEFAULT '[]',       -- JSON array
  variables TEXT NOT NULL DEFAULT '[]',  -- JSON array: ["project_name", "tech_stack"]
  usageCount INTEGER NOT NULL DEFAULT 0,
  lastUsed TEXT,                         -- ISO timestamp
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_usageCount ON prompts(usageCount DESC);
CREATE VIRTUAL TABLE prompts_fts USING fts5(title, content, content=prompts, content_rowid=rowid);
```

**Drizzle Schema**:
```typescript
export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  tags: text('tags', { mode: 'json' })
    .$type<string[]>()
    .default(sql`'[]'`)
    .notNull(),
  variables: text('variables', { mode: 'json' })
    .$type<string[]>()
    .default(sql`'[]'`)
    .notNull(),
  usageCount: integer('usageCount').default(0).notNull(),
  lastUsed: text('lastUsed'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});
```

---

### components

Stores UI component library with code and metadata.

```sql
CREATE TABLE components (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,                    -- TSX/JSX code
  props TEXT NOT NULL DEFAULT '[]',      -- JSON: [{name, type, required, default}]
  variants TEXT NOT NULL DEFAULT '[]',   -- JSON: [{name, props}]
  category TEXT NOT NULL,                -- button, card, layout, 3d, etc.
  tags TEXT NOT NULL DEFAULT '[]',
  preview TEXT,                          -- Base64 image or URL
  projectId TEXT,                        -- Optional project link
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_components_projectId ON components(projectId);
```

**Drizzle Schema**:
```typescript
export const components = sqliteTable('components', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  code: text('code').notNull(),
  props: text('props', { mode: 'json' })
    .$type<ComponentProp[]>()
    .default(sql`'[]'`)
    .notNull(),
  variants: text('variants', { mode: 'json' })
    .$type<ComponentVariant[]>()
    .default(sql`'[]'`)
    .notNull(),
  category: text('category').notNull(),
  tags: text('tags', { mode: 'json' })
    .$type<string[]>()
    .default(sql`'[]'`)
    .notNull(),
  preview: text('preview'),
  projectId: text('projectId').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});
```

---

### flows

Stores user flow diagrams (ReactFlow format).

```sql
CREATE TABLE flows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  nodes TEXT NOT NULL DEFAULT '[]',      -- ReactFlow nodes JSON
  edges TEXT NOT NULL DEFAULT '[]',      -- ReactFlow edges JSON
  viewport TEXT NOT NULL,                -- JSON: {x, y, zoom}
  thumbnail TEXT,                        -- Base64 preview
  projectId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_flows_projectId ON flows(projectId);
```

**Drizzle Schema**:
```typescript
export const flows = sqliteTable('flows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  nodes: text('nodes', { mode: 'json' })
    .$type<ReactFlowNode[]>()
    .default(sql`'[]'`)
    .notNull(),
  edges: text('edges', { mode: 'json' })
    .$type<ReactFlowEdge[]>()
    .default(sql`'[]'`)
    .notNull(),
  viewport: text('viewport', { mode: 'json' })
    .$type<{ x: number; y: number; zoom: number }>()
    .notNull(),
  thumbnail: text('thumbnail'),
  projectId: text('projectId').references(() => projects.id, { onDelete: 'cascade' }),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});
```

---

### notes

Stores rich text notes (Tiptap format).

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,                 -- Tiptap JSON
  tags TEXT NOT NULL DEFAULT '[]',
  projectId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX idx_notes_projectId ON notes(projectId);
CREATE INDEX idx_notes_updatedAt ON notes(updatedAt DESC);
CREATE VIRTUAL TABLE notes_fts USING fts5(title, content, content=notes, content_rowid=rowid);
```

**Drizzle Schema**:
```typescript
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content', { mode: 'json' })
    .$type<TiptapDocument>()
    .notNull(),
  tags: text('tags', { mode: 'json' })
    .$type<string[]>()
    .default(sql`'[]'`)
    .notNull(),
  projectId: text('projectId').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});
```

---

### project_structure

Cached project file tree and dependency graph.

```sql
CREATE TABLE project_structure (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL UNIQUE,
  fileTree TEXT NOT NULL,                -- JSON tree structure
  dependencies TEXT NOT NULL,            -- JSON dependency graph
  components TEXT NOT NULL,              -- JSON React component tree
  lastScanned TEXT NOT NULL,             -- ISO timestamp
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_project_structure_projectId ON project_structure(projectId);
```

**Drizzle Schema**:
```typescript
export const projectStructure = sqliteTable('project_structure', {
  id: text('id').primaryKey(),
  projectId: text('projectId').notNull().unique().references(() => projects.id, { onDelete: 'cascade' }),
  fileTree: text('fileTree', { mode: 'json' })
    .$type<FileNode>()
    .notNull(),
  dependencies: text('dependencies', { mode: 'json' })
    .$type<DependencyGraph>()
    .notNull(),
  components: text('components', { mode: 'json' })
    .$type<ComponentNode[]>()
    .notNull(),
  lastScanned: text('lastScanned').notNull(),
});
```

---

## 🔗 Junction Tables

### project_prompts

Many-to-many relationship between projects and prompts.

```sql
CREATE TABLE project_prompts (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  promptId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (promptId) REFERENCES prompts(id) ON DELETE CASCADE,
  UNIQUE(projectId, promptId)
);

CREATE INDEX idx_project_prompts_projectId ON project_prompts(projectId);
CREATE INDEX idx_project_prompts_promptId ON project_prompts(promptId);
```

---

### flow_components

Links flow nodes to components from the component library.

```sql
CREATE TABLE flow_components (
  id TEXT PRIMARY KEY,
  flowId TEXT NOT NULL,
  componentId TEXT NOT NULL,
  nodeId TEXT NOT NULL,                  -- ReactFlow node ID
  createdAt TEXT NOT NULL,
  FOREIGN KEY (flowId) REFERENCES flows(id) ON DELETE CASCADE,
  FOREIGN KEY (componentId) REFERENCES components(id) ON DELETE CASCADE,
  UNIQUE(flowId, componentId, nodeId)
);

CREATE INDEX idx_flow_components_flowId ON flow_components(flowId);
CREATE INDEX idx_flow_components_componentId ON flow_components(componentId);
```

---

## 🛠️ Utility Tables

### ran_migrations

Tracks applied database migrations.

```sql
CREATE TABLE ran_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  run_on TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📝 Type Definitions

### TypeScript Interfaces

```typescript
// Project
export interface Project {
  id: string;
  name: string;
  description?: string;
  pathWSL: string;
  pathWindows: string;
  techStack: string[];
  status: 'active' | 'paused' | 'completed';
  claudeMd?: string;
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
}

// Prompt
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

// Component
export interface Component {
  id: string;
  name: string;
  description?: string;
  code: string;
  props: ComponentProp[];
  variants: ComponentVariant[];
  category: string;
  tags: string[];
  preview?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description?: string;
}

export interface ComponentVariant {
  name: string;
  props: Record<string, any>;
}

// Flow
export interface Flow {
  id: string;
  name: string;
  description?: string;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  viewport: { x: number; y: number; zoom: number };
  thumbnail?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

// Note
export interface Note {
  id: string;
  title: string;
  content: TiptapDocument;
  tags: string[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

// Project Structure
export interface ProjectStructure {
  id: string;
  projectId: string;
  fileTree: FileNode;
  dependencies: DependencyGraph;
  components: ComponentNode[];
  lastScanned: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
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
  props: ComponentProp[];
  children: string[];
}
```

---

## 🚀 Initial Migration

```sql
-- Migration: 0000_initial_schema.sql

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  pathWSL TEXT NOT NULL UNIQUE,
  pathWindows TEXT NOT NULL UNIQUE,
  techStack TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active',
  claudeMd TEXT,
  lastAccessed TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_lastAccessed ON projects(lastAccessed DESC);

-- Prompts table
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  variables TEXT NOT NULL DEFAULT '[]',
  usageCount INTEGER NOT NULL DEFAULT 0,
  lastUsed TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_usageCount ON prompts(usageCount DESC);

-- Components table
CREATE TABLE components (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  props TEXT NOT NULL DEFAULT '[]',
  variants TEXT NOT NULL DEFAULT '[]',
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  preview TEXT,
  projectId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_components_projectId ON components(projectId);

-- Flows table
CREATE TABLE flows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  nodes TEXT NOT NULL DEFAULT '[]',
  edges TEXT NOT NULL DEFAULT '[]',
  viewport TEXT NOT NULL,
  thumbnail TEXT,
  projectId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_flows_projectId ON flows(projectId);

-- Notes table
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  projectId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES notes(id) ON DELETE SET NULL
);

CREATE INDEX idx_notes_projectId ON notes(projectId);
CREATE INDEX idx_notes_updatedAt ON notes(updatedAt DESC);

-- Project structure table
CREATE TABLE project_structure (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL UNIQUE,
  fileTree TEXT NOT NULL,
  dependencies TEXT NOT NULL,
  components TEXT NOT NULL,
  lastScanned TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_project_structure_projectId ON project_structure(projectId);

-- Junction tables
CREATE TABLE project_prompts (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  promptId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (promptId) REFERENCES prompts(id) ON DELETE CASCADE,
  UNIQUE(projectId, promptId)
);

CREATE INDEX idx_project_prompts_projectId ON project_prompts(projectId);
CREATE INDEX idx_project_prompts_promptId ON project_prompts(promptId);

CREATE TABLE flow_components (
  id TEXT PRIMARY KEY,
  flowId TEXT NOT NULL,
  componentId TEXT NOT NULL,
  nodeId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (flowId) REFERENCES flows(id) ON DELETE CASCADE,
  FOREIGN KEY (componentId) REFERENCES components(id) ON DELETE CASCADE,
  UNIQUE(flowId, componentId, nodeId)
);

CREATE INDEX idx_flow_components_flowId ON flow_components(flowId);
CREATE INDEX idx_flow_components_componentId ON flow_components(componentId);

-- Migrations tracking
CREATE TABLE ran_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  run_on TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Full-text search (future)
-- CREATE VIRTUAL TABLE prompts_fts USING fts5(title, content, content=prompts, content_rowid=rowid);
-- CREATE VIRTUAL TABLE notes_fts USING fts5(title, content, content=notes, content_rowid=rowid);
```

---

**Last Updated**: 2026-01-15
