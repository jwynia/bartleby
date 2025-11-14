/**
 * Card repository - data access layer for cards
 */

import type Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { Card, CreateCardInput, UpdateCardInput } from '../types/index.js';
import type { CardCreatedEvent, CardUpdatedEvent, CardDeletedEvent, CardMovedEvent } from '../types/events.js';
import { appendEvent, applyEvent } from '../db/events.js';

/**
 * Get all cards
 */
export function getAllCards(db: Database.Database, filters?: { type?: string; parentId?: string | 'null' }): Card[] {
  let query = 'SELECT * FROM cards';
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters?.type) {
    conditions.push('card_type = ?');
    params.push(filters.type);
  }

  if (filters?.parentId !== undefined) {
    if (filters.parentId === 'null') {
      conditions.push('parent_id IS NULL');
    } else {
      conditions.push('parent_id = ?');
      params.push(filters.parentId);
    }
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY parent_id, position';

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as Array<{
    id: string;
    title: string;
    content: string;
    card_type: string;
    metadata: string;
    parent_id: string | null;
    position: number;
    created_at: number;
    modified_at: number;
  }>;

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    cardType: row.card_type,
    metadata: JSON.parse(row.metadata),
    parentId: row.parent_id,
    position: row.position,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
  }));
}

/**
 * Get card by ID
 */
export function getCardById(db: Database.Database, id: string): Card | null {
  const stmt = db.prepare('SELECT * FROM cards WHERE id = ?');
  const row = stmt.get(id) as {
    id: string;
    title: string;
    content: string;
    card_type: string;
    metadata: string;
    parent_id: string | null;
    position: number;
    created_at: number;
    modified_at: number;
  } | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    cardType: row.card_type,
    metadata: JSON.parse(row.metadata),
    parentId: row.parent_id,
    position: row.position,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
  };
}

/**
 * Create a new card
 */
export function createCard(db: Database.Database, input: CreateCardInput): { card: Card; event: CardCreatedEvent } {
  const cardId = uuidv4();
  const now = Date.now();

  // Determine position if not provided
  let position = input.position ?? 0;
  if (position === undefined || position === null) {
    // Get max position for siblings
    const stmt = db.prepare(
      'SELECT MAX(position) as max_pos FROM cards WHERE parent_id IS ? OR parent_id = ?'
    );
    const result = stmt.get(input.parentId ?? null, input.parentId ?? null) as { max_pos: number | null };
    position = (result.max_pos ?? -1) + 1;
  }

  // Create event
  const event: CardCreatedEvent = {
    id: uuidv4(),
    timestamp: now,
    type: 'card.created',
    payload: {
      cardId,
      title: input.title,
      content: input.content ?? '',
      cardType: input.cardType,
      metadata: input.metadata ?? {},
      parentId: input.parentId ?? null,
      position,
    },
  };

  // Append event and apply to views
  appendEvent(db, event);
  applyEvent(db, event);

  // Retrieve created card
  const card = getCardById(db, cardId);
  if (!card) {
    throw new Error('Failed to create card');
  }

  return { card, event };
}

/**
 * Update a card
 */
export function updateCard(
  db: Database.Database,
  id: string,
  changes: UpdateCardInput
): { card: Card; event: CardUpdatedEvent } | null {
  // Check if card exists
  const existing = getCardById(db, id);
  if (!existing) {
    return null;
  }

  const now = Date.now();

  // Create event
  const event: CardUpdatedEvent = {
    id: uuidv4(),
    timestamp: now,
    type: 'card.updated',
    payload: {
      cardId: id,
      changes,
    },
  };

  // Append event and apply to views
  appendEvent(db, event);
  applyEvent(db, event);

  // Retrieve updated card
  const card = getCardById(db, id);
  if (!card) {
    throw new Error('Failed to update card');
  }

  return { card, event };
}

/**
 * Delete a card
 */
export function deleteCard(db: Database.Database, id: string): { event: CardDeletedEvent } | null {
  // Check if card exists
  const existing = getCardById(db, id);
  if (!existing) {
    return null;
  }

  const now = Date.now();

  // Create event
  const event: CardDeletedEvent = {
    id: uuidv4(),
    timestamp: now,
    type: 'card.deleted',
    payload: {
      cardId: id,
    },
  };

  // Append event and apply to views
  appendEvent(db, event);
  applyEvent(db, event);

  return { event };
}

/**
 * Move a card (change parent and/or position)
 */
export function moveCard(
  db: Database.Database,
  id: string,
  newParentId: string | null,
  newPosition: number
): { card: Card; event: CardMovedEvent } | null {
  // Check if card exists
  const existing = getCardById(db, id);
  if (!existing) {
    return null;
  }

  const now = Date.now();

  // Create event
  const event: CardMovedEvent = {
    id: uuidv4(),
    timestamp: now,
    type: 'card.moved',
    payload: {
      cardId: id,
      oldParentId: existing.parentId,
      newParentId,
      oldPosition: existing.position,
      newPosition,
    },
  };

  // Append event and apply to views
  appendEvent(db, event);
  applyEvent(db, event);

  // Retrieve updated card
  const card = getCardById(db, id);
  if (!card) {
    throw new Error('Failed to move card');
  }

  return { card, event };
}

/**
 * Search cards by title or content
 */
export function searchCards(db: Database.Database, query: string): Card[] {
  const stmt = db.prepare(`
    SELECT * FROM cards
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY modified_at DESC
    LIMIT 50
  `);

  const searchPattern = `%${query}%`;
  const rows = stmt.all(searchPattern, searchPattern) as Array<{
    id: string;
    title: string;
    content: string;
    card_type: string;
    metadata: string;
    parent_id: string | null;
    position: number;
    created_at: number;
    modified_at: number;
  }>;

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    cardType: row.card_type,
    metadata: JSON.parse(row.metadata),
    parentId: row.parent_id,
    position: row.position,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
  }));
}
