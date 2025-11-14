/**
 * Bartleby API Server
 * Main entry point
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getDatabase } from './db/index.js';
import { createCardRoutes } from './api/cards.js';
import { createLinkRoutes } from './api/links.js';
import { createConfigRoutes, createEventRoutes } from './api/config.js';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Environment variables
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const DB_PATH = process.env.DB_PATH ?? './data/bartleby.db';

// Ensure data directory exists
const dataDir = dirname(DB_PATH);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = getDatabase(DB_PATH);

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Mount API routes
app.route('/api/cards', createCardRoutes(db));
app.route('/api/links', createLinkRoutes(db));
app.route('/api/config', createConfigRoutes(db));
app.route('/api/events', createEventRoutes(db));

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Internal server error',
      },
    },
    500
  );
});

// Start server
console.log(`🚀 Bartleby API server starting...`);
console.log(`📁 Database: ${DB_PATH}`);
console.log(`🌐 Server: http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
