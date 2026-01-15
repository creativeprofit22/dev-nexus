# DevNexus - Architecture Overview

**Version**: 1.0.0
**Date**: 2026-01-15

---

## 🎯 Architectural Principles

### 1. Modular by Design
Every feature is a self-contained module that can be:
- Developed independently
- Tested in isolation
- Enabled/disabled via feature flags
- Lazy-loaded for performance
- Extended through plugins

### 2. Local-First Architecture
- **Single source of truth**: SQLite database
- **Synchronous I/O**: Fast, predictable performance
- **Offline-capable**: No network dependency
- **Data ownership**: User controls their data
- **Optional sync**: Future cloud backup (opt-in)

### 3. Type-Safe Everything
- **TypeScript**: Compile-time safety
- **Drizzle ORM**: Type-safe database queries
- **tRPC**: End-to-end type safety (API)
- **Zod**: Runtime validation

### 4. Progressive Enhancement
- **Core features**: Work without JavaScript
- **Enhanced UX**: Rich interactions with JS
- **3D features**: Lazy-loaded, optional
- **Graceful degradation**: Fallbacks for everything

---

## 📦 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
├─────────────────────────────────────────────────────────────┤
│  React UI Layer                                             │
│  ├─ Modules (Projects, Prompts, Components, Flows, Notes)  │
│  ├─ Shared Components (UI, Three.js, Layouts)              │
│  └─ Core (AppShell, CommandPalette, Navigation)            │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                     │
│  ├─ React Query (Server state, caching)                    │
│  ├─ Zustand (Client state, UI state)                       │
│  └─ tRPC Client (Type-safe API calls)                      │
├─────────────────────────────────────────────────────────────┤
│  Next.js Server (App Router)                               │
│  ├─ React Server Components                                │
│  ├─ API Routes (tRPC endpoints)                            │
│  └─ SSR/SSG pages                                           │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├─ tRPC Routers (API implementation)                      │
│  ├─ Service Layer (Complex operations)                     │
│  └─ Validation (Zod schemas)                               │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer                                          │
│  ├─ Drizzle ORM (Query builder)                            │
│  └─ better-sqlite3 (SQLite driver)                         │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer                                              │
│  └─ SQLite Database (./data/db.sqlite)                     │
└─────────────────────────────────────────────────────────────┘

External Integrations:
├─ VS Code (CLI commands, shell scripts)
├─ Claude Code (Shared SQLite, sync markers)
├─ File System (Project scanning, structure parsing)
└─ Future: Google Drive, Notion, GitHub
```

---

## 🗂️ Module Architecture

### Module Structure

Each module follows this exact structure:

```
src/modules/[module-name]/
├── components/              # React components
│   ├── views/              # Page-level views
│   │   └── [ViewName]/
│   │       ├── index.tsx
│   │       └── [ViewName].types.ts
│   └── [ComponentName]/    # Reusable components
│       ├── index.tsx       (~150 lines max)
│       ├── [ComponentName].types.ts
│       └── [ComponentName].test.tsx
│
├── hooks/                   # Custom hooks (business logic)
│   ├── use[ModuleName].ts
│   ├── use[ModuleName]Mutations.ts
│   └── use[ModuleName]State.ts
│
├── api/                     # tRPC routers
│   └── [module].router.ts
│
├── stores/                  # Zustand stores (if needed)
│   └── [module]Store.ts
│
├── utils/                   # Module-specific utilities
│   └── [utility].ts
│
├── types/                   # TypeScript types
│   └── [module].types.ts
│
├── layouts/                 # Module-specific layouts
│   └── [Module]Layout.tsx
│
├── navigation/              # Route definitions
│   └── routes.ts
│
├── module.config.ts         # Module metadata
├── CHANGELOG.md            # Module changelog
└── index.ts                # Public API exports
```

### Module Configuration

Every module exports a configuration object:

```typescript
// module.config.ts
export const ModuleConfig = {
  // Identity
  id: 'projects',
  name: 'Projects',
  icon: '📦',
  version: '2.1.0',
  status: 'stable',  // stable | beta | experimental

  // Navigation
  navigation: {
    order: 1,
    showInSidebar: true,
    routes: { /* ... */ },
  },

  // Commands (for command palette)
  commands: [/* ... */],

  // Features (sub-features within module)
  features: {
    basicCRUD: { enabled: true, version: '1.0.0' },
    aiSuggestions: { enabled: false, version: '2.1.0' },
  },

  // Dependencies
  dependencies: [],           // Other modules required
  integrations: [],           // External integrations

  // API
  api: {
    version: 'v2',
    endpoints: ['list', 'get', 'create', 'update', 'delete'],
  },
};
```

### Module Registry

Auto-discovery system:

```typescript
// src/core/modules/registry.ts
import { ProjectsModuleConfig } from '@/modules/projects/module.config';
import { PromptsModuleConfig } from '@/modules/prompts/module.config';
// ... other modules

export const MODULE_REGISTRY = {
  projects: ProjectsModuleConfig,
  prompts: PromptsModuleConfig,
  // ... auto-registered
};

// Generate navigation from modules
export const getNavigation = () => {
  return Object.values(MODULE_REGISTRY)
    .filter(m => m.navigation.showInSidebar)
    .sort((a, b) => a.navigation.order - b.navigation.order);
};
```

---

## 🎨 Layout System

### Layout Hierarchy

```
app/layout.tsx (Root)
└─ Providers (Query, tRPC, Theme)
   └─ {children}

app/(authenticated)/layout.tsx
└─ AppShell
   ├─ Sidebar
   ├─ ContentArea
   │  └─ {children}  // Module layouts nest here
   └─ ContextPanel

app/(authenticated)/projects/layout.tsx
└─ ModuleLayout
   ├─ ModuleHeader
   └─ {children}  // Page content

app/(authenticated)/projects/[id]/layout.tsx
└─ ProjectDetailLayout
   ├─ ProjectTabs
   └─ {children}  // Tab content
```

### Layout Components

**AppShell** (Main container):
- Sidebar (collapsible, left)
- ContentArea (center, flex-1)
- ContextPanel (collapsible, right)
- CommandPalette (global overlay)

**Sidebar**:
- Logo/branding
- Navigation (auto-generated from modules)
- User menu
- Settings link

**ContentArea**:
- Breadcrumbs (auto-generated from route)
- Page content
- Scroll container

**ContextPanel**:
- AI Assistant
- Quick info/metadata
- Related items
- Project-specific tools

---

## 🔌 Data Flow

### Read Pattern (Query)

```
User Action
    ↓
React Component
    ↓
Custom Hook (useProject)
    ↓
React Query (useQuery)
    ↓
tRPC Client
    ↓
HTTP Request → Next.js API Route
    ↓
tRPC Server (Router)
    ↓
Service Layer (business logic)
    ↓
Drizzle ORM (query builder)
    ↓
better-sqlite3 (SQLite driver)
    ↓
SQLite Database
    ↓
(Response bubbles back up)
```

### Write Pattern (Mutation)

```
User Action (button click)
    ↓
React Component
    ↓
Custom Hook (useProjectMutations)
    ↓
React Query (useMutation)
    ↓
tRPC Client
    ↓
HTTP Request → Next.js API Route
    ↓
tRPC Server (Router)
    ↓
Validation (Zod schema)
    ↓
Service Layer (business logic)
    ↓
Drizzle ORM (insert/update/delete)
    ↓
better-sqlite3
    ↓
SQLite Database
    ↓
(Success response)
    ↓
React Query invalidates cache
    ↓
UI re-fetches and updates
```

### Example: Create Project

```typescript
// 1. User clicks "Create Project" button
<Button onClick={() => createProject(formData)}>
  Create Project
</Button>

// 2. Component calls mutation hook
const { mutate: createProject } = useProjectMutations();

// 3. Hook uses React Query mutation
export const useProjectMutations = () => {
  const utils = trpc.useUtils();

  return trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
    },
  });
};

// 4. tRPC router handles request
export const projectsRouter = router({
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ input, ctx }) => {
      // 5. Validate input (Zod)
      const validated = createProjectSchema.parse(input);

      // 6. Business logic
      const project = await ctx.db.insert(projects).values({
        id: generateId(),
        name: validated.name,
        pathWSL: validated.pathWSL,
        pathWindows: convertToWindowsPath(validated.pathWSL),
        techStack: await detectTechStack(validated.pathWSL),
        status: 'active',
        createdAt: new Date().toISOString(),
      }).returning();

      return project;
    }),
});
```

---

## 🗄️ Database Architecture

### Schema Organization

Schema is split by domain for maintainability:

```
src/core/db/schema/
├── projects.schema.ts      # Projects table + relations
├── prompts.schema.ts       # Prompts table + relations
├── components.schema.ts    # Components table + relations
├── flows.schema.ts         # Flows table + relations
├── notes.schema.ts         # Notes table + relations
└── index.ts               # Re-exports all schemas
```

### Key Tables

**projects**:
- `id` (text, PK) - UUID
- `name` (text)
- `pathWSL` (text) - `/mnt/e/Projects/...`
- `pathWindows` (text) - `E:\Projects\...`
- `techStack` (text[], JSON) - React, Next.js, etc.
- `status` (enum) - active | paused | completed
- `claudeMd` (text) - Parsed CLAUDE.md content
- `lastAccessed` (text, ISO) - Last opened
- `createdAt` (text, ISO)

**prompts**:
- `id` (text, PK)
- `title` (text)
- `content` (text) - Prompt text with `{{variables}}`
- `category` (text)
- `tags` (text[], JSON)
- `variables` (text[], JSON) - Extracted `{{vars}}`
- `usageCount` (integer)
- `lastUsed` (text, ISO)
- `createdAt` (text, ISO)

**components**:
- `id` (text, PK)
- `name` (text)
- `description` (text)
- `code` (text) - TSX/JSX code
- `props` (text, JSON) - Prop definitions
- `variants` (text, JSON) - Theme variants
- `category` (text) - button, card, layout, 3d, etc.
- `tags` (text[], JSON)
- `projectId` (text, FK) - Optional project link
- `createdAt` (text, ISO)

**flows**:
- `id` (text, PK)
- `name` (text)
- `description` (text)
- `nodes` (text, JSON) - ReactFlow nodes array
- `edges` (text, JSON) - ReactFlow edges array
- `thumbnail` (text) - Base64 preview
- `projectId` (text, FK)
- `createdAt` (text, ISO)

**notes**:
- `id` (text, PK)
- `title` (text)
- `content` (text, JSON) - Tiptap document
- `tags` (text[], JSON)
- `projectId` (text, FK)
- `createdAt` (text, ISO)
- `updatedAt` (text, ISO)

### Relations

```sql
-- Many-to-many: Projects ↔ Prompts
CREATE TABLE project_prompts (
  projectId TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  promptId TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  PRIMARY KEY (projectId, promptId)
);

-- Many-to-many: Flows ↔ Components
CREATE TABLE flow_components (
  flowId TEXT NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  componentId TEXT NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  nodeId TEXT NOT NULL,  -- Which flow node uses this component
  PRIMARY KEY (flowId, componentId, nodeId)
);
```

---

## 🚀 Performance Optimizations

### Code Splitting

1. **Route-based splitting** (automatic with Next.js App Router)
2. **Module lazy loading**:
   ```typescript
   const StructureExplorer = lazy(() =>
     import('@/modules/structure/components/views/StructureView')
   );
   ```
3. **Component lazy loading**:
   ```typescript
   const ThreeCanvas = lazy(() => import('@/shared/components/three/Canvas'));
   ```

### Caching Strategy

**React Query Configuration**:
```typescript
{
  staleTime: 5 * 60 * 1000,      // 5 minutes
  cacheTime: 10 * 60 * 1000,     // 10 minutes
  refetchOnWindowFocus: false,   // Don't refetch on tab focus
  refetchOnMount: false,         // Use cache if available
}
```

**Query Keys** (hierarchical for easy invalidation):
```typescript
['projects']                     // All projects
['projects', projectId]          // Single project
['projects', projectId, 'notes'] // Project's notes
```

### Database Optimizations

1. **Indexes** on frequently queried columns:
   ```sql
   CREATE INDEX idx_projects_status ON projects(status);
   CREATE INDEX idx_prompts_category ON prompts(category);
   CREATE INDEX idx_notes_projectId ON notes(projectId);
   ```

2. **Prepared statements** for repeated queries
3. **Transactions** for bulk operations
4. **JSON columns** for complex data (avoid over-normalization)

### Rendering Optimizations

1. **React.memo** for expensive components
2. **useMemo** for expensive computations
3. **useCallback** for stable function references
4. **Virtual scrolling** for large lists (react-window)
5. **Web Workers** for heavy operations (file parsing)

---

## 🔐 Security Considerations

### Input Validation

**All inputs validated with Zod**:
```typescript
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  pathWSL: z.string().startsWith('/mnt/'),
  techStack: z.array(z.string()).optional(),
});
```

### SQL Injection Prevention

**Drizzle ORM handles parameterization**:
```typescript
// ✅ Safe (parameterized)
await db.select().from(projects).where(eq(projects.id, userId));

// ❌ Never do this
await db.execute(sql`SELECT * FROM projects WHERE id = '${userId}'`);
```

### Path Traversal Prevention

**Validate all file paths**:
```typescript
const isValidPath = (path: string) => {
  const resolved = path.resolve(path);
  return resolved.startsWith('/mnt/e/Projects/');
};
```

### XSS Prevention

**React handles escaping by default**:
- Use `dangerouslySetInnerHTML` only when absolutely necessary
- Sanitize HTML with DOMPurify if needed
- CSP headers in production

---

## 🧪 Testing Strategy

### Unit Tests
- **Vitest** for unit tests
- Test utilities, hooks, pure functions
- Target: 80%+ coverage

### Component Tests
- **Testing Library** for React components
- Test user interactions, not implementation
- Target: Critical paths covered

### Integration Tests
- **Playwright** for E2E tests
- Test full user workflows
- Target: Happy paths + critical errors

### Database Tests
- **In-memory SQLite** for fast tests
- Test migrations, queries, constraints
- Reset DB between tests

---

## 📊 Monitoring & Debugging

### Development Tools
- **React DevTools** - Component inspection
- **React Query DevTools** - Cache visualization
- **Drizzle Studio** - Database GUI
- **Next.js DevTools** - Performance metrics

### Logging Strategy
```typescript
// Structured logging
logger.info('Project created', { projectId, name, techStack });
logger.error('Failed to create project', { error, input });
```

### Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <Module />
</ErrorBoundary>
```

---

## 🔄 Migration Strategy

### Schema Migrations

**Drizzle Kit generates SQL migrations**:
```bash
bun run db:generate  # Generate migration
# Review generated SQL in drizzle/
bun run db:migrate   # Apply migration
```

**Custom migration runner** (inspired by Perplexica):
- Tracks applied migrations in `ran_migrations` table
- Skips already-applied migrations
- Supports rollback (via down functions)

### Data Migrations

For breaking changes:
```typescript
// src/core/migrations/v2-to-v3.ts
export const migrateV2ToV3 = async () => {
  // 1. Backup database
  // 2. Transform data
  // 3. Update schema version
  // 4. Verify integrity
};
```

---

## 🚢 Deployment

### Local Development
```bash
bun run dev          # Next.js dev server (port 3000)
bun run db:studio    # Drizzle Studio (port 4983)
```

### Production Build
```bash
bun run build        # Next.js production build
bun run start        # Start production server
```

### Electron Packaging (Future)
For native desktop app:
- Electron builder
- SQLite bundled with app
- Auto-updates via electron-updater

---

## 📚 Further Reading

- **Module Development**: `docs/modules/creating-modules.md`
- **Database Schema**: `docs/architecture/database-schema.md`
- **API Routes**: `docs/api/trpc-routes.md`
- **Testing Guide**: `docs/development/testing.md`

---

**Last Updated**: 2026-01-15
