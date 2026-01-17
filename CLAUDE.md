# DevNexus - Development Workstation

A visually immersive, local-first development workstation that unifies project management, prompt engineering, UI component design, user flow mapping, and notes with Three.js 3D visualization and SQLite storage.

**Location**: /mnt/e/Projects/dev-nexus
**Dev Server**: http://localhost:3000

## Pipeline State
Phase: build (gap implementation)
Feature: Documentation Gap Analysis - Implementing Missing Features
Current-Gap: TBD (see Gap Analysis below)
Session-Mode: Multi-session (clear context between gaps)

## Gap Analysis (2026-01-16)

### Priority 1: HIGH IMPACT
| Gap | Module | Status |
|-----|--------|--------|
| CommandPalette | Shared UI | DONE |
| Export PNG/SVG/PDF | Flows | DONE |
| Live Preview (iframe) | Components | DONE |
| VS Code click-to-open | Structure | NOT STARTED |
| Mentions (@project) | Notes | NOT STARTED |

### Priority 2: MEDIUM IMPACT
| Gap | Module | Status |
|-----|--------|--------|
| Version history | Prompts, Flows | NOT STARTED |
| Auto-fill variables | Prompts | NOT STARTED |
| Dependency graph | Structure | NOT STARTED |
| Animated edge particles | Flows | NOT STARTED |
| Node-Component linking | Flows | NOT STARTED |
| Markdown bi-directional | Notes | NOT STARTED |
| Syntax highlighting | Notes | NOT STARTED |
| Props editor UI | Components | NOT STARTED |

### Priority 3: DESIGN SYSTEM (Missing Visual Components)
**Not integrated from MOODBOARD_DESIGN_SYSTEM.md:**
- GSAP animations (SplitText, GlitchText, Magnetic, ScrollTrigger)
- Glassmorphism/Claymorphism cards
- Dark Neumorphism inputs with glow
- Neo-Brutalism buttons (hard shadows)
- Cyberpunk effects (neon, clip-path)
- 3D mouse-tracking cards
- Floating animations

### Module Completion Status
| Module | Core % | Visual % | Notes |
|--------|--------|----------|-------|
| Project Hub | 95% | 40% | Missing fancy cards |
| Prompt Library | 75% | 40% | Missing version history, fancy UI |
| Notes | 65% | 40% | Missing mentions, syntax highlight |
| Component Studio | 70% | 40% | Missing props editor |
| Flow Mapper | 55% | 40% | Missing export, animations |
| Structure Explorer | 40% | 60% | Missing dependency graph, VS Code |
| Shared UI | 70% | 20% | Missing CommandPalette, design system |

---

## Project Structure

```
dev-nexus/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (authenticated)/      # Protected routes
│   │   ├── api/trpc/[trpc]/      # tRPC API endpoint
│   │   └── globals.css           # Global styles
│   │
│   ├── core/                     # Core infrastructure
│   │   ├── db/schema/            # Drizzle tables
│   │   └── trpc/                 # Type-safe API
│   │
│   ├── modules/                  # Feature modules
│   │   ├── _core/                # AppShell, Sidebar, ContentArea
│   │   ├── projects/             # Project Hub
│   │   ├── prompts/              # Prompt Library
│   │   ├── components/           # Component Studio
│   │   ├── flows/                # Flow Mapper
│   │   ├── notes/                # Notes
│   │   ├── structure/            # 3D Structure Explorer
│   │   └── settings/             # Settings
│   │
│   └── shared/components/ui/     # Button, Card, Input, Dialog, ConfirmDialog
│
├── docs/architecture/            # PROJECT_PLAN.md, ARCHITECTURE.md, DATABASE_SCHEMA.md
├── MOODBOARD_DESIGN_SYSTEM.md    # Visual design specs (NOT YET IMPLEMENTED)
└── COMPONENT_RESEARCH_2026.md    # GSAP/R3F patterns (NOT YET IMPLEMENTED)
```

---

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

---

## Code Quality - Zero Tolerance

After editing ANY file:

```bash
bun run typecheck    # Fix ALL TypeScript errors
bun run lint         # Fix ALL linting errors
```

Server restart for: db schema (`bun run db:push`), env vars, config files.

---

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript 5
- **Database**: SQLite + Drizzle ORM + better-sqlite3
- **API**: tRPC 11 + React Query 5 + Zod
- **Styling**: Tailwind CSS v4
- **3D**: Three.js + React Three Fiber + drei
- **UI**: ReactFlow, react-grid-layout (installed, unused), Tiptap
- **Animation**: GSAP (installed, minimal use)
- **Testing**: Vitest + Playwright

---

## Key Docs

- `docs/architecture/PROJECT_PLAN.md` - Feature specs
- `docs/architecture/ARCHITECTURE.md` - System design
- `docs/architecture/DATABASE_SCHEMA.md` - Database structure
- `MOODBOARD_DESIGN_SYSTEM.md` - Visual component specs
- `COMPONENT_RESEARCH_2026.md` - GSAP/R3F patterns

---

## Critical Reminders

1. **Use Bun** - All commands use `bun`
2. **SQLite + Drizzle** - Not Prisma
3. **Modular** - Keep modules independent
4. **Zero tolerance** - Fix ALL errors
5. **Component limits** - Max 200 lines
