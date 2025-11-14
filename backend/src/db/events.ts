/**
 * Event store implementation for event sourcing
 */

import type Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { Event } from '../types/events.js';

/**
 * Append an event to the event log
 */
export function appendEvent(db: Database.Database, event: Event): void {
  const stmt = db.prepare(
    'INSERT INTO events (id, timestamp, type, payload) VALUES (?, ?, ?, ?)'
  );

  stmt.run(
    event.id,
    event.timestamp,
    event.type,
    JSON.stringify(event.payload)
  );
}

/**
 * Get all events since a specific timestamp
 */
export function getEventsSince(db: Database.Database, timestamp: number, limit: number = 100): Event[] {
  const stmt = db.prepare(
    'SELECT * FROM events WHERE timestamp > ? ORDER BY timestamp ASC LIMIT ?'
  );

  const rows = stmt.all(timestamp, limit) as Array<{
    id: string;
    timestamp: number;
    type: string;
    payload: string;
  }>;

  return rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    payload: JSON.parse(row.payload)
  })) as Event[];
}

/**
 * Get events by type
 */
export function getEventsByType(db: Database.Database, type: string, limit: number = 100): Event[] {
  const stmt = db.prepare(
    'SELECT * FROM events WHERE type = ? ORDER BY timestamp DESC LIMIT ?'
  );

  const rows = stmt.all(type, limit) as Array<{
    id: string;
    timestamp: number;
    type: string;
    payload: string;
  }>;

  return rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    payload: JSON.parse(row.payload)
  })) as Event[];
}

/**
 * Get all events (for replay)
 */
export function getAllEvents(db: Database.Database): Event[] {
  const stmt = db.prepare('SELECT * FROM events ORDER BY timestamp ASC');

  const rows = stmt.all() as Array<{
    id: string;
    timestamp: number;
    type: string;
    payload: string;
  }>;

  return rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    payload: JSON.parse(row.payload)
  })) as Event[];
}

/**
 * Apply an event to materialized views
 *
 * This updates the cards, links, and config tables based on the event.
 */
export function applyEvent(db: Database.Database, event: Event): void {
  switch (event.type) {
    case 'card.created':
      applyCardCreated(db, event);
      break;

    case 'card.updated':
      applyCardUpdated(db, event);
      break;

    case 'card.deleted':
      applyCardDeleted(db, event);
      break;

    case 'card.moved':
      applyCardMoved(db, event);
      break;

    case 'link.created':
      applyLinkCreated(db, event);
      break;

    case 'link.updated':
      applyLinkUpdated(db, event);
      break;

    case 'link.deleted':
      applyLinkDeleted(db, event);
      break;

    case 'config.updated':
      applyConfigUpdated(db, event);
      break;

    default:
      throw new Error(`Unknown event type: ${(event as any).type}`);
  }
}

// ============================================================================
// Event Application Functions
// ============================================================================

function applyCardCreated(db: Database.Database, event: Event & { type: 'card.created' }): void {
  const { cardId, title, content, cardType, metadata, parentId, position } = event.payload;

  const stmt = db.prepare(`
    INSERT INTO cards (id, title, content, card_type, metadata, parent_id, position, created_at, modified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    cardId,
    title,
    content,
    cardType,
    JSON.stringify(metadata),
    parentId,
    position,
    event.timestamp,
    event.timestamp
  );
}

function applyCardUpdated(db: Database.Database, event: Event & { type: 'card.updated' }): void {
  const { cardId, changes } = event.payload;

  const updates: string[] = [];
  const values: any[] = [];

  if (changes.title !== undefined) {
    updates.push('title = ?');
    values.push(changes.title);
  }

  if (changes.content !== undefined) {
    updates.push('content = ?');
    values.push(changes.content);
  }

  if (changes.cardType !== undefined) {
    updates.push('card_type = ?');
    values.push(changes.cardType);
  }

  if (changes.metadata !== undefined) {
    updates.push('metadata = ?');
    values.push(JSON.stringify(changes.metadata));
  }

  updates.push('modified_at = ?');
  values.push(event.timestamp);

  values.push(cardId);

  const stmt = db.prepare(`
    UPDATE cards SET ${updates.join(', ')} WHERE id = ?
  `);

  stmt.run(...values);
}

function applyCardDeleted(db: Database.Database, event: Event & { type: 'card.deleted' }): void {
  const { cardId } = event.payload;
  const stmt = db.prepare('DELETE FROM cards WHERE id = ?');
  stmt.run(cardId);
}

function applyCardMoved(db: Database.Database, event: Event & { type: 'card.moved' }): void {
  const { cardId, newParentId, newPosition } = event.payload;

  const stmt = db.prepare(`
    UPDATE cards SET parent_id = ?, position = ?, modified_at = ? WHERE id = ?
  `);

  stmt.run(newParentId, newPosition, event.timestamp, cardId);
}

function applyLinkCreated(db: Database.Database, event: Event & { type: 'link.created' }): void {
  const { linkId, cardAId, cardBId, linkType, createdFrom, metadata } = event.payload;

  const stmt = db.prepare(`
    INSERT INTO links (id, card_a_id, card_b_id, link_type, created_from, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    linkId,
    cardAId,
    cardBId,
    linkType,
    createdFrom,
    JSON.stringify(metadata),
    event.timestamp
  );
}

function applyLinkUpdated(db: Database.Database, event: Event & { type: 'link.updated' }): void {
  const { linkId, changes } = event.payload;

  const updates: string[] = [];
  const values: any[] = [];

  if (changes.linkType !== undefined) {
    updates.push('link_type = ?');
    values.push(changes.linkType);
  }

  if (changes.metadata !== undefined) {
    updates.push('metadata = ?');
    values.push(JSON.stringify(changes.metadata));
  }

  values.push(linkId);

  const stmt = db.prepare(`
    UPDATE links SET ${updates.join(', ')} WHERE id = ?
  `);

  stmt.run(...values);
}

function applyLinkDeleted(db: Database.Database, event: Event & { type: 'link.deleted' }): void {
  const { linkId } = event.payload;
  const stmt = db.prepare('DELETE FROM links WHERE id = ?');
  stmt.run(linkId);
}

function applyConfigUpdated(db: Database.Database, event: Event & { type: 'config.updated' }): void {
  const { changes } = event.payload;

  // Get current config
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get('projectConfig') as { value: string } | undefined;

  let current = {};
  if (row) {
    current = JSON.parse(row.value);
  }

  // Merge changes
  const updated = { ...current, ...changes };

  // Upsert
  const stmt = db.prepare(`
    INSERT INTO config (key, value) VALUES ('projectConfig', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);

  stmt.run(JSON.stringify(updated));
}

/**
 * Rebuild materialized views from event log
 *
 * This deletes all data in materialized views and replays all events.
 * Useful for recovery or testing event replay.
 */
export function rebuildViews(db: Database.Database): void {
  // Clear materialized views
  db.exec('DELETE FROM cards');
  db.exec('DELETE FROM links');
  db.exec('DELETE FROM config');

  // Get all events
  const events = getAllEvents(db);

  // Replay each event
  for (const event of events) {
    applyEvent(db, event);
  }
}
