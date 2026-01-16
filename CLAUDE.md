# DevNexus - Development Workstation

A visually immersive, local-first development workstation that unifies project management, prompt engineering, UI component design, user flow mapping, and notes with Three.js 3D visualization and SQLite storage.

**Status**: Phase 3 In Progress - Visual Tools
**Location**: /mnt/e/Projects/dev-nexus
**Dev Server**: http://localhost:3000

## Pipeline State
Phase: build
Feature: [Next feature TBD]
Features-Completed: Projects, Prompts, Notes, Components
Features-Remaining: Flow Mapper, Claude Code Sync, Structure Explorer (3D)

## Last Session (2026-01-16)
**Feature**: Component Studio - COMPLETE ✅

### Implementation
- Database schema with 15 columns (id, name, description, code, props, variants, category, tags, preview, projectId, isFavorite, usageCount, lastUsed, createdAt, updatedAt)
- tRPC router with 8 procedures (list, get, create, update, delete, duplicate, toggleFavorite, incrementUsage)
- React hooks (useComponents, useComponentMutations)
- UI components (ComponentCard, ComponentPreview, CodeEditor, ComponentsView)
- Next.js page at /components

### Files Created (14 files, 2,483 lines)
- `src/modules/components/api/components.router.ts` - tRPC API with full Zod validation
- `src/modules/components/types/component.types.ts` - TypeScript types
- `src/modules/components/hooks/useComponents.ts` - Query hook
- `src/modules/components/hooks/useComponentMutations.ts` - Mutation hooks
- `src/modules/components/components/ComponentCard/index.tsx` - Card display
- `src/modules/components/components/ComponentPreview/index.tsx` - Live preview
- `src/modules/components/components/CodeEditor/index.tsx` - Code editor
- `src/modules/components/components/views/ComponentsView.tsx` - Main view
- `src/app/(authenticated)/components/page.tsx` - Route page
- `drizzle/0001_thankful_talon.sql` - Database migration

### Quality Checks
- TypeScript: ✅ 0 errors
- ESLint: ✅ 0 errors
- Database: ✅ All columns migrated correctly
- Server: ✅ Running on http://localhost:3000
- Commit: ✅ Pushed to main (6fa687b)

---

## Project Structure

```
dev-nexus/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (authenticated)/      # Protected routes (projects, prompts, flows, notes, settings)
│   │   ├── api/trpc/[trpc]/      # tRPC API endpoint
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   │
│   ├── core/                     # Core infrastructure
│   │   ├── db/                   # Drizzle ORM + SQLite
│   │   │   ├── client.ts         # Database client
│   │   │   └── schema/           # Tables: projects, prompts, components, flows, notes
│   │   └── trpc/                 # Type-safe API layer
│   │       ├── router.ts         # Main router
│   │       ├── client.tsx        # Client provider
│   │       └── server.tsx        # Server utilities
│   │
│   ├── modules/                  # Feature modules (domain-driven)
│   │   ├── _core/                # Core layout (AppShell, Sidebar, ContentArea)
│   │   ├── projects/             # Project Hub
│   │   ├── prompts/              # Prompt Library
│   │   ├── components/           # Component Studio
│   │   ├── flows/                # Flow Mapper
│   │   ├── notes/                # Notes
│   │   └── settings/             # Settings
│   │
│   └── shared/                   # Shared utilities
│       ├── components/ui/        # Reusable UI components
│       ├── hooks/                # Custom hooks
│       ├── utils/                # Helper functions
│       └── types/                # Global types
│
├── data/                         # SQLite database storage
│   └── db.sqlite                 # Main database file
│
└── docs/                         # Documentation
    └── architecture/             # PROJECT_PLAN.md, ARCHITECTURE.md, DATABASE_SCHEMA.md
```

---

## Organization Rules

**Module Structure (STRICT)** - Each module follows this pattern:
```
modules/[name]/
├── api/              # tRPC routers
├── components/       # React components
│   └── views/        # Page-level views
├── hooks/            # Custom hooks
├── types/            # TypeScript types
├── layouts/          # Module layouts
└── module.config.ts  # Module metadata
```

**File Size Limits**:
- Components: **< 200 lines** (split if larger)
- Hooks: **< 150 lines**
- Utils: **< 100 lines**

**Import Rules**:
- ✅ Shared code: `@/shared/components/ui/Button`
- ✅ Same module: `@/modules/projects/hooks/useProject`
- ❌ Cross-module imports: No `@/modules/prompts` from projects module

**Keep modules independent** - Each feature is self-contained with its own API, components, hooks, and types.

---

## Code Quality - Zero Tolerance

After editing ANY file, run:

```bash
bun run typecheck    # Fix ALL TypeScript errors
bun run lint         # Fix ALL linting errors
```

**Server restart required for**:
- Database schema changes → `bun run db:push`
- Environment variables
- Core config (next.config.ts, drizzle.config.ts)

After restart:
1. Check server output at http://localhost:3000
2. Fix ALL errors/warnings before continuing
3. Verify tRPC health check: `curl http://localhost:3000/api/trpc/healthcheck`

---

## Tech Stack

**Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
**Database**: SQLite + Drizzle ORM + better-sqlite3
**API**: tRPC 11 + React Query 5 + Zod validation
**State**: Zustand + React Query
**Styling**: Tailwind CSS v4
**3D Graphics**: Three.js + React Three Fiber + drei
**UI Components**: ReactFlow, react-grid-layout, Tiptap
**Animation**: GSAP
**Testing**: Vitest + Playwright + Testing Library
**Quality**: ESLint + Prettier + Husky

---

## Implementation Status

### Phase 1: Foundation ✅ COMPLETE
- [x] Planning docs
- [x] Scaffold from boilerplate
- [x] Core layouts (AppShell, Sidebar, ContentArea)
- [x] Database setup (Drizzle + SQLite)
- [x] tRPC configuration
- [x] Project Hub module with full CRUD operations

### Phase 2: Content Management ⚠️ PARTIAL
- [x] Prompt Library (full CRUD with variables, categories, tags)
- [x] Notes with Tiptap (rich text editing, organization)
- [ ] Claude Code sync system

### Phase 3: Visual Tools ⚠️ IN PROGRESS
- [x] Component Studio (live previews, code editor, props/variants, favorites, usage tracking)
- [ ] **NEXT**: Flow Mapper with ReactFlow

### Phase 4: 3D & Polish
- [ ] Structure Explorer (Three.js file tree visualization)
- [ ] Performance optimization
- [ ] Final polish and testing

---

## Critical Reminders

1. **Use Bun, not npm** - All commands use `bun`
2. **SQLite, not Prisma** - Use Drizzle ORM with better-sqlite3
3. **Modular architecture** - Keep modules independent
4. **Zero tolerance** - Fix ALL errors before proceeding
5. **Component limits** - Max 200 lines per component

---

## Key Documentation

- `docs/architecture/PROJECT_PLAN.md` - Complete feature specs
- `docs/architecture/ARCHITECTURE.md` - System design patterns
- `docs/architecture/DATABASE_SCHEMA.md` - Database structure
- `docs/trpc-setup.md` - tRPC integration guide
