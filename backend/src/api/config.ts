/**
 * Config and Events API routes
 */

import { Hono } from 'hono';
import type Database from 'better-sqlite3';
import { getConfig, updateConfig } from '../db/index.js';
import { getEventsSince, getAllEvents } from '../db/events.js';
import type { ProjectConfig } from '../types/index.js';

export function createConfigRoutes(db: Database.Database) {
  const app = new Hono();

  /**
   * GET /api/config
   * Get project configuration
   */
  app.get('/', (c) => {
    try {
      const config = getConfig(db);

      return c.json({
        success: true,
        data: config,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CONFIG_FETCH_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch config',
          },
        },
        500
      );
    }
  });

  /**
   * PATCH /api/config
   * Update project configuration
   */
  app.patch('/', async (c) => {
    try {
      const body = await c.req.json<Partial<ProjectConfig>>();

      const config = updateConfig(db, body);

      // TODO: Create config.updated event

      return c.json({
        success: true,
        data: config,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CONFIG_UPDATE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to update config',
          },
        },
        500
      );
    }
  });

  return app;
}

export function createEventRoutes(db: Database.Database) {
  const app = new Hono();

  /**
   * GET /api/events
   * Query event log
   */
  app.get('/', (c) => {
    try {
      const since = c.req.query('since');
      const limit = parseInt(c.req.query('limit') ?? '100', 10);
      const type = c.req.query('type');

      let events;

      if (since) {
        events = getEventsSince(db, parseInt(since, 10), limit);
      } else {
        events = getAllEvents(db);
        if (limit) {
          events = events.slice(-limit);
        }
      }

      // Filter by type if specified
      if (type) {
        events = events.filter(e => e.type === type);
      }

      return c.json({
        success: true,
        data: events,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'EVENTS_FETCH_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch events',
          },
        },
        500
      );
    }
  });

  return app;
}
