# Phase 2: Core Frontend - Implementation Plan

## Purpose
This document details the implementation plan for Phase 2: Core Frontend, which builds the essential user interface for the Bartleby writing workflow.

## Classification
- **Domain:** Planning
- **Stability:** Dynamic
- **Abstraction:** Detailed
- **Confidence:** Established

## Overview

**Phase:** Phase 2 - Core Frontend
**Status:** In Progress
**Timeline:** 3-4 weeks
**Theme:** Essential UI for writing workflow

### Objectives

1. Create a functional tree view with drag-and-drop card organization
2. Integrate Milkdown markdown editor for card content editing
3. Build link panel to display and manage card relationships
4. Implement basic wiki link autocomplete in the editor
5. Establish responsive three-panel layout for the main editing interface

### Success Criteria

- Authors can navigate cards via hierarchical tree view
- Drag-and-drop reordering and reparenting works smoothly
- Markdown editor supports rich text editing with wiki link syntax
- Wiki links show autocomplete suggestions as user types
- Link panel displays all connections for selected card
- Application is responsive and works on tablets and desktop
- All UI state persists and synchronizes with backend API

## Implementation Tasks

### Task 1: Three-Panel Layout Foundation
**Priority:** High
**Estimated Time:** 2-3 days
**Dependencies:** None

**Description:**
Create the basic layout structure with resizable panels for tree view, card editor, and link panel.

**Subtasks:**
1. Install panel/split pane library (research options: react-split-pane, react-resizable-panels)
2. Create `MainLayout` component with three-panel structure
3. Implement panel resize functionality with drag handles
4. Add panel collapse/expand capabilities
5. Store panel sizes in localStorage for persistence
6. Make layout responsive (stack vertically on mobile/tablet)
7. Add keyboard shortcuts for panel navigation

**Files to Create:**
- `frontend/src/components/Layout/MainLayout.tsx`
- `frontend/src/components/Layout/ResizablePanel.tsx`
- `frontend/src/stores/layoutStore.ts` (Zustand store for panel state)

**Acceptance Criteria:**
- [ ] Three panels render correctly side by side
- [ ] Panels can be resized by dragging dividers
- [ ] Panel sizes persist across page reloads
- [ ] Layout adapts to smaller screens
- [ ] Keyboard shortcuts work for panel focus

### Task 2: Tree View Component
**Priority:** High
**Estimated Time:** 4-5 days
**Dependencies:** Task 1 (layout)

**Description:**
Build hierarchical tree view for card navigation with expand/collapse, selection, and visual indicators.

**Subtasks:**
1. Research tree view libraries (options: react-arborist, react-complex-tree, custom implementation)
2. Create `TreeView` component with hierarchical rendering
3. Implement expand/collapse functionality for nodes
4. Add visual indicators for card types (icons, colors)
5. Show link count badges on tree nodes
6. Implement node selection with keyboard navigation
7. Add context menu for node actions (add child, delete, edit type)
8. Display loading states and empty states

**Files to Create:**
- `frontend/src/components/TreeView/TreeView.tsx`
- `frontend/src/components/TreeView/TreeNode.tsx`
- `frontend/src/components/TreeView/TreeContextMenu.tsx`
- `frontend/src/hooks/useTreeNavigation.ts`
- `frontend/src/stores/treeStore.ts` (expanded nodes, selected node)

**API Integration:**
- Use existing `GET /api/cards` endpoint
- Implement tree structure building from flat card array
- Handle hierarchical relationships via `parentId` field

**Acceptance Criteria:**
- [ ] Tree renders all cards in hierarchical structure
- [ ] Nodes can be expanded and collapsed
- [ ] Selected node is visually highlighted
- [ ] Card type is indicated with icon/color
- [ ] Link count badges display correctly
- [ ] Keyboard navigation works (arrow keys, enter)
- [ ] Context menu provides relevant actions

### Task 3: Drag-and-Drop for Tree View
**Priority:** High
**Estimated Time:** 3-4 days
**Dependencies:** Task 2 (tree view)

**Description:**
Add drag-and-drop functionality to reorder cards and change parent-child relationships.

**Subtasks:**
1. Choose drag-and-drop library (dnd-kit recommended for React)
2. Install and configure dnd-kit
3. Make tree nodes draggable
4. Implement drop zones for reordering and reparenting
5. Add visual feedback during drag (ghost, drop indicators)
6. Update card `position` and `parentId` via API on drop
7. Implement optimistic updates with rollback on error
8. Add drag constraints (prevent invalid moves)
9. Handle edge cases (dragging parent onto child, root level moves)

**Files to Create:**
- `frontend/src/components/TreeView/DraggableTreeNode.tsx`
- `frontend/src/components/TreeView/DropIndicator.tsx`
- `frontend/src/hooks/useTreeDragDrop.ts`

**API Integration:**
- `PUT /api/cards/:id` to update `position` and `parentId`
- Use TanStack Query mutations with optimistic updates

**Acceptance Criteria:**
- [ ] Cards can be dragged within tree
- [ ] Drop indicators show valid drop locations
- [ ] Reordering updates position correctly
- [ ] Reparenting changes card hierarchy
- [ ] Optimistic updates make UI feel responsive
- [ ] Invalid drops are prevented or handled gracefully
- [ ] API updates persist changes

### Task 4: Milkdown Editor Integration
**Priority:** High
**Estimated Time:** 4-5 days
**Dependencies:** Task 1 (layout)

**Description:**
Integrate Milkdown markdown editor for card content editing with autosave and wiki link support.

**Subtasks:**
1. Create `CardEditor` component wrapper
2. Initialize Milkdown editor with preset-commonmark
3. Configure editor styling for WYSIWYG appearance
4. Implement two-way binding with card content
5. Add autosave with debouncing (save 2 seconds after typing stops)
6. Show save status indicator (saving/saved/error)
7. Add basic toolbar (optional: bold, italic, headings)
8. Handle editor focus and blur events
9. Test editor performance with large documents

**Files to Create:**
- `frontend/src/components/CardEditor/CardEditor.tsx`
- `frontend/src/components/CardEditor/EditorToolbar.tsx`
- `frontend/src/components/CardEditor/SaveIndicator.tsx`
- `frontend/src/hooks/useCardEditor.ts`
- `frontend/src/hooks/useAutosave.ts`

**API Integration:**
- `PUT /api/cards/:id` to save content changes
- Use TanStack Query mutation with optimistic updates
- Handle conflicts if content changed on server

**Acceptance Criteria:**
- [ ] Editor renders markdown with WYSIWYG preview
- [ ] Content changes are autosaved after 2 seconds
- [ ] Save indicator shows current status
- [ ] Editor handles large documents without lag
- [ ] Two-way binding works (API changes update editor)
- [ ] Editor maintains cursor position during updates

### Task 5: Wiki Link Autocomplete
**Priority:** Medium
**Estimated Time:** 3-4 days
**Dependencies:** Task 4 (editor)

**Description:**
Implement autocomplete dropdown for wiki links as user types `[[` syntax.

**Subtasks:**
1. Create Milkdown plugin for wiki link detection
2. Monitor editor for `[[` trigger sequence
3. Show dropdown with matching cards as user types
4. Implement fuzzy search for card title matching
5. Handle arrow key navigation in dropdown
6. Insert selected card title on enter or click
7. Close dropdown on escape or click outside
8. Show visual indicators for ghost links (unresolved)
9. Make ghost links clickable to create new cards

**Files to Create:**
- `frontend/src/components/CardEditor/WikiLinkAutocomplete.tsx`
- `frontend/src/lib/milkdown/wikiLinkPlugin.ts`
- `frontend/src/hooks/useWikiLinkAutocomplete.ts`
- `frontend/src/lib/fuzzySearch.ts`

**API Integration:**
- Query cached cards from TanStack Query
- Filter cards by title match
- Optionally: `GET /api/cards/search?q=...` for server-side search

**Acceptance Criteria:**
- [ ] Typing `[[` triggers autocomplete dropdown
- [ ] Dropdown shows matching cards as user types
- [ ] Arrow keys navigate dropdown options
- [ ] Enter or click inserts wiki link
- [ ] Dropdown closes on escape or outside click
- [ ] Ghost links are visually distinct (orange/yellow)
- [ ] Clicking ghost link opens card creation modal

### Task 6: Link Panel Component
**Priority:** High
**Estimated Time:** 3-4 days
**Dependencies:** Task 1 (layout)

**Description:**
Build panel to display and manage links for the currently selected card.

**Subtasks:**
1. Create `LinkPanel` component
2. Fetch and display links for selected card
3. Group links by type (incoming/outgoing, or by link type)
4. Show card preview on hover
5. Make links clickable to navigate to target card
6. Add "Add Link" button with modal for manual link creation
7. Implement link deletion with confirmation
8. Show link metadata (type, direction, count)
9. Handle empty state when no links exist

**Files to Create:**
- `frontend/src/components/LinkPanel/LinkPanel.tsx`
- `frontend/src/components/LinkPanel/LinkItem.tsx`
- `frontend/src/components/LinkPanel/LinkGroup.tsx`
- `frontend/src/components/LinkPanel/AddLinkModal.tsx`
- `frontend/src/hooks/useCardLinks.ts`

**API Integration:**
- `GET /api/cards/:id/links` to fetch card links
- `POST /api/links` to create manual links
- `DELETE /api/links/:id` to remove links

**Acceptance Criteria:**
- [ ] Panel displays all links for selected card
- [ ] Links are grouped logically (by type or direction)
- [ ] Hover shows preview of linked card
- [ ] Clicking link navigates to target card
- [ ] Add Link button opens modal for creation
- [ ] Links can be deleted with confirmation
- [ ] Empty state shows helpful message

### Task 7: Card Detail View Integration
**Priority:** High
**Estimated Time:** 2-3 days
**Dependencies:** Task 2 (tree), Task 4 (editor), Task 6 (links)

**Description:**
Connect tree selection to card editor and link panel, implementing the full three-panel workflow.

**Subtasks:**
1. Create routing for card detail view (`/cards/:cardId`)
2. Connect tree node selection to router navigation
3. Load selected card data in editor and link panel
4. Synchronize tree selection with URL parameter
5. Handle card not found (404 state)
6. Add breadcrumb navigation in editor header
7. Show card metadata (type, created, modified)
8. Implement keyboard shortcuts for navigation (prev/next card)

**Files to Create:**
- `frontend/src/routes/cards/$cardId.tsx`
- `frontend/src/components/CardDetail/CardHeader.tsx`
- `frontend/src/components/CardDetail/Breadcrumb.tsx`

**API Integration:**
- `GET /api/cards/:id` for card details
- Use TanStack Router for navigation
- Use TanStack Query for data fetching

**Acceptance Criteria:**
- [ ] Clicking tree node navigates to card detail route
- [ ] Editor loads selected card content
- [ ] Link panel shows links for selected card
- [ ] URL updates to reflect selected card
- [ ] Direct navigation via URL works
- [ ] Breadcrumb shows card location in tree
- [ ] Card metadata displays in header

### Task 8: Styling and Polish
**Priority:** Medium
**Estimated Time:** 2-3 days
**Dependencies:** All above tasks

**Description:**
Apply consistent styling, improve visual design, and polish user experience.

**Subtasks:**
1. Decide on styling approach (CSS Modules vs. Tailwind)
2. Create design tokens (colors, spacing, typography)
3. Style tree view with proper spacing and colors
4. Style editor with readable typography
5. Style link panel with clean layout
6. Add loading skeletons for async operations
7. Add subtle animations for interactions
8. Ensure consistent spacing and alignment
9. Test responsive behavior on different screen sizes
10. Add dark mode support (optional)

**Files to Create:**
- `frontend/src/styles/tokens.css` (design tokens)
- `frontend/src/styles/theme.ts` (theme configuration)
- Component-specific stylesheets as needed

**Acceptance Criteria:**
- [ ] Consistent color scheme throughout app
- [ ] Typography is readable and hierarchical
- [ ] Spacing follows consistent scale
- [ ] Loading states are visually clear
- [ ] Animations enhance UX without being distracting
- [ ] Responsive design works on tablet and desktop
- [ ] (Optional) Dark mode toggles correctly

## Technical Decisions

### Panel Library Selection
**Options:**
1. **react-resizable-panels** (by Vercel) - Modern, lightweight, good DX
2. **react-split-pane** - Older but stable, widely used
3. **Custom implementation** - Full control, more effort

**Recommendation:** react-resizable-panels for modern API and better TypeScript support

### Tree View Library Selection
**Options:**
1. **react-arborist** - Performant, virtualizes large trees, good DX
2. **react-complex-tree** - Feature-rich, accessibility-focused
3. **Custom implementation** - Maximum control, more effort

**Recommendation:** react-arborist for performance and modern API

### Drag-and-Drop Library
**Options:**
1. **dnd-kit** - Modern, modular, excellent docs, touch support
2. **react-beautiful-dnd** - Popular but no longer maintained
3. **react-dnd** - Powerful but complex API

**Recommendation:** dnd-kit for active maintenance and great React 18 support

### Styling Approach
**Options:**
1. **Tailwind CSS** - Utility-first, fast development, larger bundle
2. **CSS Modules** - Scoped styles, smaller bundle, more boilerplate
3. **Styled-components** - CSS-in-JS, dynamic styles, runtime cost

**Recommendation:** Defer to user preference; suggest Tailwind for rapid development

## Dependencies to Install

```bash
cd frontend
npm install react-resizable-panels react-arborist @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Milkdown integration complexity | High | Medium | Start with minimal config, add features incrementally |
| Drag-and-drop performance issues | Medium | Low | Use dnd-kit with virtualization, test with large trees |
| Tree view performance with many cards | Medium | Medium | Use virtualization via react-arborist, lazy load children |
| Autocomplete latency | Low | Low | Implement client-side fuzzy search, debounce API calls |
| Layout not responsive | Medium | Low | Test early on tablets, use CSS Grid/Flexbox |

## Testing Strategy

**Manual Testing:**
- Create 20+ cards with various nesting levels
- Test drag-and-drop with different parent-child combinations
- Type long markdown documents to test editor performance
- Test autocomplete with 100+ cards
- Resize browser to test responsive behavior

**Edge Cases to Test:**
- Empty project (no cards)
- Single card project
- Very deep nesting (10+ levels)
- Very long card titles
- Special characters in card titles
- Rapid typing in editor (stress test autosave)
- Network errors during save

## Deliverables

At the end of Phase 2, the following should be complete:

1. ✅ Three-panel layout with resize functionality
2. ✅ Tree view displaying all cards hierarchically
3. ✅ Drag-and-drop for reordering and reparenting cards
4. ✅ Milkdown editor with autosave
5. ✅ Wiki link autocomplete in editor
6. ✅ Link panel showing card connections
7. ✅ Navigation between cards via tree and links
8. ✅ Responsive design for tablet and desktop
9. ✅ Consistent styling and polish

## Next Steps After Phase 2

Phase 3 will add:
- Network visualization (visx)
- Manuscript reading view
- Export system
- Config management UI

## Relationships
- **Parent Nodes:** [planning/roadmap.md]
- **Child Nodes:** None
- **Related Nodes:**
  - [elements/frontend-app/overview.md] - implements - Implementation of frontend specification
  - [decisions/003-technology-stack.md] - follows - Uses specified technology stack

## Navigation Guidance
- **Access Context:** Use this document when implementing Phase 2 features
- **Common Next Steps:** Reference component specifications, API documentation
- **Related Tasks:** Frontend implementation, UI development
- **Update Patterns:** Update as tasks are completed or blocked

## Metadata
- **Created:** 2025-11-14
- **Last Updated:** 2025-11-14
- **Updated By:** AI Agent (Claude)

## Change History
- 2025-11-14: Initial creation of Phase 2 implementation plan
