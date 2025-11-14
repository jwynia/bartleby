# Project Definition

## Purpose
This document defines the core purpose, goals, and scope of the project.

## Classification
- **Domain:** Core Concept
- **Stability:** Static
- **Abstraction:** Conceptual
- **Confidence:** Established

## Content

### Project Overview

**Project Name:** Bartleby - Writing Tool for Fiction and Non-Fiction

Bartleby is a web-based tool for writing fiction and non-fiction books that provides Scrivener-like functionality with nested notecards and flexible linking. The tool emphasizes connection visibility and impact analysis, enabling authors to understand how changes to characters, locations, or plot points ripple through their entire work.

### Vision Statement

To create a writing tool that makes the invisible connections in a manuscript visible, enabling authors to craft more coherent narratives by understanding the full impact of their creative decisions.

### Mission Statement

Bartleby provides fiction and non-fiction authors with a link-centric writing environment where relationships between content (characters, scenes, locations, plot points) are first-class citizens. Through flexible card structures and network visualization, authors can see how their work connects, identify inconsistencies, and make informed changes that strengthen the whole manuscript.

### Project Objectives

1. **Link-centric design**: Make relationships between content visible and queryable
2. **Flexible structure**: Support author-defined card types without rigid hierarchies
3. **API-first architecture**: Enable future agent integration and automation
4. **Self-contained deployment**: Each book project runs as an independent Docker container
5. **Export-focused**: Produce standard markdown compatible with Pandoc and publishing workflows

### Success Criteria

1. Authors can create nested card structures (chapters, scenes, characters, locations) with custom types
2. Wiki-style links automatically create bidirectional relationships between cards
3. Network visualization shows connection impact (e.g., "which scenes would be affected by changing this character?")
4. Exports produce clean markdown ready for Pandoc processing
5. Complete audit trail via event sourcing enables undo/replay of all changes
6. Single-command Docker deployment per book project

### Project Scope

#### In Scope (v1)

- Nested notecard system with drag-and-drop organization
- Wiki-style linking with `[[Card Title]]` syntax
- Automatic link resolution and ghost link handling
- Network visualization of card connections
- Event-sourced data model with full audit trail
- RESTful API for all functionality
- Markdown editor with live preview
- Export to Pandoc-compatible markdown
- Docker-based deployment (one container per book)
- SQLite database with event sourcing
- Tree, network, and manuscript reading views

#### Out of Scope (v1)

- Collaboration/multi-user editing
- Offline-first architecture
- Real-time synchronization across devices
- Built-in AI features (architecture supports future integration)
- Mobile applications (web responsive is acceptable)
- Cloud hosting/SaaS deployment
- Version control integration (git-compatible export planned for future)
- Import from existing documents (future feature)

### Stakeholders

| Role | Responsibilities | Representative(s) |
|------|-----------------|-------------------|
| Product Owner | Define requirements, prioritize features, validate UX | TBD |
| Developer | Full-stack implementation, architecture decisions | AI Agent |
| End Users | Fiction/non-fiction authors using the tool | Authors |

### Timeline

See [planning/roadmap.md] for detailed timeline.

**High-level phases:**
- Phase 1: Core Backend (2-3 weeks)
- Phase 2: Core Frontend (3-4 weeks)
- Phase 3: Advanced Features (2-3 weeks)
- Phase 4: Polish (1-2 weeks)
- Phase 5: Deployment (1 week)

### Budget and Resources

**Technology Stack (all open source):**
- Node.js runtime
- Hono web framework
- SQLite database
- React + Vite
- TanStack Router & Query
- Milkdown markdown editor
- D3.js for visualizations

**Infrastructure:**
- Docker for containerization
- Volume mounts for data persistence

### Constraints

1. **Single-user focus**: No multi-user collaboration in v1
2. **Container-based deployment**: Each book is a separate container (intentional isolation)
3. **Local-first**: No cloud services or external dependencies
4. **Event sourcing overhead**: Complete audit trail adds storage and complexity
5. **Browser-based only**: No native desktop or mobile apps in v1

### Assumptions

1. Authors are comfortable with markdown syntax
2. Docker is available on target deployment systems
3. Browser supports modern JavaScript (ES2020+)
4. SQLite performance is sufficient for single-user, single-book use cases
5. Most books will have < 1000 cards and < 5000 links
6. Network graphs with < 500 nodes are visually useful

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Event sourcing complexity | High | Start with simple replay mechanism, defer optimization |
| Wiki link resolution ambiguity | Medium | Provide disambiguation UI, support type prefixes |
| Network visualization performance | Medium | Limit graph depth, use webworkers for layout |
| Markdown editor integration | High | Choose battle-tested library (Milkdown), plan for swap if needed |
| Export format compatibility | Medium | Follow Pandoc conventions strictly, include samples |

## Relationships
- **Parent Nodes:** None
- **Child Nodes:** 
  - [foundation/structure.md] - implements - Structural implementation of project goals
  - [foundation/principles.md] - guides - Principles that guide project execution
- **Related Nodes:** 
  - [planning/roadmap.md] - details - Specific implementation plan for project goals
  - [planning/milestones.md] - schedules - Timeline for achieving project objectives

## Navigation Guidance
- **Access Context:** Use this document when needing to understand the fundamental purpose and scope of the project
- **Common Next Steps:** After reviewing this definition, typically explore structure.md or principles.md
- **Related Tasks:** Strategic planning, scope definition, stakeholder communication
- **Update Patterns:** This document should be updated when there are fundamental changes to project direction or scope

## Metadata
- **Created:** 2025-11-14
- **Last Updated:** 2025-11-14
- **Updated By:** AI Agent (Claude)

## Change History
- 2025-11-14: Initial creation of project definition template
- 2025-11-14: Populated with Bartleby writing tool specification
