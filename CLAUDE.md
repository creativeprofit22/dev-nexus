# DevNexus - Development Workstation

A visually immersive, local-first development workstation that unifies project management, prompt engineering, UI component design, user flow mapping, and notes with Three.js 3D visualization and SQLite storage.

**Status**: Phase 4 Complete - Final Polish
**Location**: /mnt/e/Projects/dev-nexus
**Dev Server**: http://localhost:3000

## Pipeline State
Phase: complete
Feature: Final polish and testing complete
Features-Completed: Projects, Prompts, Notes, Components, Flow Mapper, Claude Code Sync, Structure Explorer (3D), Final Polish
Features-Remaining: None

## Last Session (2026-01-16)
**Feature**: Final Polish & Testing - COMPLETE ✅

### Fixes Implemented

**Critical Bug Fixes:**
1. Dialog CSS variables - Replaced undefined semantic classes with hardcoded hex colors
2. Clipboard error handling - Added try-catch to all navigator.clipboard calls (PromptCard, NoteCard, ComponentPreview)
3. Terminal race condition - Fixed with `resolved` flag to prevent multiple resolves
4. JSON parse safety - Added try-catch fallback in NoteEditor for corrupted content
5. Duplicate button error handling - Added .catch() handlers for mutateAsync calls

**UX Improvements:**
1. Created ConfirmDialog component - Replaced all window.confirm() with styled dialogs
2. Updated ComponentsView, FlowCard, PromptCard, NoteCard, ProjectCard - All use ConfirmDialog
3. ProjectCard - Replaced alert() with inline error toast

**Accessibility Improvements:**
1. Dialog - Added focus ring to close button
2. Sidebar - Added aria-label to nav, aria-current to active links, aria-expanded to toggle, focus rings
3. ComponentCard - Added focus ring and aria-pressed to favorite button
4. PromptCard - Added aria-expanded and aria-label to expand/collapse button

### Files Created
- `src/shared/components/ui/ConfirmDialog/index.tsx` - Reusable confirmation dialog

### Files Modified
- `src/shared/components/ui/Dialog/index.tsx` - Fixed CSS colors, added focus ring
- `src/modules/prompts/components/PromptCard/index.tsx` - Clipboard error handling, ConfirmDialog
- `src/modules/notes/components/NoteCard/index.tsx` - Clipboard error handling, ConfirmDialog
- `src/modules/notes/components/NoteEditor/index.tsx` - JSON parse safety
- `src/modules/components/components/ComponentPreview/index.tsx` - Clipboard error handling
- `src/modules/components/components/ComponentCard/index.tsx` - Accessibility improvements
- `src/modules/components/components/views/ComponentsView.tsx` - ConfirmDialog
- `src/modules/flows/components/FlowCard/index.tsx` - ConfirmDialog
- `src/modules/projects/api/vscode.ts` - Fixed race condition
- `src/modules/projects/components/ProjectCard/index.tsx` - ConfirmDialog, error toasts
- `src/modules/_core/components/Sidebar/index.tsx` - Accessibility improvements

### Test Coverage (59 tests)
- `src/tests/setup.ts` - Vitest setup with browser mocks
- `src/shared/components/ui/Button/Button.test.tsx` - 12 tests (variants, sizes, states)
- `src/shared/components/ui/Dialog/Dialog.test.tsx` - 11 tests (open/close, accessibility)
- `src/shared/components/ui/ConfirmDialog/ConfirmDialog.test.tsx` - 12 tests (confirm/cancel, loading, variants)
- `src/shared/components/ui/Input/Input.test.tsx` - 12 tests (types, validation, error states)
- `src/shared/components/ui/Card/Card.test.tsx` - 12 tests (variants, click handling, keyboard)

### Color Consistency Fixes
- ProjectCard dropdown menu - Standardized to `#181c24` / `#212730`
- ComponentCard tag borders - Standardized to `#2d3548`

### Quality Checks
- TypeScript: ✅ 0 errors
- Build: ✅ Successful
- Tests: ✅ 59 passing

---

## Previous Session (2026-01-16)
**Feature**: Structure Explorer (3D) - COMPLETE ✅

### Implementation
3D visualization of project file structure using React Three Fiber:
- tRPC router with 3 procedures (scan, get, getForProject)
- Radial tree layout algorithm for 3D positioning
- Color-coded nodes by file type (TS=blue, JS=yellow, CSS=pink, etc.)
- Project selector dropdown with auto-selection
- Interactive OrbitControls for 3D navigation

### Files Created (11 files, 1,216 lines)
- `src/modules/structure/api/structure.router.ts` - tRPC backend with directory scanning
- `src/modules/structure/types/structure.types.ts` - TypeScript types
- `src/modules/structure/hooks/useStructure.ts` - Query hook
- `src/modules/structure/hooks/useStructureMutations.ts` - Mutation hook
- `src/modules/structure/components/views/StructureView.tsx` - Main page view
- `src/modules/structure/components/StructureExplorer/index.tsx` - R3F canvas
- `src/modules/structure/components/StructureExplorer/TreeLayout.tsx` - Layout algorithm
- `src/modules/structure/components/StructureExplorer/FileTreeNode.tsx` - 3D node component
- `src/modules/structure/index.ts` - Module exports
- `src/app/(authenticated)/structure/page.tsx` - Route page

### Files Modified
- `src/core/trpc/router.ts` - Added structureRouter

### Quality Checks
- TypeScript: ✅ 0 errors
- ESLint: ✅ 0 errors
- Commit: ✅ Pushed to main (8f58301)

---

## Previous Session (2026-01-16 Earlier)
**Feature**: Claude Code Sync - COMPLETE ✅

### Implementation
System to sync CLAUDE.md files between DevNexus projects and their actual project directories:
- tRPC router with 4 procedures (readFromDisk, get, syncFromDisk, saveToDisk)
- React hooks (useClaudeMd, useClaudeMdMutations)
- ClaudeMdEditor component with two-way sync
- Integrated into Projects page via detail dialog

### Files Created
- `src/modules/projects/api/claudemd.router.ts` - tRPC procedures for CLAUDE.md sync
- `src/modules/projects/hooks/useClaudeMd.ts` - Query and mutation hooks
- `src/modules/projects/components/ClaudeMdEditor/index.tsx` - Editor with sync status

### Files Modified
- `src/core/trpc/router.ts` - Added claudeMdRouter
- `src/app/(authenticated)/projects/page.tsx` - Added project detail dialog with editor

### Quality Checks
- TypeScript: ✅ New code compiles (pre-existing errors in flows module)
- ESLint: ✅ 0 errors in new code

---

## Previous Session (2026-01-16 Earlier)
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

### Phase 2: Content Management ✅ COMPLETE
- [x] Prompt Library (full CRUD with variables, categories, tags)
- [x] Notes with Tiptap (rich text editing, organization)
- [x] Claude Code Sync (two-way CLAUDE.md sync between DevNexus and project directories)

### Phase 3: Visual Tools ✅ COMPLETE
- [x] Component Studio (live previews, code editor, props/variants, favorites, usage tracking)
- [x] Flow Mapper with ReactFlow

### Phase 4: 3D & Polish ✅ COMPLETE
- [x] Structure Explorer (Three.js file tree visualization)
- [x] Final polish (bug fixes, UX improvements, accessibility)
- [x] Build verification

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
