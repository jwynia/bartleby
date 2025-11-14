# Project Principles

## Purpose
This document outlines the core principles and standards that guide decision-making and development across the project.

## Classification
- **Domain:** Core Concept
- **Stability:** Static
- **Abstraction:** Conceptual
- **Confidence:** Established

## Content

### Core Values

1. **Link-centric Design**
   Relationships between content are first-class citizens. The tool is built around the premise that connections between elements (characters, scenes, locations) are as important as the elements themselves.

2. **Flexibility Over Convention**
   No rigid hierarchy or fixed card types. Authors define their own organization, card types, and relationships to match their creative process.

3. **Transparency and Auditability**
   Complete history of all changes via event sourcing. Authors can see what changed, when, and understand the evolution of their work.

4. **Export-First Thinking**
   The tool facilitates writing but doesn't lock content in. Standard markdown output ensures authors own their work and can use any publishing pipeline.

### Design Principles

1. **API-First Architecture**
   All functionality is accessible via API. The frontend is one consumer among potential many (future CLI tools, agents, scripts).

   *Example:* Creating a card via UI makes the same API call that a future AI agent would use.

2. **Event Sourcing as Source of Truth**
   Current state is derived from immutable events. All changes are recorded as events, enabling complete audit trails and potential undo/replay.

   *Example:* The `cards` table is a materialized view. Deleting it and replaying events recreates the exact same state.

3. **Bidirectional Relationships**
   All links are navigable from both sides. Even if created from A→B, both cards can traverse the connection.

   *Example:* A wiki link `[[John]]` in Chapter 1 creates a link visible from both Chapter 1 and the John character card.

4. **Self-Contained Deployments**
   Each book project is a separate Docker container with its own data. No shared state, no cross-project dependencies.

   *Example:* "Novel A" runs on port 3001, "Novel B" on port 3002, each with independent databases.

5. **Progressive Disclosure**
   Start simple (tree view + editor), add complexity as needed (network view, advanced filters).

   *Example:* Basic writing doesn't require understanding link types, but power users can define custom link types for nuanced relationships.

### Standards and Guidelines

#### Quality Standards

- **TypeScript throughout**: All code (frontend and backend) uses TypeScript for type safety
- **Single source of truth**: Event log is authoritative; materialized views are derived
- **Immutable events**: Once written to event log, events are never modified or deleted
- **API responses include events**: Mutations return both the updated entity and the event that caused it

#### Structural Standards

- **Small, focused files**: Individual components/modules under 300 lines where possible
- **Atomic commits**: Each git commit represents a coherent, testable change
- **RESTful conventions**: Standard HTTP methods (GET, POST, PATCH, DELETE) with resource-based URLs
- **Markdown as content format**: All user content stored and exported as markdown

#### Safety and Security Standards

- **Local-only in v1**: No authentication needed (single-user, localhost deployment)
- **Input validation**: All API inputs validated before processing
- **SQL injection prevention**: Use parameterized queries exclusively
- **XSS prevention**: Sanitize markdown rendering output

#### Performance and Efficiency Standards

- **Optimistic updates**: Frontend updates UI immediately, reconciles with server response
- **Debounced saves**: Auto-save after 500ms of inactivity
- **Indexed queries**: Database indexes on foreign keys and frequently queried fields
- **Lazy loading**: Card content loaded on-demand, not in list views

### Process Principles

1. **Iterative Development**
   Build incrementally: database → API → UI. Each layer fully functional before the next.

2. **Test Critical Paths**
   Focus testing on event sourcing, link resolution, and export generation (high-risk areas).

3. **Documentation as Code**
   TypeScript interfaces serve as primary documentation. Comments explain "why" not "what".

### Decision-Making Framework

#### Decision Criteria

1. **Does it support the core use case?** (Author writing and organizing a book)
2. **Does it enable future extension?** (API-first, event-sourced design)
3. **Is it simple enough for v1?** (Defer complexity where possible)
4. **Does it maintain data integrity?** (Event sourcing, validation)

#### Trade-off Considerations

- **Performance vs. Auditability**: Accept event sourcing overhead for complete history
- **Flexibility vs. Guidance**: Minimal constraints on structure, but provide sensible defaults
- **Feature richness vs. Simplicity**: Defer advanced features (collaboration, sync) to focus on core workflow
- **Local-first vs. Cloud-ready**: Design for local deployment, but keep cloud migration possible

### Principle Application

When implementing features, always ask:
1. Is this exposed via API? (API-first)
2. Is this recorded as an event? (Event sourcing)
3. Can users customize this? (Flexibility)
4. Can this be exported to markdown? (Export-first)

#### When Principles Conflict

If API-first adds complexity that blocks v1 delivery:
- Build the feature working end-to-end first
- Refactor to API-first before considering it complete
- Never ship a feature that bypasses the API

If flexibility creates confusion:
- Provide strong defaults
- Make customization opt-in
- Document the "happy path" clearly

#### Exceptions to Principles

Event sourcing overhead may be waived for:
- Non-functional state (UI preferences, window positions)
- Truly ephemeral data (search query, current scroll position)

Export-first may not apply to:
- Computed metadata (link counts, word counts)
- UI configuration

## Relationships
- **Parent Nodes:** [foundation/project_definition.md]
- **Child Nodes:** None
- **Related Nodes:** 
  - [foundation/structure.md] - implements - Project structure implements these principles
  - [processes/creation.md] - guided-by - Creation processes follow these principles
  - [decisions/*] - evaluated-against - Decisions are evaluated against these principles

## Navigation Guidance
- **Access Context:** Use this document when making significant decisions or evaluating options
- **Common Next Steps:** After reviewing principles, typically explore structure.md or specific decision records
- **Related Tasks:** Decision-making, design reviews, code reviews, process definition
- **Update Patterns:** This document should be updated rarely, only when fundamental principles change

## Metadata
- **Created:** 2025-11-14
- **Last Updated:** 2025-11-14
- **Updated By:** AI Agent (Claude)

## Change History
- 2025-11-14: Initial creation of principles template
- 2025-11-14: Populated with Bartleby architectural principles and design standards
