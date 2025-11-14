/**
 * Link API routes
 */

import { Hono } from 'hono';
import type Database from 'better-sqlite3';
import * as linkService from '../services/links.js';
import type { CreateLinkInput, UpdateLinkInput } from '../types/index.js';

export function createLinkRoutes(db: Database.Database) {
  const app = new Hono();

  /**
   * GET /api/links
   * List links with optional filters
   */
  app.get('/', (c) => {
    try {
      const cardId = c.req.query('cardId');
      const type = c.req.query('type');

      const filters: any = {};
      if (cardId) filters.cardId = cardId;
      if (type) filters.type = type;

      const links = linkService.getAllLinks(db, filters);

      return c.json({
        success: true,
        data: links,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'LINKS_FETCH_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch links',
          },
        },
        500
      );
    }
  });

  /**
   * POST /api/links
   * Create a new link
   */
  app.post('/', async (c) => {
    try {
      const body = await c.req.json<CreateLinkInput>();

      // Validate required fields
      if (!body.cardAId || !body.cardBId || !body.linkType) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'cardAId, cardBId, and linkType are required',
            },
          },
          400
        );
      }

      // Validate cards are different
      if (body.cardAId === body.cardBId) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Cannot link a card to itself',
            },
          },
          400
        );
      }

      const { link, event } = linkService.createLink(db, body);

      return c.json(
        {
          success: true,
          data: link,
          event,
        },
        201
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'LINK_CREATE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to create link',
          },
        },
        500
      );
    }
  });

  /**
   * PATCH /api/links/:id
   * Update a link
   */
  app.patch('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<UpdateLinkInput>();

      const result = linkService.updateLink(db, id, body);

      if (!result) {
        return c.json(
          {
            success: false,
            error: {
              code: 'LINK_NOT_FOUND',
              message: `Link ${id} not found`,
            },
          },
          404
        );
      }

      return c.json({
        success: true,
        data: result.link,
        event: result.event,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'LINK_UPDATE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to update link',
          },
        },
        500
      );
    }
  });

  /**
   * DELETE /api/links/:id
   * Delete a link
   */
  app.delete('/:id', (c) => {
    try {
      const id = c.req.param('id');

      const result = linkService.deleteLink(db, id);

      if (!result) {
        return c.json(
          {
            success: false,
            error: {
              code: 'LINK_NOT_FOUND',
              message: `Link ${id} not found`,
            },
          },
          404
        );
      }

      return c.json({
        success: true,
        data: { id },
        event: result.event,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'LINK_DELETE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to delete link',
          },
        },
        500
      );
    }
  });

  return app;
}
