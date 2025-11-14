/**
 * Database initialization and connection management
 */

import Database from 'better-sqlite3';
import { initializeSchema, DEFAULT_CONFIG } from './schema.js';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectConfig } from '../types/index.js';

let db: Database.Database | null = null;

/**
 * Get or create database instance
 */
export function getDatabase(dbPath: string = './data/bartleby.db'): Database.Database {
  if (db) {
    return db;
  }

  // Create database
  db = new Database(dbPath);

  // Initialize schema
  initializeSchema(db);

  // Check if this is a new database
  const hasEvents = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };

  if (hasEvents.count === 0) {
    // New database - initialize with default config
    initializeNewDatabase(db);
  }

  return db;
}

/**
 * Initialize a new database with default configuration
 */
function initializeNewDatabase(db: Database.Database): void {
  // Insert default config
  const configStmt = db.prepare('INSERT INTO config (key, value) VALUES (?, ?)');
  configStmt.run('projectConfig', JSON.stringify(DEFAULT_CONFIG));

  // Create a config.updated event for the default config
  const event = {
    id: uuidv4(),
    timestamp: Date.now(),
    type: 'config.updated',
    payload: JSON.stringify({
      changes: DEFAULT_CONFIG
    })
  };

  const eventStmt = db.prepare(
    'INSERT INTO events (id, timestamp, type, payload) VALUES (?, ?, ?, ?)'
  );
  eventStmt.run(event.id, event.timestamp, event.type, event.payload);
}

/**
 * Get project configuration
 */
export function getConfig(db: Database.Database): ProjectConfig {
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get('projectConfig') as { value: string } | undefined;

  if (!row) {
    throw new Error('Configuration not found');
  }

  return JSON.parse(row.value);
}

/**
 * Update project configuration
 */
export function updateConfig(db: Database.Database, changes: Partial<ProjectConfig>): ProjectConfig {
  const current = getConfig(db);
  const updated = { ...current, ...changes };

  const stmt = db.prepare('UPDATE config SET value = ? WHERE key = ?');
  stmt.run(JSON.stringify(updated), 'projectConfig');

  return updated;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Export database instance getter
 */
export { db };
