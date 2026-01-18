# DevNexus - Development Workstation

A visually immersive, local-first development workstation unifying project management, prompt engineering, UI component design, user flow mapping, and notes with Three.js 3D visualization and SQLite storage.

**Location**: /mnt/e/Projects/dev-nexus
**Dev Server**: http://localhost:3000

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (authenticated)/      # Protected routes (projects, prompts, notes, flows, components, structure)
│   ├── api/trpc/[trpc]/      # tRPC API endpoint
│   └── globals.css           # Global styles (Tailwind v4)
├── core/                     # Core infrastructure
│   ├── db/schema/            # Drizzle ORM tables
│   └── trpc/                 # Type-safe API setup
├── modules/                  # Feature modules (independent)
│   ├── _core/                # AppShell, Sidebar, ContentArea
│   ├── projects/             # Project Hub
│   ├── prompts/              # Prompt Library
│   ├── components/           # Component Studio
│   ├── flows/                # Flow Mapper (ReactFlow)
│   ├── notes/                # Notes (Tiptap + @mentions)
│   ├── structure/            # Structure Explorer
│   └── settings/             # Settings
└── shared/components/ui/     # Button, Card, Input, Dialog, ConfirmDialog, CommandPalette
```

## Organization Rules

**Module Structure**:
```
modules/[name]/
├── api/              # tRPC routers
├── components/views/ # Page-level views
├── hooks/            # Custom hooks
├── types/            # TypeScript types
└── module.config.ts  # Module metadata
```

**File Limits**: Components < 200 lines, Hooks < 150 lines
**No cross-module imports**: Modules are independent

## Code Quality - Zero Tolerance

After editing ANY file:

```bash
bun run typecheck    # Fix ALL TypeScript errors
bun run lint         # Fix ALL linting errors
```

Server restart required for: db schema (`bun run db:push`), env vars, config files.

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript 5
- **Database**: SQLite + Drizzle ORM + better-sqlite3
- **API**: tRPC 11 + React Query 5 + Zod
- **Styling**: Tailwind CSS v4
- **3D**: Three.js + React Three Fiber + drei
- **UI**: ReactFlow, Tiptap (rich text + mentions)
- **Animation**: GSAP (installed, minimal use)
- **Testing**: Vitest + Playwright

## Key Docs

- `docs/architecture/PROJECT_PLAN.md` - Feature specs
- `MOODBOARD_DESIGN_SYSTEM.md` - Visual component specs (Neo-Brutalism, Claymorphism, etc.)
- `COMPONENT_RESEARCH_2026.md` - GSAP/R3F patterns

## Pipeline State
Phase: refactor-hunt
Feature: Version History
Files-Validated: PromptEditor/index.tsx, prompts/page.tsx, VersionHistory/index.tsx, prompts.router.ts
Validation-Report: reports/validation-version-history.md

## Last Session (2026-01-17)
**Feature**: Version History - VALIDATED

**Bugs Fixed**:
- Race condition on restore double-click (added isRestoring prop)
- Auto-version spam removed (manual save only)
- PromptEditor state refresh after restore (key includes updatedAt)
- Cascade delete for versions when prompt deleted

**Bottlenecks Fixed**:
- Memoized detectedVariables and filteredVariables

**Status**: All checks passing, ready for refactor-hunt

## Current Status

**Completed**: CommandPalette, Export PNG/SVG/PDF, Live Preview, VS Code click-to-open, Mentions (@project), Version History

**Pending Priority 2**: Auto-fill variables, Dependency graph, Animated edges, Syntax highlighting, Props editor UI

**Pending Priority 3**: Design system components from MOODBOARD_DESIGN_SYSTEM.md (GSAP animations, Glassmorphism cards, Neumorphism inputs, Neo-Brutalism buttons, Cyberpunk effects)

## Critical Reminders

1. **Use Bun** - All commands use `bun`
2. **SQLite + Drizzle** - Not Prisma
3. **Modular** - Keep modules independent
4. **Zero tolerance** - Fix ALL errors
5. **Component limits** - Max 200 lines
