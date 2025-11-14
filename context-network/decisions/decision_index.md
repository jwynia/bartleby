# Decision Record Index

## Purpose
This document serves as an index of all key decisions made for the project, providing a centralized registry for easy reference and navigation.

## Classification
- **Domain:** Documentation
- **Stability:** Dynamic
- **Abstraction:** Structural
- **Confidence:** Established

## Content

### Decision Records

| ID | Title | Status | Date | Domain | Summary |
|----|-------|--------|------|--------|---------|
| [001](001-event-sourcing-architecture.md) | Event Sourcing Architecture | Accepted | 2025-11-14 | Architecture | Use event sourcing with materialized views for complete audit trail and undo capability |
| [002](002-bidirectional-links.md) | Bidirectional Link Storage | Accepted | 2025-11-14 | Data Model | Store all links as bidirectional relationships regardless of creation method |
| [003](003-technology-stack.md) | Technology Stack Selection | Accepted | 2025-11-14 | Technology | Core stack: Node.js, Hono, SQLite, React, Vite, TanStack, Milkdown |
| [004](004-docker-per-book-deployment.md) | Docker Container Per Book | Accepted | 2025-11-14 | Deployment | Deploy each book as a separate self-contained Docker container |
| [005](005-visx-for-visualization.md) | Use visx for Visualization | Accepted | 2025-11-14 | Technology | Use visx instead of D3.js directly for better React integration in network visualization |

### Decision Status Legend

- **Proposed**: A decision that is under consideration but not yet accepted
- **Accepted**: A decision that has been accepted and is currently in effect
- **Deprecated**: A decision that is no longer recommended but still in effect
- **Superseded**: A decision that has been replaced by a newer decision

### Decision Categories

#### By Domain
- **Architecture**: 001
- **Data Model**: 002
- **Technology**: 003, 005
- **Deployment**: 004

#### By Status
- **Proposed**: None
- **Accepted**: 001, 002, 003, 004, 005
- **Deprecated**: None
- **Superseded**: None

### Decision Relationships

[This section will contain a visualization or description of how decisions relate to each other]

## Relationships
- **Parent Nodes:** [foundation/structure.md]
- **Child Nodes:** [All individual decision records]
- **Related Nodes:** 
  - [processes/creation.md] - relates-to - Creation processes affected by decisions
  - [foundation/principles.md] - implements - Decisions implement project principles

## Navigation Guidance
- **Access Context:** Use this document when looking for specific key decisions or understanding decision history
- **Common Next Steps:** From here, navigate to specific decision records of interest
- **Related Tasks:** Project review, onboarding new team members, planning new work, understanding rationale
- **Update Patterns:** This index should be updated whenever a new decision is added or a decision status changes

## Metadata
- **Created:** 2025-11-14
- **Last Updated:** 2025-11-14
- **Updated By:** AI Agent (Claude)

## Change History
- 2025-11-14: Initial creation of decision index
- 2025-11-14: Added decisions 001-005
