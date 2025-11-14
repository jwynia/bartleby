/**
 * Wiki link parser and resolver
 *
 * Parses markdown content for [[...]] references and resolves them to card IDs.
 * Manages the lifecycle of inline links.
 */

import type Database from 'better-sqlite3';
import type { Card } from '../types/index.js';
import { getAllCards } from './cards.js';
import { findLinkBetweenCards, createLink, updateLink, deleteLink } from './links.js';

/**
 * Parsed wiki link reference
 */
export interface ParsedReference {
  text: string;            // Original [[...]] text
  cardType?: string;       // If [[Type:Title]] format
  cardTitle?: string;      // The title part
  cardId?: string;         // If [[#uuid]] format
  range: [number, number]; // Position in text
}

/**
 * Resolved reference
 */
export interface ResolvedReference extends ParsedReference {
  resolvedCardId?: string;
  ambiguous?: boolean;     // Multiple matches found
  matchCount?: number;
}

// Wiki link regex: [[...]]
const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

/**
 * Parse markdown content for wiki link references
 */
export function parseWikiLinks(markdown: string): ParsedReference[] {
  const refs: ParsedReference[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  WIKI_LINK_REGEX.lastIndex = 0;

  while ((match = WIKI_LINK_REGEX.exec(markdown)) !== null) {
    const inner = match[1].trim();
    const ref: ParsedReference = {
      text: match[0],
      range: [match.index, match.index + match[0].length],
    };

    if (inner.startsWith('#')) {
      // Direct UUID reference: [[#uuid]]
      ref.cardId = inner.slice(1);
    } else if (inner.includes(':')) {
      // Typed reference: [[Type:Title]]
      const [type, ...titleParts] = inner.split(':');
      ref.cardType = type.trim();
      ref.cardTitle = titleParts.join(':').trim();
    } else {
      // Plain title reference: [[Title]]
      ref.cardTitle = inner;
    }

    refs.push(ref);
  }

  return refs;
}

/**
 * Resolve a reference to a card ID
 */
export function resolveReference(
  ref: ParsedReference,
  cards: Card[]
): ResolvedReference {
  const resolved: ResolvedReference = { ...ref };

  if (ref.cardId) {
    // Direct ID reference - check if it exists
    const exists = cards.find(c => c.id === ref.cardId);
    if (exists) {
      resolved.resolvedCardId = ref.cardId;
      resolved.matchCount = 1;
    } else {
      resolved.matchCount = 0;
    }
    return resolved;
  }

  // Search by title
  let candidates = cards;

  if (ref.cardType) {
    // Filter by type first
    candidates = candidates.filter(c => c.cardType === ref.cardType);
  }

  // Find matches (case-insensitive)
  const matches = candidates.filter(
    c => c.title.toLowerCase() === ref.cardTitle?.toLowerCase()
  );

  resolved.matchCount = matches.length;

  if (matches.length === 1) {
    // Single match - resolved
    resolved.resolvedCardId = matches[0].id;
  } else if (matches.length > 1) {
    // Multiple matches - ambiguous
    resolved.ambiguous = true;
  }

  return resolved;
}

/**
 * Resolve all references in markdown content
 */
export function resolveWikiLinks(
  db: Database.Database,
  markdown: string
): ResolvedReference[] {
  const refs = parseWikiLinks(markdown);
  const cards = getAllCards(db);

  return refs.map(ref => resolveReference(ref, cards));
}

/**
 * Process wiki links for a card update
 *
 * This function:
 * 1. Parses new wiki links from content
 * 2. Resolves them to card IDs
 * 3. Creates/updates links as needed
 * 4. Cleans up removed inline links
 */
export function processWikiLinksForCard(
  db: Database.Database,
  cardId: string,
  oldContent: string,
  newContent: string
): void {
  // Parse references from old and new content
  const oldRefs = parseWikiLinks(oldContent);
  const newRefs = parseWikiLinks(newContent);

  // Resolve new references
  const cards = getAllCards(db);
  const resolvedNewRefs = newRefs.map(ref => resolveReference(ref, cards));

  // Get existing inline links for this card
  const existingLinks = db
    .prepare(
      `SELECT * FROM links WHERE (card_a_id = ? OR card_b_id = ?)
       AND (created_from = ? OR created_from = ?)`
    )
    .all(cardId, cardId, 'inline-A', 'inline-B') as Array<{
    id: string;
    card_a_id: string;
    card_b_id: string;
    link_type: string;
    created_from: string;
    metadata: string;
    created_at: number;
  }>;

  // Track which links are still valid
  const validLinkIds = new Set<string>();

  // Process each resolved reference
  for (const ref of resolvedNewRefs) {
    if (!ref.resolvedCardId) {
      // Can't resolve - skip (ghost link)
      continue;
    }

    // Check if link already exists
    const existingLink = findLinkBetweenCards(db, cardId, ref.resolvedCardId);

    if (existingLink) {
      // Link exists - update metadata with inline reference
      validLinkIds.add(existingLink.id);

      const metadata = existingLink.metadata;
      const createdFromKey = existingLink.cardAId === cardId ? 'inlineRefA' : 'inlineRefB';

      // Update only if changed
      if (metadata[createdFromKey] !== ref.text) {
        metadata[createdFromKey] = ref.text;
        updateLink(db, existingLink.id, { metadata });
      }
    } else {
      // Create new link
      const createdFrom = cardId < ref.resolvedCardId ? 'inline-A' : 'inline-B';
      const metadata: any = {};
      const metadataKey = createdFrom === 'inline-A' ? 'inlineRefA' : 'inlineRefB';
      metadata[metadataKey] = ref.text;

      const result = createLink(db, {
        cardAId: cardId < ref.resolvedCardId ? cardId : ref.resolvedCardId,
        cardBId: cardId < ref.resolvedCardId ? ref.resolvedCardId : cardId,
        linkType: 'mentions',
        createdFrom,
        metadata,
      });

      validLinkIds.add(result.link.id);
    }
  }

  // Clean up removed inline links
  for (const link of existingLinks) {
    if (!validLinkIds.has(link.id)) {
      // Link was created inline but reference is gone
      const metadata = JSON.parse(link.metadata);
      const isCardA = link.card_a_id === cardId;
      const refKey = isCardA ? 'inlineRefA' : 'inlineRefB';

      // Remove inline reference
      delete metadata[refKey];

      // Check if link has other provenance
      const hasOtherInlineRef = isCardA ? metadata.inlineRefB : metadata.inlineRefA;
      const wasExplicitlyCreated = link.created_from === 'explicit';

      if (!hasOtherInlineRef && !wasExplicitlyCreated && link.created_from.startsWith('inline')) {
        // No other provenance - delete link
        deleteLink(db, link.id);
      } else {
        // Keep link but update metadata
        updateLink(db, link.id, { metadata });
      }
    }
  }
}

/**
 * Get unresolved references for a card
 */
export function getUnresolvedReferences(
  db: Database.Database,
  markdown: string
): string[] {
  const resolved = resolveWikiLinks(db, markdown);

  return resolved
    .filter(ref => !ref.resolvedCardId && !ref.ambiguous)
    .map(ref => ref.text);
}

/**
 * Get ambiguous references for a card
 */
export function getAmbiguousReferences(
  db: Database.Database,
  markdown: string
): Array<{ text: string; matches: Card[] }> {
  const resolved = resolveWikiLinks(db, markdown);
  const cards = getAllCards(db);

  return resolved
    .filter(ref => ref.ambiguous)
    .map(ref => {
      let candidates = cards;

      if (ref.cardType) {
        candidates = candidates.filter(c => c.cardType === ref.cardType);
      }

      const matches = candidates.filter(
        c => c.title.toLowerCase() === ref.cardTitle?.toLowerCase()
      );

      return {
        text: ref.text,
        matches,
      };
    });
}
