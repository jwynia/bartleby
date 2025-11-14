# Export System Element

## Purpose
This element handles the compilation and export of manuscript content as Pandoc-compatible markdown bundles. It determines card order, resolves wiki links to standard markdown links, and generates structured output ready for publishing workflows.

## Classification
- **Domain:** Output Generation
- **Stability:** Semi-stable
- **Abstraction:** Detailed
- **Confidence:** Established

## Export Formats

### Primary Format: Pandoc-Ready Markdown
ZIP bundle containing:
- `/chapters/*.md` - Content cards in order
- `/metadata/**/*.md` - Reference material (characters, locations, notes)
- `metadata.yaml` - Project and card metadata
- `compile-order.txt` - Ordered list of chapter files
- `README.md` - Export documentation

## Export Bundle Structure

```
/export-{timestamp}/
  /chapters/
    001-chapter-one.md
    002-chapter-two.md
    ...
  /metadata/
    /characters/
      john-smith.md
      jane-doe.md
    /locations/
      new-york.md
    /notes/
      research-notes.md
  metadata.yaml
  compile-order.txt
  README.md
```

## Ordering Algorithm

### 1. Determine Card Order

**If sequence links exist:**
- Follow `sequence` link chain from first card
- Build ordered list via traversal
- Warn if sequence has gaps or cycles

**If no sequence links:**
- Depth-first traversal of card tree
- Order by `position` field among siblings
- Respect hierarchy (parent before children)

**Filtering:**
- Include only cards of type "chapter" or "scene" by default
- Configurable via export options
- Non-content cards go to `/metadata`

### 2. Process Each Card

For each card in order:

1. **Sanitize Title**: Convert to filename-safe slug
   ```typescript
   "Chapter One: The Beginning" → "chapter-one-the-beginning"
   ```

2. **Add Sequence Prefix**: `001-`, `002-`, etc.

3. **Resolve Wiki Links**: Convert to relative markdown links
   ```markdown
   [[John Smith]] → [John Smith](../metadata/characters/john-smith.md)
   [[Next Chapter]] → [Next Chapter](002-chapter-two.md)
   ```

4. **Write File**: Save to appropriate directory

## Metadata YAML Format

```yaml
---
title: "Book Title"
author: "Author Name"
created: "2024-01-15"
modified: "2024-03-20"

cards:
  - id: "uuid-1"
    type: "chapter"
    title: "Chapter One"
    file: "chapters/001-chapter-one.md"
    metadata:
      wordCount: 2500
      status: "draft"

  - id: "uuid-2"
    type: "character"
    title: "John Smith"
    file: "metadata/characters/john-smith.md"
    metadata:
      age: 35
      occupation: "Detective"

links:
  - id: "link-uuid-1"
    source: "uuid-1"
    target: "uuid-2"
    type: "character-in"

  - id: "link-uuid-2"
    source: "uuid-1"
    target: "uuid-3"
    type: "located-at"
```

## compile-order.txt Format

Plain text list of relative paths:
```
chapters/001-chapter-one.md
chapters/002-chapter-two.md
chapters/003-chapter-three.md
```

Used by Pandoc and other tools to process files in correct order.

## Pandoc Integration

Users can process exported markdown with Pandoc:

```bash
# Generate PDF
pandoc -o book.pdf \
  --metadata-file=metadata.yaml \
  --template=template.tex \
  $(cat compile-order.txt)

# Generate EPUB
pandoc -o book.epub \
  --metadata-file=metadata.yaml \
  $(cat compile-order.txt)

# Generate DOCX
pandoc -o manuscript.docx \
  --metadata-file=metadata.yaml \
  --reference-doc=template.docx \
  $(cat compile-order.txt)
```

## Wiki Link Resolution

### Internal Links (within manuscript)
```markdown
# Original
See [[Chapter Two]] for details.

# Exported
See [Chapter Two](002-chapter-two.md) for details.
```

### Metadata Links
```markdown
# Original
The protagonist is [[John Smith]].

# Exported
The protagonist is [John Smith](../metadata/characters/john-smith.md).
```

### External/Unresolved Links
```markdown
# Original (ghost link)
Research [[Historical Context]].

# Exported (preserved as plain text or comment)
Research Historical Context.
<!-- Note: Link to "Historical Context" could not be resolved -->
```

## Export API

### Endpoint: POST /api/export/manuscript

**Request Body:**
```typescript
{
  format: 'markdown' | 'pandoc',
  includeMetadata: boolean,
  cardIds?: string[]  // Optional: export subset
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    exportId: string  // Used to download
  }
}
```

### Endpoint: GET /api/export/manuscript/:exportId

**Response:** ZIP file download

**Storage:** Exports stored in `/exports` directory (can be cleaned up periodically)

## Export Options

**Future enhancements:**

- **Filter by card type**: Export only chapters, or include all card types
- **Include/exclude metadata**: Control whether non-content cards are included
- **Link format**: Standard markdown vs. Pandoc cross-references
- **Custom templates**: User-provided Pandoc templates
- **Frontmatter options**: Custom YAML frontmatter per file

## Design Decisions

1. **Pandoc-first**: Target the most flexible publishing tool
2. **ZIP bundles**: Self-contained exports, easy to share
3. **Relative links**: Portable across systems
4. **Preserve structure**: Directory layout reflects card organization
5. **metadata.yaml**: Machine-readable for automation

## Responsibilities

- **Order determination**: Calculate export sequence
- **Link resolution**: Convert wiki links to markdown links
- **File generation**: Create markdown files with correct paths
- **Metadata compilation**: Generate YAML with complete project info
- **Bundle creation**: Assemble ZIP archive
- **Cleanup**: Remove old exports (retention policy TBD)

## File Naming

### Sanitization Rules
- Lowercase
- Replace spaces with hyphens
- Remove special characters (keep alphanumeric and hyphens)
- Limit to 50 characters (before sequence prefix)
- Handle collisions with incrementing suffix

```typescript
"Chapter 1: The Hero's Journey!" → "chapter-1-the-heros-journey"
"Chapter 1: The Hero's Journey!" (collision) → "chapter-1-the-heros-journey-2"
```

## Error Handling

**Potential Issues:**
- Sequence link cycles → Break at detection point, warn user
- Missing cards in sequence → Gap in numbering, warn user
- Unresolved wiki links → Comment in output, warn user
- File name collisions → Append suffix, warn user

**Export Validation:**
- Check all wiki links resolvable
- Verify no circular sequences
- Ensure all files have unique names
- Confirm metadata YAML is valid

## Relationships
- **Parent Nodes:** [foundation/structure.md]
- **Child Nodes:** None
- **Related Nodes:**
  - [data-model/overview.md] - reads - Queries cards and links
  - [api-server/overview.md] - integrated-in - Export endpoints
  - [wiki-link-system/overview.md] - uses - Resolves wiki links

## Navigation Guidance
- **Access Context:** Use when implementing export functionality or debugging output
- **Common Next Steps:** Review ordering algorithm, link resolution logic
- **Related Tasks:** Export implementation, Pandoc integration, file generation
