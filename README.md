# Bartleby - Writing Tool

A web-based tool for writing fiction and non-fiction books with Scrivener-like functionality featuring nested notecards, flexible linking, and network visualization.

## Features

- **Nested Notecard System**: Organize chapters, scenes, characters, locations, and notes in a hierarchical structure
- **Wiki-Style Linking**: Use `[[Card Title]]` syntax to create bidirectional links between cards
- **Network Visualization**: See how your characters, locations, and plot points connect
- **Event Sourcing**: Complete audit trail of all changes for undo/replay
- **Markdown Export**: Export to Pandoc-compatible markdown for publishing workflows
- **Self-Contained**: Each book runs in its own Docker container with isolated data

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# Access at http://localhost:3000
```

### Using Docker

```bash
# Build image
docker build -t bartleby .

# Run container
docker run -d \
  --name my-novel \
  -p 3000:3000 \
  -v ./data:/app/data \
  bartleby

# Access at http://localhost:3000
```

### Development Mode

```bash
# Install dependencies
npm run install:all

# Start backend (terminal 1)
npm run dev:backend

# Start frontend (terminal 2)
npm run dev:frontend

# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

## Project Structure

```
bartleby/
├── backend/           # Hono API server with event sourcing
│   ├── src/
│   │   ├── api/      # API route handlers
│   │   ├── db/       # Database and event store
│   │   ├── services/ # Business logic (cards, links, wikilinks)
│   │   └── types/    # TypeScript types
│   └── package.json
├── frontend/          # React SPA with TanStack Router/Query
│   ├── src/
│   │   ├── routes/   # TanStack Router routes
│   │   ├── lib/      # API client and types
│   │   └── components/ # React components
│   └── package.json
├── context-network/   # Project documentation and planning
├── Dockerfile         # Multi-stage build
└── docker-compose.yml # Docker Compose configuration
```

## Architecture

- **Backend**: Node.js + Hono + SQLite (event sourcing)
- **Frontend**: React + Vite + TanStack Router/Query
- **Database**: SQLite with event log + materialized views
- **Deployment**: Docker container per book project

## Core Concepts

### Cards

Cards represent any content unit: chapters, scenes, characters, locations, or notes. Each card has:
- Title and markdown content
- User-defined type (chapter, character, etc.)
- Arbitrary metadata
- Position in hierarchy

### Links

Bidirectional connections between cards created via:
- Wiki syntax: `[[Character Name]]` in markdown
- Explicit UI actions: "Add link" button
- Hierarchical relationships: Parent-child in tree

### Event Sourcing

All changes recorded as immutable events:
- Complete audit trail
- Replay capability for undo/redo
- Foundation for future collaboration features

### Wiki Links

Use wiki-style syntax to link cards:

```markdown
[[Character Name]]           # Link to any card by title
[[Character:John Smith]]     # Link to specific type
[[#uuid]]                    # Direct link by ID
```

Links are:
- **Bidirectional**: Visible from both cards
- **Auto-created**: Typing `[[...]]` creates links
- **Smart**: Autocomplete suggests existing cards
- **Forgiving**: Unresolved links become "ghost links" that can create cards on-click

## API

Full REST API at `/api`:

- `GET /api/cards` - List cards with filters
- `POST /api/cards` - Create card
- `PATCH /api/cards/:id` - Update card (processes wiki links)
- `DELETE /api/cards/:id` - Delete card
- `GET /api/cards/:id/network` - Get connection network
- `GET /api/links` - List links
- `POST /api/links` - Create link
- `GET /api/config` - Get project configuration
- `GET /api/events` - Query event log

## Export

Export your manuscript to markdown:

```bash
# Via API
POST /api/export/manuscript
{
  "format": "pandoc",
  "includeMetadata": true
}

# Processes to Pandoc-compatible markdown:
/export-timestamp/
  /chapters/*.md
  /metadata/**/*.md
  metadata.yaml
  compile-order.txt
```

Use with Pandoc:

```bash
pandoc -o book.pdf \
  --metadata-file=metadata.yaml \
  $(cat compile-order.txt)
```

## Development Roadmap

See `context-network/planning/roadmap.md` for detailed development plan.

**Current Phase**: Phase 1 - Core Backend & Frontend ✅

**Completed**:
- Event-sourced database with SQLite
- REST API for cards, links, config, events
- Wiki link parser and automatic link creation
- React frontend with TanStack Router/Query
- Basic card CRUD interface
- Docker deployment

**Next**:
- Card editor with Milkdown
- Tree view with drag-and-drop
- Network visualization with D3.js
- Manuscript export

## Documentation

Full project documentation in `context-network/`:

- `foundation/project_definition.md` - Project overview and scope
- `foundation/principles.md` - Architectural principles
- `foundation/structure.md` - System architecture
- `elements/` - Component-specific documentation
- `decisions/` - Architectural decision records
- `planning/roadmap.md` - Development roadmap

## License

MIT

## Context Network

This project uses a context network for planning and documentation. See `context-network/discovery.md` for navigation guide.
