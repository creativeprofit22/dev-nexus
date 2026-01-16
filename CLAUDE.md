# DevNexus - Development Workstation

A visually immersive, local-first development workstation that unifies project management, prompt engineering, UI component design, user flow mapping, and notes with Three.js 3D visualization and SQLite storage.

**Status**: ✅ Scaffold Complete → Ready for Feature Development
**Phase**: Phase 1 - Foundation
**Next**: Build Project Hub Module (first feature)

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

### Phase 1: Foundation ✅ Scaffold Complete
- [x] Planning docs
- [x] Scaffold from boilerplate
- [x] Core layouts (AppShell, Sidebar, ContentArea)
- [x] Database setup (Drizzle + SQLite)
- [x] tRPC configuration
- [ ] **NEXT**: Project Hub module (first feature)

### Phase 2: Content Management
- [ ] Prompt Library
- [ ] Notes with Tiptap
- [ ] Claude Code sync

### Phase 3: Visual Tools
- [ ] Component Studio
- [ ] Flow Mapper with ReactFlow

### Phase 4: 3D & Polish
- [ ] Structure Explorer (Three.js)
- [ ] Performance optimization

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
