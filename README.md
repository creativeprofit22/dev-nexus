# DevNexus

**A visually immersive, local-first development workstation for modern developers**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/dev-nexus)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/built%20with-Next.js%2016-black)](https://nextjs.org/)
[![Powered by Bun](https://img.shields.io/badge/powered%20by-Bun-f9f1e1)](https://bun.sh/)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/dev-nexus.git
cd dev-nexus

# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## ✨ Features

- **🎯 Project Hub**: Manage multiple projects with WSL/Windows path handling
- **💬 Prompt Library**: Organize reusable prompts with variable substitution
- **🎨 Component Studio**: Visual component library with live previews
- **🗺️ Flow Mapper**: Create and export user flow diagrams
- **📝 Rich Text Notes**: Markdown-powered notes with linking
- **🌳 3D Structure Explorer**: Visualize project structure in 3D (coming soon)
- **🔧 VS Code Integration**: One-click project opening and terminal spawning
- **🤖 Claude Code Sync**: Bidirectional sync with Claude Code terminal

---

## 📦 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **GSAP** - Animations
- **Three.js + R3F** - 3D visualizations

### Backend
- **tRPC** - Type-safe API layer
- **Drizzle ORM** - Database toolkit
- **better-sqlite3** - Synchronous SQLite
- **Bun** - Runtime and package manager

### UI Libraries
- **ReactFlow** - Flow diagrams
- **Tiptap** - Rich text editor
- **React Grid Layout** - Dashboard layouts

---

## 📚 Documentation

- [**Project Plan**](docs/architecture/PROJECT_PLAN.md) - Complete feature roadmap
- [**Architecture**](docs/architecture/ARCHITECTURE.md) - Technical architecture overview
- [**Database Schema**](docs/architecture/DATABASE_SCHEMA.md) - Complete schema documentation
- [**Contributing Guide**](docs/development/CONTRIBUTING.md) - How to contribute (coming soon)

---

## 🏗️ Project Structure

```
dev-nexus/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── modules/                # Feature modules (self-contained)
│   ├── shared/                 # Shared components & utilities
│   └── core/                   # Core infrastructure (DB, tRPC, auth)
├── docs/                       # Documentation
├── drizzle/                    # SQL migrations
├── data/                       # SQLite database
└── public/                     # Static assets
```

---

## 🚀 Development

```bash
# Development server
bun run dev

# Database management
bun run db:generate    # Generate migration from schema changes
bun run db:push        # Push schema to database
bun run db:studio      # Open Drizzle Studio GUI

# Code quality
bun run lint           # Run ESLint
bun run typecheck      # Run TypeScript checks
bun run test           # Run tests

# Production
bun run build          # Build for production
bun run start          # Start production server
```

---

## 🌲 Git Workflow

### Branches
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `module/*` - New modules
- `refactor/*` - Code improvements
- `fix/*` - Bug fixes

### Commit Convention
```bash
feat(projects): add AI-powered suggestions
fix(prompts): resolve variable substitution bug
refactor(db): optimize query performance
docs(api): update tRPC routes
```

---

## 📖 Key Concepts

### Modules
DevNexus is built with a modular architecture. Each feature (Projects, Prompts, Components, Flows, Notes) is a self-contained module with its own:
- Components
- Hooks
- API routes (tRPC)
- Database schema
- Types

### Local-First
All data is stored locally in SQLite for:
- **Fast performance** - Synchronous database access
- **Offline capability** - Works without internet
- **Privacy** - Your data stays on your machine
- **Portability** - Single file database

### Claude Code Integration
DevNexus shares its SQLite database with Claude Code, enabling:
- Create projects/prompts/notes from Claude Code terminal
- Sync changes bidirectionally
- Automated workflows

---

## 🔮 Roadmap

### Phase 1: Foundation (Current)
- [x] Project planning and architecture
- [ ] Core layouts (AppShell, Sidebar, Navigation)
- [ ] Project Hub module
- [ ] VS Code integration

### Phase 2: Content Management
- [ ] Prompt Library module
- [ ] Notes module
- [ ] Claude Code sync system

### Phase 3: Visual Tools
- [ ] Component Studio module
- [ ] Flow Mapper module

### Phase 4: 3D & Polish
- [ ] 3D Structure Explorer
- [ ] Command palette
- [ ] Performance optimizations

### Future
- [ ] Google Drive / Notion integrations
- [ ] Real-time collaboration
- [ ] AI assistant panel
- [ ] Mobile view

See [PROJECT_PLAN.md](docs/architecture/PROJECT_PLAN.md) for detailed roadmap.

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/development/CONTRIBUTING.md) first.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request to `develop`

---

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

This project was inspired by and learned from:
- [Flowise](https://github.com/FlowiseAI/Flowise) - Flow architecture patterns
- [Plane](https://github.com/makeplane/plane) - Tiptap editor integration
- [Spacedrive](https://github.com/spacedriveapp/spacedrive) - 3D visualization patterns
- [Teable](https://github.com/teableio/teable) - Dashboard architecture
- [Perplexica](https://github.com/ItzCrazyKns/Perplexica) - SQLite + Drizzle setup

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/dev-nexus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dev-nexus/discussions)

---

**Built with ❤️ for developers who love beautiful, fast, local-first tools**
