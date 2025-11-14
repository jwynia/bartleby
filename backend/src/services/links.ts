/**
 * Link repository - data access layer for links
 */

import type Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { Link, CreateLinkInput, UpdateLinkInput, Card } from '../types/index.js';
import type { LinkCreatedEvent, LinkUpdatedEvent, LinkDeletedEvent } from '../types/events.js';
import { appendEvent, applyEvent } from '../db/events.js';
import { getCardById } from './cards.js';

/**
 * Get all links, optionally filtered
 */
export function getAllLinks(db: Database.Database, filters?: { cardId?: string; type?: string }): Link[] {
  let query = 'SELECT * FROM links';
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters?.cardId) {
    conditions.push('(card_a_id = ? OR card_b_id = ?)');
    params.push(filters.cardId, filters.cardId);
  }

  if (filters?.type) {
    conditions.push('link_type = ?');
    params.push(filters.type);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as Array<{
    id: string;
    card_a_id: string;
    card_b_id: string;
    link_type: string;
    created_from: string;
    metadata: string;
    created_at: number;
  }>;

  return rows.map(row => ({
    id: row.id,
    cardAId: row.card_a_id,
    cardBId: row.card_b_id,
    linkType: row.link_type,
    createdFrom: row.created_from as Link['createdFrom'],
    metadata: JSON.parse(row.metadata),
    createdAt: row.created_at,
  }));
}

/**
 * Get link by ID
 */
export function getLinkById(db: Database.Database, id: string): Link | null {
  const stmt = db.prepare('SELECT * FROM links WHERE id = ?');
  const row = stmt.get(id) as {
    id: string;
    card_a_id: string;
    card_b_id: string;
    link_type: string;
    created_from: string;
    metadata: string;
    created_at: number;
  } | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    cardAId: row.card_a_id,
    cardBId: row.card_b_id,
    linkType: row.link_type,
    createdFrom: row.created_from as Link['createdFrom'],
    metadata: JSON.parse(row.metadata),
    createdAt: row.created_at,
  };
}

/**
 * Get links for a specific card, with the other card included
 */
export function getLinksForCard(
  db: Database.Database,
  cardId: string
): Array<{ link: Link; otherCard: Card }> {
  const links = getAllLinks(db, { cardId });

  return links.map(link => {
    const otherCardId = link.cardAId === cardId ? link.cardBId : link.cardAId;
    const otherCard = getCardById(db, otherCardId);

    if (!otherCard) {
      throw new Error(`Linked card ${otherCardId} not found`);
    }

    return { link, otherCard };
  });
}

/**
 * Create a new link
 */
export function createLink(db: Database.Database, input: CreateLinkInput): { link: Link; event: LinkCreatedEvent } {
  // Validate that both cards exist
  const cardA = getCardById(db, input.cardAId);
  const cardB = getCardById(db, input.cardBId);

  if (!cardA) {
    throw new Error(`Card ${input.cardAId} not found`);
  }

  if (!cardB) {
    throw new Error(`Card ${input.cardBId} not found`);
  }

  // Check if link already exists between these cards
  const existing = findLinkBetweenCards(db, input.cardAId, input.cardBId);
  if (existing) {
    throw new Error('Link already exists between these cards');
  }

  const linkId = uuidv4();
  const now = Date.now();

  // Create event
  const event: LinkCreatedEvent = {
    id: uuidv4(),
    timestamp: now,
    type: 'link.created',
    payload: {
      linkId,
      cardAId: input.cardAId,
      cardBId: input.cardBId,
      linkType: input.linkType,
      createdFrom: input.createdFrom ?? 'explicit',
      metadata: input.metadata ?? {},
    },
  };

  // Append event and apply to views
  appendEvent(db, event);
  applyEvent(db, event);

  // Retrieve created link
  const link = getLinkById(db, linkId);
  if (!link) {
    throw new Error('Failed to create link');
  }

  return { link, event };
}

/**
 * Update a link
 */
export function updateLink(
  db: Database.Database,
  id: string,
  changes: UpdateLinkInput
): { link: Link; event: LinkUpdatedEvent } | null {
  // Check if link exists
  const existing = getLinkById(db, id);
  if (!existing) {
    return null;
  }

  const now = Date.now();

  // Create event
  const event: LinkUpdatedEvent = {
    id: uuidv4(),
    timestamp: now,
    type: 'link.updated',
    payload: {
      linkId: id,
      changes,
    },
  };

  // Append event and apply to views
  appendEvent(db, event);
  applyEvent(db, event);

  // Retrieve updated link
  const link = getLinkById(db, id);
  if (!link) {
    throw new Error('Failed to update link');
  }

  return { link, event };
}

/**
 * Delete a link
 */
export function deleteLink(db: Database.Database, id: string): { event: LinkDeletedEvent } | null {
  // Check if link exists
  const existing = getLinkById(db, id);
  if (!existing) {
    return null;
  }

  const now = Date.now();

  // Create event
  const event: LinkDeletedEvent = {
    id: uuidv4(),
    timestamp: now,
    type: 'link.deleted',
    payload: {
      linkId: id,
    },
  };

  // Append event and apply to views
  appendEvent(db, event);
  applyEvent(db, event);

  return { event };
}

/**
 * Find a link between two cards (bidirectional)
 */
export function findLinkBetweenCards(db: Database.Database, cardIdA: string, cardIdB: string): Link | null {
  const stmt = db.prepare(`
    SELECT * FROM links
    WHERE (card_a_id = ? AND card_b_id = ?) OR (card_a_id = ? AND card_b_id = ?)
    LIMIT 1
  `);

  const row = stmt.get(cardIdA, cardIdB, cardIdB, cardIdA) as {
    id: string;
    card_a_id: string;
    card_b_id: string;
    link_type: string;
    created_from: string;
    metadata: string;
    created_at: number;
  } | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    cardAId: row.card_a_id,
    cardBId: row.card_b_id,
    linkType: row.link_type,
    createdFrom: row.created_from as Link['createdFrom'],
    metadata: JSON.parse(row.metadata),
    createdAt: row.created_at,
  };
}

/**
 * Get network of connected cards
 */
export function getCardNetwork(
  db: Database.Database,
  centerCardId: string,
  depth: number = 1,
  linkTypes?: string[]
): { center: Card; cards: Card[]; links: Link[] } {
  const center = getCardById(db, centerCardId);
  if (!center) {
    throw new Error(`Card ${centerCardId} not found`);
  }

  const visitedCardIds = new Set<string>([centerCardId]);
  const cards: Card[] = [];
  const links: Link[] = [];
  const queue: Array<{ cardId: string; currentDepth: number }> = [{ cardId: centerCardId, currentDepth: 0 }];

  while (queue.length > 0) {
    const { cardId, currentDepth } = queue.shift()!;

    if (currentDepth >= depth) {
      continue;
    }

    // Get all links for this card
    let cardLinks = getAllLinks(db, { cardId });

    // Filter by link types if specified
    if (linkTypes && linkTypes.length > 0) {
      cardLinks = cardLinks.filter(link => linkTypes.includes(link.linkType));
    }

    for (const link of cardLinks) {
      // Add link if not already added
      if (!links.find(l => l.id === link.id)) {
        links.push(link);
      }

      // Find the other card in the link
      const otherCardId = link.cardAId === cardId ? link.cardBId : link.cardAId;

      if (!visitedCardIds.has(otherCardId)) {
        visitedCardIds.add(otherCardId);

        const otherCard = getCardById(db, otherCardId);
        if (otherCard) {
          cards.push(otherCard);
          queue.push({ cardId: otherCardId, currentDepth: currentDepth + 1 });
        }
      }
    }
  }

  return { center, cards, links };
}
