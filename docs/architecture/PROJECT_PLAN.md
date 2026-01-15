# DevNexus - Project Plan

**Version**: 1.0.0
**Date**: 2026-01-15
**Status**: Planning Complete → Ready for Implementation

---

## 🎯 Project Vision

**DevNexus** is a visually immersive, local-first development workstation that unifies project management, prompt engineering, UI component design, user flow mapping, and notes into a single cohesive experience. Built with modern web technologies and designed for developers who work with Claude Code, VS Code, and multiple projects simultaneously.

### Core Philosophy
- **Local-First**: SQLite database, works offline, fast synchronous access
- **Modular Architecture**: Each feature is a self-contained module
- **Future-Proof**: Feature flags, plugin system, versioned APIs
- **Visually Rich**: Three.js 3D visualizations, GSAP animations, immersive UI
- **Developer-Centric**: Built for real workflows, not theoretical ones

---

## 📦 Core Features

### 1. Project Hub
**Purpose**: Centralized project management with path handling and VS Code integration

**Features**:
- Project cards with status indicators (active/paused/completed)
- Dual path management (Windows + WSL)
- Tech stack auto-detection (from package.json, etc.)
- Quick actions:
  - Open in VS Code (one-click)
  - Spawn additional terminals (Prisma Studio, test watch, etc.)
  - Copy paths (WSL or Windows)
- Session notes per project
- CLAUDE.md parsing and display
- Last accessed tracking

**Tech Stack**:
- React Grid Layout for drag/drop cards
- tRPC queries with React Query
- Zustand for local state

### 2. Prompt Library
**Purpose**: Organize, search, and manage reusable prompts with variable substitution

**Features**:
- Prompt categories and tags
- Variable system: `{{project_name}}`, `{{file_path}}`, `{{tech_stack}}`
- Auto-fill variables from project context
- Usage analytics (most used, last used)
- Version history per prompt
- Quick copy with one-click
- Search (fuzzy search with MiniSearch)
- Import/export to Drive/Notion (future)

**Tech Stack**:
- Tiptap for rich text editing
- Fuzzy search library
- tRPC + React Query

### 3. Component Studio
**Purpose**: Visual component library with live previews and code generation

**Features**:
- Component gallery (React, Three.js, GSAP)
- Live preview in iframe
- Props editor (visual form builder)
- Variants showcase (themes, sizes, states)
- Code export (copy TSX, CSS)
- Visual builder (drag-drop composition) - Phase 3
- Documentation generator (auto-parse TypeScript props)

**Tech Stack**:
- React Three Fiber (3D components)
- Monaco Editor (code display)
- TypeScript parser for props extraction

### 4. Flow Mapper
**Purpose**: Visual user flow and process mapping

**Features**:
- Canvas editor with drag-drop nodes
- Node types: Screen, Decision, Action, API Call
- Connect nodes with arrows (animated particles)
- Export to PNG/SVG/PDF
- Link flows to projects
- Link nodes to components (from Component Studio)
- Version history

**Tech Stack**:
- ReactFlow v12
- Canvas API for export
- tRPC for persistence

### 5. Notes
**Purpose**: Rich text notes with linking and organization

**Features**:
- Rich text editor (Tiptap)
- Markdown support (bi-directional)
- Code blocks with syntax highlighting
- Image embedding
- Mentions (link to projects, prompts, components)
- Tags and categories
- Search across all notes
- Link notes to projects

**Tech Stack**:
- Tiptap v2.22+ with custom extensions
- Markdown parser
- Syntax highlighting (lowlight)

### 6. Structure Explorer (3D)
**Purpose**: 3D visualization of project file structure and dependencies

**Features**:
- 3D file tree (folders as containers, files as nodes)
- Dependency graph (imports/exports)
- Component hierarchy (React component tree)
- Interactive navigation (click to open in VS Code)
- File size visualization (node size)
- File type coloring

**Tech Stack**:
- React Three Fiber
- drei (helpers)
- GSAP (camera animations)
- File system parser (async worker)

### 7. VS Code Integration
**Purpose**: Automate VS Code workflows from the app

**Features**:
- Open project in VS Code (`code` CLI)
- Spawn additional terminals
- Run predefined commands in terminals
- Path conversion (Windows ↔ WSL)

**Implementation**:
- Shell script generation
- VS Code CLI commands
- Optional: VS Code extension for tighter integration (future)

### 8. Claude Code Sync
**Purpose**: Bidirectional sync between Claude Code and DevNexus

**Features**:
- Shared SQLite database
- File-based sync markers (`.sync/pending-updates.json`)
- Manual sync button in UI
- Claude Code can read/write projects, prompts, components, flows, notes
- App shows "New items from Claude Code" notifications

**Implementation**:
- SQLite as single source of truth
- Sync marker system (not real-time, user-triggered)
- Helper prompts for Claude Code

---

## 🏗️ Technical Architecture

### Tech Stack

**Frontend**:
- Next.js 16+ (App Router, React Server Components)
- React 19
- TypeScript 5
- Tailwind CSS v4
- Bun (package manager + runtime)

**3D & Animation**:
- Three.js v0.160
- React Three Fiber v9.4
- drei v9.122
- GSAP v3.12

**UI Libraries**:
- ReactFlow v12 (flow mapper)
- React Grid Layout v1.4 (dashboard)
- Tiptap v2.22 (rich text)

**State Management**:
- Zustand v5 (client state)
- @tanstack/react-query v5.90 (server state)
- tRPC v11.8 (type-safe API)

**Database**:
- better-sqlite3 v11.9 (synchronous SQLite)
- Drizzle ORM v0.40 (type-safe queries)
- drizzle-kit v0.30 (migrations)

**Utilities**:
- clsx + tailwind-merge (classnames)
- date-fns (dates)
- zod (validation)

### Database Schema (Summary)

**Core Tables**:
- `projects` - Project metadata, paths, tech stack, status
- `prompts` - Prompt library with variables
- `components` - Component metadata, code, props
- `flows` - Flow diagrams (ReactFlow JSON)
- `notes` - Rich text notes (Tiptap JSON)
- `project_structure` - Cached file tree and dependency graph

**Relationships**:
- Projects ↔ Notes (many-to-many)
- Projects ↔ Prompts (many-to-many)
- Flows ↔ Components (many-to-many via flow nodes)

(See `docs/architecture/database-schema.md` for complete schema)

### Module Architecture

**Principles**:
- Feature-based modules (not layer-based)
- Each module is self-contained
- Max component size: ~200 lines
- Shared code in `src/shared/`
- Module metadata in `module.config.ts`

**Module Structure**:
```
src/modules/[module-name]/
├── components/        # UI components
├── hooks/            # Business logic
├── api/              # tRPC routers
├── types/            # TypeScript types
├── utils/            # Module utilities
├── layouts/          # Module-specific layouts
├── navigation/       # Route definitions
└── module.config.ts  # Module metadata
```

**Navigation Auto-Registration**:
- Each module exports `module.config.ts`
- Core registry auto-discovers modules
- Sidebar navigation auto-generated
- Command palette auto-populated

### Layout Hierarchy

```
Root Layout (Providers)
└─ Authenticated Layout (AppShell)
   ├─ Sidebar (navigation)
   ├─ ContentArea
   │  └─ Module Layout
   │     └─ Page Content
   └─ ContextPanel (AI assistant, info)
```

### URL Structure

```
/                           # Dashboard
/projects                   # Projects list
/projects/:id               # Project detail
/projects/:id/structure     # 3D structure view
/prompts                    # Prompt library
/prompts/:id                # Prompt detail
/components                 # Component library
/components/:id/preview     # Component preview
/flows                      # Flow list
/flows/:id/editor           # Flow editor
/notes                      # Notes list
/notes/:id/edit             # Note editor
/settings/*                 # Settings pages
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Working project hub with database

- [x] Project planning and documentation
- [ ] Initialize repository structure
- [ ] Set up Next.js + Bun + TypeScript
- [ ] Configure Tailwind CSS v4
- [ ] Set up SQLite + Drizzle ORM
- [ ] Design complete database schema
- [ ] Set up tRPC + React Query
- [ ] Build core layouts (AppShell, Sidebar, ContentArea)
- [ ] Build Project Hub module
  - [ ] Project list view
  - [ ] Project card component
  - [ ] Create/edit/delete projects
  - [ ] Path management (WSL/Windows)
- [ ] VS Code integration (basic)

**Deliverable**: Can manage projects and open them in VS Code

### Phase 2: Content Management (Week 3-4)
**Goal**: Prompt library and notes

- [ ] Build Prompt Library module
  - [ ] Prompt list/grid
  - [ ] Variable parser
  - [ ] Search functionality
  - [ ] Create/edit/delete prompts
- [ ] Build Notes module
  - [ ] Tiptap editor integration
  - [ ] Note list
  - [ ] Markdown support
  - [ ] Code highlighting
- [ ] Claude Code sync system
  - [ ] Sync marker files
  - [ ] Helper prompts
  - [ ] Notification system

**Deliverable**: Can manage prompts and notes, sync with Claude Code

### Phase 3: Visual Tools (Week 5-6)
**Goal**: Component studio and flow mapper

- [ ] Build Component Studio module
  - [ ] Component library view
  - [ ] Component preview
  - [ ] Props editor
  - [ ] Code export
- [ ] Build Flow Mapper module
  - [ ] ReactFlow canvas
  - [ ] Node types
  - [ ] Export functionality

**Deliverable**: Can create component libraries and flow diagrams

### Phase 4: 3D & Polish (Week 7-8)
**Goal**: 3D structure explorer and refinements

- [ ] Build Structure Explorer module
  - [ ] File tree parser
  - [ ] 3D visualization
  - [ ] Dependency graph
  - [ ] Interactive navigation
- [ ] Command palette
- [ ] Keyboard shortcuts
- [ ] Performance optimizations
- [ ] Documentation completion
- [ ] Testing

**Deliverable**: Complete v1.0.0

### Phase 5: Integrations (Future)
- [ ] Google Drive sync
- [ ] Notion integration
- [ ] GitHub integration
- [ ] Real-time collaboration (Yjs)
- [ ] AI assistant panel
- [ ] Mobile view

---

## 🌲 Git Workflow

### Branch Strategy

```
main                    # Production (protected)
├── develop            # Integration (protected)
│   ├── feature/*      # New features
│   ├── module/*       # New modules
│   ├── refactor/*     # Improvements
│   └── docs/*         # Documentation
├── release/*          # Release prep
└── hotfix/*           # Emergency fixes
```

### Branch Naming

```bash
feature/projects-ai-suggestions
module/ai-assistant
refactor/database-optimization
fix/project-path-bug
docs/api-reference
```

### Commit Convention

```bash
feat(projects): add AI-powered suggestions
fix(prompts): resolve variable substitution bug
refactor(db): optimize query performance
docs(api): update tRPC routes
chore(deps): upgrade React to 19.2.3
```

---

## 📚 Documentation Structure

```
docs/
├── README.md                      # Quick start
├── architecture/
│   ├── overview.md
│   ├── database-schema.md
│   ├── module-structure.md
│   ├── navigation-flow.md
│   └── data-flow.md
├── modules/
│   ├── projects.md
│   ├── prompts.md
│   ├── components.md
│   ├── flows.md
│   ├── notes.md
│   └── structure.md
├── integrations/
│   ├── vscode.md
│   ├── claude-code.md
│   ├── google-drive.md
│   └── notion.md
├── development/
│   ├── setup.md
│   ├── contributing.md
│   ├── testing.md
│   └── deployment.md
└── api/
    ├── trpc-routes.md
    └── database-queries.md
```

---

## 🎨 Design Principles

### Visual Design
- **Dark theme** with vibrant accents
- **Glass morphism** for cards and modals
- **3D depth** where it adds value
- **Smooth animations** (GSAP, not janky CSS)
- **Minimalist** UI (no clutter)

### Code Principles
- **DRY** (Don't Repeat Yourself)
- **SOLID** principles
- **Composition over inheritance**
- **Single Responsibility** (small components)
- **Type Safety** (TypeScript everywhere)

### Performance
- **Lazy loading** (modules, 3D components)
- **Code splitting** (per route)
- **Memoization** (React.memo, useMemo)
- **Web Workers** (heavy parsing)
- **Virtual scrolling** (large lists)

---

## 🔮 Future Features

### Planned (Post v1.0)
- **AI Assistant Panel**: Chat with Claude about your projects
- **Real-time Collaboration**: Multiple users editing flows/notes
- **Mobile View**: Responsive design for tablets/phones
- **Plugin Marketplace**: Install community extensions
- **GitHub Integration**: Auto-import repos, sync issues
- **Linear Integration**: Link flows to Linear issues
- **Voice Commands**: "Open project X in VS Code"
- **Custom Themes**: User-defined color schemes

### Experimental
- **AR Mode**: View 3D structure in AR (Quest, Vision Pro)
- **Gesture Controls**: Touch gestures for 3D navigation
- **AI Code Generation**: Generate components from descriptions
- **Time Machine**: Visual timeline of project changes

---

## 📊 Success Metrics

### Phase 1 (Foundation)
- [ ] Can create/manage 10+ projects
- [ ] VS Code opens correctly 100% of time
- [ ] Path conversion works for WSL + Windows
- [ ] App loads in < 2 seconds

### Phase 2 (Content)
- [ ] Can store 100+ prompts
- [ ] Search returns results in < 100ms
- [ ] Notes sync with Claude Code
- [ ] Editor handles 1000+ word documents

### Phase 3 (Visual)
- [ ] Component library holds 50+ components
- [ ] Flow mapper handles 100+ node diagrams
- [ ] Export works for PNG/SVG/PDF

### Phase 4 (3D)
- [ ] 3D renders 1000+ file project
- [ ] Camera animation is smooth (60fps)
- [ ] Click-to-open works instantly

---

## 🛠️ Development Setup

### Prerequisites
- Bun v1.0+
- Node.js v20+ (for compatibility)
- Git
- VS Code (recommended)

### Installation
```bash
cd /mnt/e/Projects/dev-nexus
bun install
```

### Development
```bash
bun run dev          # Start Next.js dev server
bun run db:studio    # Open Drizzle Studio
bun run lint         # Run ESLint
bun run typecheck    # Run TypeScript checks
```

### Database
```bash
bun run db:generate  # Generate migration from schema
bun run db:push      # Push schema to database
bun run db:migrate   # Run migrations
```

---

## 📝 Notes

### Why Local-First?
- **Performance**: Synchronous SQLite is faster than network calls
- **Offline**: Works without internet
- **Privacy**: Data stays on your machine
- **Control**: You own your data

### Why Bun?
- **Speed**: Faster than npm/yarn/pnpm
- **Native TS**: Run TypeScript directly
- **Built-in**: SQLite, bundler, test runner
- **Modern**: Designed for 2024+ workflows

### Why Next.js?
- **React Server Components**: Better performance
- **App Router**: File-based routing
- **API Routes**: Built-in API layer
- **Optimizations**: Image, font, bundle optimization

### Why SQLite?
- **Simple**: Single file database
- **Fast**: Synchronous reads/writes
- **Portable**: Move the file, move the data
- **Proven**: Used by Apple, Microsoft, Google

---

## 🤝 Contributing

See `docs/development/contributing.md` for contribution guidelines.

### Quick Start
1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request to `develop`

---

## 📄 License

MIT License - See LICENSE file

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Docs**: https://docs.devnexus.dev (future)

---

**Last Updated**: 2026-01-15
**Next Review**: After Phase 1 completion
