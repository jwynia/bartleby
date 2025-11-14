/**
 * Database schema definition and initialization
 */

import type Database from 'better-sqlite3';

/**
 * SQL schema for Bartleby database
 *
 * Tables:
 * - events: Append-only event log (source of truth)
 * - cards: Materialized view (can be rebuilt from events)
 * - links: Materialized view (can be rebuilt from events)
 * - config: Materialized view (can be rebuilt from events)
 */

export const SCHEMA_SQL = `
-- ============================================================================
-- Events Table (Source of Truth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,  -- JSON

  -- Indexes for querying
  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

-- ============================================================================
-- Cards Table (Materialized View)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  card_type TEXT NOT NULL,
  metadata TEXT NOT NULL,  -- JSON
  parent_id TEXT,
  position INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  modified_at INTEGER NOT NULL,

  -- Foreign key for hierarchy
  FOREIGN KEY (parent_id) REFERENCES cards(id) ON DELETE CASCADE,

  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_cards_parent ON cards(parent_id);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(card_type);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(parent_id, position);

-- ============================================================================
-- Links Table (Materialized View)
-- ============================================================================

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  card_a_id TEXT NOT NULL,
  card_b_id TEXT NOT NULL,
  link_type TEXT NOT NULL,
  created_from TEXT NOT NULL,
  metadata TEXT NOT NULL,  -- JSON
  created_at INTEGER NOT NULL,

  -- Foreign keys
  FOREIGN KEY (card_a_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (card_b_id) REFERENCES cards(id) ON DELETE CASCADE,

  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_links_card_a ON links(card_a_id);
CREATE INDEX IF NOT EXISTS idx_links_card_b ON links(card_b_id);
CREATE INDEX IF NOT EXISTS idx_links_type ON links(link_type);

-- ============================================================================
-- Config Table (Materialized View)
-- ============================================================================

CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,  -- JSON

  UNIQUE(key)
);
`;

/**
 * Initialize database with schema
 */
export function initializeSchema(db: Database.Database): void {
  // Execute schema SQL
  db.exec(SCHEMA_SQL);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
}

/**
 * Default project configuration
 */
export const DEFAULT_CONFIG = {
  projectMetadata: {
    title: 'Untitled Project'
  },
  cardTypes: [
    { id: 'chapter', label: 'Chapter', color: '#3b82f6' },
    { id: 'scene', label: 'Scene', color: '#8b5cf6' },
    { id: 'character', label: 'Character', color: '#ec4899' },
    { id: 'location', label: 'Location', color: '#10b981' },
    { id: 'note', label: 'Note', color: '#6b7280' }
  ],
  linkTypes: [
    { id: 'parent-child', label: 'Parent/Child', bidirectional: true },
    { id: 'sequence', label: 'Follows', bidirectional: false },
    { id: 'mentions', label: 'Mentions', bidirectional: true },
    { id: 'contradicts', label: 'Contradicts', bidirectional: true },
    { id: 'supports', label: 'Supports', bidirectional: true },
    { id: 'character-in', label: 'Character In', bidirectional: true },
    { id: 'located-at', label: 'Located At', bidirectional: true }
  ]
};
