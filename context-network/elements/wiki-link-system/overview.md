# Wiki Link System Element

## Purpose
This element handles the parsing, resolution, and lifecycle management of wiki-style links (`[[Card Title]]`) within markdown content. It automatically creates and maintains bidirectional links between cards.

## Classification
- **Domain:** Content Processing
- **Stability:** Static
- **Abstraction:** Detailed
- **Confidence:** Established

## Wiki Link Syntax

### Basic Formats
```markdown
[[Card Title]]                  # Link to any card by title
[[Character:John Smith]]        # Link to card of specific type
[[#uuid-here]]                  # Direct link by ID (for disambiguation)
```

### Resolution Rules

1. **Type-prefixed**: `[[Type:Title]]` searches only cards of that type
2. **Direct ID**: `[[#uuid]]` resolves immediately, no ambiguity
3. **Plain title**: `[[Title]]` searches all cards, may be ambiguous

### Matching Algorithm
- Case-insensitive
- Trim whitespace
- Exact match on title
- If multiple matches → mark as ambiguous
- If no match → mark as unresolved (ghost link)

## Lifecycle

```mermaid
flowchart TD
    Save[User saves card] --> Parse[Parse markdown]
    Parse --> Extract[Extract [[...]] refs]
    Extract --> Resolve{Can resolve?}
    Resolve -->|Yes| Check{Link exists?}
    Resolve -->|No| Ghost[Mark as ghost link]
    Check -->|Yes| Update[Update inline metadata]
    Check -->|No| Create[Create new link]
    Ghost --> Render[Render with indicator]
```

### On Card Save

1. **Parse**: Extract all `[[...]]` patterns from markdown
2. **Resolve**: Attempt to match each reference to a card ID
3. **Diff**: Compare to existing inline links
4. **Create**: New references → create Link entities
5. **Update**: Existing references → update `inlineRef` metadata
6. **Remove**: Missing references → delete link (if no other provenance)

### On Card Rename

When a card title changes:
1. Search for unresolved references matching new title
2. Resolve any ghost links
3. Create Link entities for newly resolved references

### On Card Delete

When a card is deleted:
1. All links involving that card are deleted (FK cascade)
2. References in other cards become ghost links

## Ghost Links (Unresolved References)

**Definition:** A `[[Reference]]` that doesn't match any existing card.

**Rendering:**
- Orange/yellow underline in editor
- Tooltip: "Card not found. Click to create."

**Resolution:**
1. User clicks ghost link
2. Modal opens with title pre-filled
3. User selects card type
4. Card created
5. Link established automatically

**Auto-resolution:**
- When any card is created/renamed, check all unresolved refs
- Resolve matches automatically

## Editor Integration

### Milkdown Plugin

**Input Rules:**
- Trigger on `[[` typing
- Show autocomplete dropdown
- Filter by partial match
- Group by card type
- Include "Create new" option

**Node Rendering:**
```typescript
// Resolved link
<WikiLink cardId={cardId} title={title} resolved={true} />

// Unresolved/ghost link
<UnresolvedLink text={text} onCreate={handleCreate} />
```

**Autocomplete:**
- Fuzzy search on card titles
- Show card type icons
- Preview on hover
- Keyboard navigation (arrow keys, enter to select)

## Link Provenance Tracking

Links track how they were created via `createdFrom` field:

- `'inline-A'`: Created by wiki link in card A
- `'inline-B'`: Created by wiki link in card B
- `'explicit'`: Created via UI (link panel)
- `'A'` or `'B'`: Created programmatically from one side

**Deletion Rules:**
- Inline link removed from markdown → delete Link only if no other provenance
- If link was also created explicitly → keep Link, just remove `inlineRef`

## Metadata Structure

```typescript
interface Link {
  metadata: {
    inlineRefA?: string;   // "[[Original Text]]" from card A
    inlineRefB?: string;   // "[[Original Text]]" from card B
    // ... other metadata
  }
}
```

## Parsing Implementation

### Regex Pattern
```typescript
const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;
```

### Parser Function
```typescript
function parseWikiLinks(markdown: string): ParsedReference[] {
  const refs: ParsedReference[] = [];
  let match: RegExpExecArray | null;

  while ((match = WIKI_LINK_REGEX.exec(markdown)) !== null) {
    const inner = match[1].trim();
    const ref: ParsedReference = {
      text: match[0],
      range: [match.index, match.index + match[0].length],
    };

    if (inner.startsWith('#')) {
      ref.cardId = inner.slice(1);
    } else if (inner.includes(':')) {
      const [type, ...titleParts] = inner.split(':');
      ref.cardType = type.trim();
      ref.cardTitle = titleParts.join(':').trim();
    } else {
      ref.cardTitle = inner;
    }

    refs.push(ref);
  }

  return refs;
}
```

## Ambiguity Handling

When multiple cards match a reference:

**UI Behavior:**
1. Show disambiguation dialog
2. List all matching cards with:
   - Title
   - Card type
   - Preview of content
   - Path in hierarchy
3. User selects intended target
4. Link created with selected card

**Preventing Ambiguity:**
- Use type prefix: `[[Character:John]]` vs `[[Location:John]]`
- Use direct ID: `[[#uuid]]`
- Unique card titles within a type

## Design Decisions

1. **Bidirectional storage**: All links stored bidirectionally, provenance tracked separately
2. **Ghost links as feature**: Don't block save, allow forward references
3. **Automatic resolution**: Passive system resolves as cards created
4. **Inline metadata**: Preserve original wiki syntax for round-tripping
5. **Multiple provenance**: Link can exist from inline + explicit creation

## Responsibilities

- **Parse**: Extract wiki link references from markdown
- **Resolve**: Match references to card IDs
- **Create**: Generate Link entities for resolved references
- **Track**: Maintain inline reference metadata
- **Cleanup**: Remove links when references deleted

## Relationships
- **Parent Nodes:** [foundation/structure.md]
- **Child Nodes:** None
- **Related Nodes:**
  - [data-model/overview.md] - creates - Generates Link entities
  - [api-server/overview.md] - integrated-in - Called during card updates
  - [frontend-app/overview.md] - integrated-in - Editor plugin for UX

## Navigation Guidance
- **Access Context:** Use when implementing link parsing or editor plugins
- **Common Next Steps:** Review parsing algorithm, editor integration
- **Related Tasks:** Parser implementation, autocomplete UX, ghost link handling
