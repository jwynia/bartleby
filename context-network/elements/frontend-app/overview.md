# Frontend Application Element

## Purpose
This element defines the React-based single-page application that provides the user interface for Bartleby. The frontend emphasizes connection visibility through multiple views (tree, network, manuscript).

## Classification
- **Domain:** User Interface
- **Stability:** Semi-stable
- **Abstraction:** Structural
- **Confidence:** Established

## Technology Stack

**Framework:** React 18+
**Build Tool:** Vite
**Routing:** TanStack Router (type-safe, file-based)
**Server State:** TanStack Query (caching, optimistic updates)
**UI State:** Zustand (lightweight global state)
**Markdown Editor:** Milkdown (WYSIWYG with plugin support)
**Visualization:** D3.js (force-directed graphs)
**Styling:** CSS Modules or Tailwind (TBD based on preferences)

## Core Views

### 1. Tree View + Card Detail (Primary)
The main writing interface with three-panel layout:

- **Left Panel (30%)**: Hierarchical tree navigation
  - Drag-and-drop to reorder/reparent
  - Expand/collapse nodes
  - Color indicators for card types
  - Link count badges
  - Context menu for actions

- **Center Panel (50%)**: Card editor
  - Title input
  - Markdown editor (Milkdown)
  - Wiki link autocomplete
  - Live preview
  - Autosave indicator
  - Metadata fields

- **Right Panel (20%)**: Link panel
  - Links grouped by type
  - Card previews on hover
  - Click to navigate
  - Drag to reorder (sequence links)
  - Add link button

### 2. Network View
Force-directed graph visualization:

- Center node (current card)
- Connected cards at configurable depth (1-5)
- Edges labeled with link types
- Nodes colored by card type
- Click to recenter
- Hover for previews
- Drag to create new links
- Zoom and pan
- Minimap for navigation

### 3. Manuscript View
Linear reading view:

- Continuous scroll of markdown content
- Section headers between cards
- Table of contents sidebar
- Click to jump to card in editor
- Export button

### 4. Config View
Project settings:

- Project metadata (title, author)
- Card type management (add/edit/delete)
- Link type management
- Export templates

## State Management

### Server State (TanStack Query)
- Cached API responses
- Automatic refetching
- Optimistic updates
- Background synchronization

**Query Keys:**
```typescript
{
  cards: ['cards'],
  card: (id) => ['cards', id],
  cardNetwork: (id, depth) => ['cards', id, 'network', depth],
  links: ['links'],
  config: ['config'],
  events: ['events']
}
```

### UI State (Zustand)
- Selected cards
- View mode (tree/network/manuscript)
- Filters (card type, link type)
- Search query
- Editor fullscreen mode
- Focused card ID

## Component Structure

```
src/
├── routes/          # TanStack Router routes
│   ├── index.tsx
│   ├── cards/
│   │   ├── index.tsx
│   │   └── $cardId.tsx
│   ├── network/
│   │   └── $cardId.tsx
│   ├── manuscript.tsx
│   └── config.tsx
├── components/
│   ├── TreeView/
│   ├── CardEditor/
│   ├── LinkPanel/
│   ├── NetworkView/
│   ├── ManuscriptView/
│   └── ConfigView/
├── hooks/
│   ├── useCards.ts
│   ├── useLinks.ts
│   └── useConfig.ts
├── lib/
│   ├── api.ts       # API client
│   └── types.ts     # TypeScript interfaces
└── stores/
    └── uiStore.ts   # Zustand store
```

## Key Features

### Wiki Link Editing
- **Autocomplete**: Dropdown as user types `[[`
- **Resolution indicators**: Green (resolved), orange (ghost link)
- **Click to create**: Ghost links spawn card creation modal
- **Live preview**: See linked card title, not syntax

### Optimistic Updates
All mutations optimistically update UI:
1. User makes change
2. UI updates immediately
3. Request sent to server
4. On success: Reconcile with server response
5. On error: Rollback to previous state

### Drag and Drop
- Reorder cards in tree view
- Reparent by dragging onto new parent
- Reorder sequence links in link panel

### Keyboard Shortcuts
- `Cmd+N`: New card
- `Cmd+K`: Quick search/navigate
- `Cmd+Enter`: Save card
- `Cmd+B`: Toggle sidebar
- `Cmd+Shift+N`: Network view
- `Cmd+Shift+M`: Manuscript view

## Design Decisions

1. **TanStack Router**: Type-safe routing, great DX
2. **TanStack Query**: Industry standard for server state
3. **Milkdown**: Extensible, supports custom plugins for wiki links
4. **Optimistic updates**: Perceived performance critical for writing flow
5. **Resizable panels**: Authors customize workspace
6. **D3.js**: Powerful, flexible visualization library

## Responsibilities

- **User interaction**: Respond to clicks, drags, keyboard input
- **Data display**: Render cards, links, network graphs
- **Editing**: Markdown editing with wiki link support
- **Navigation**: Tree, network, and manuscript browsing
- **State synchronization**: Keep UI in sync with API

## Relationships
- **Parent Nodes:** [foundation/structure.md]
- **Child Nodes:** None
- **Related Nodes:**
  - [api-server/overview.md] - consumes - Calls API endpoints
  - [wiki-link-system/overview.md] - integrates - Editor uses wiki link plugin
  - [data-model/overview.md] - displays - Renders data model entities

## Navigation Guidance
- **Access Context:** Use when implementing UI components or features
- **Common Next Steps:** Review component specifications, routing structure
- **Related Tasks:** UI implementation, component development, state management
