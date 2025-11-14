/**
 * Card API routes
 */

import { Hono } from 'hono';
import type Database from 'better-sqlite3';
import * as cardService from '../services/cards.js';
import * as linkService from '../services/links.js';
import { processWikiLinksForCard } from '../services/wikilinks.js';
import type { CreateCardInput, UpdateCardInput } from '../types/index.js';

export function createCardRoutes(db: Database.Database) {
  const app = new Hono();

  /**
   * GET /api/cards
   * List/search cards with optional filters
   */
  app.get('/', (c) => {
    try {
      const type = c.req.query('type');
      const parentId = c.req.query('parentId');
      const q = c.req.query('q');

      let cards;

      if (q) {
        // Search mode
        cards = cardService.searchCards(db, q);
      } else {
        // Filter mode
        const filters: any = {};
        if (type) filters.type = type;
        if (parentId !== undefined) filters.parentId = parentId;

        cards = cardService.getAllCards(db, filters);
      }

      return c.json({
        success: true,
        data: cards,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CARDS_FETCH_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch cards',
          },
        },
        500
      );
    }
  });

  /**
   * GET /api/cards/:id
   * Get card details with links
   */
  app.get('/:id', (c) => {
    try {
      const id = c.req.param('id');
      const card = cardService.getCardById(db, id);

      if (!card) {
        return c.json(
          {
            success: false,
            error: {
              code: 'CARD_NOT_FOUND',
              message: `Card ${id} not found`,
            },
          },
          404
        );
      }

      // Get links for this card
      const links = linkService.getLinksForCard(db, id);

      return c.json({
        success: true,
        data: {
          ...card,
          links,
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CARD_FETCH_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch card',
          },
        },
        500
      );
    }
  });

  /**
   * POST /api/cards
   * Create a new card
   */
  app.post('/', async (c) => {
    try {
      const body = await c.req.json<CreateCardInput>();

      // Validate required fields
      if (!body.title || !body.cardType) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Title and cardType are required',
            },
          },
          400
        );
      }

      const { card, event } = cardService.createCard(db, body);

      // Process wiki links in initial content
      if (body.content) {
        processWikiLinksForCard(db, card.id, '', body.content);
      }

      // Get links if any were created
      const links = linkService.getLinksForCard(db, card.id);

      return c.json(
        {
          success: true,
          data: card,
          event,
          links: links.length > 0 ? links : undefined,
        },
        201
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CARD_CREATE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to create card',
          },
        },
        500
      );
    }
  });

  /**
   * PATCH /api/cards/:id
   * Update a card
   */
  app.patch('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<UpdateCardInput>();

      // Get old card for wiki link comparison
      const oldCard = cardService.getCardById(db, id);
      if (!oldCard) {
        return c.json(
          {
            success: false,
            error: {
              code: 'CARD_NOT_FOUND',
              message: `Card ${id} not found`,
            },
          },
          404
        );
      }

      // Update card
      const result = cardService.updateCard(db, id, body);
      if (!result) {
        throw new Error('Failed to update card');
      }

      const { card, event } = result;

      // Process wiki links if content changed
      if (body.content !== undefined) {
        processWikiLinksForCard(db, id, oldCard.content, body.content);
      }

      // Get updated links
      const links = linkService.getLinksForCard(db, id);

      return c.json({
        success: true,
        data: card,
        event,
        links,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CARD_UPDATE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to update card',
          },
        },
        500
      );
    }
  });

  /**
   * DELETE /api/cards/:id
   * Delete a card
   */
  app.delete('/:id', (c) => {
    try {
      const id = c.req.param('id');

      const result = cardService.deleteCard(db, id);

      if (!result) {
        return c.json(
          {
            success: false,
            error: {
              code: 'CARD_NOT_FOUND',
              message: `Card ${id} not found`,
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
            code: 'CARD_DELETE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to delete card',
          },
        },
        500
      );
    }
  });

  /**
   * POST /api/cards/:id/move
   * Move a card (change parent/position)
   */
  app.post('/:id/move', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<{ parentId: string | null; position: number }>();

      if (typeof body.position !== 'number') {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Position must be a number',
            },
          },
          400
        );
      }

      const result = cardService.moveCard(db, id, body.parentId, body.position);

      if (!result) {
        return c.json(
          {
            success: false,
            error: {
              code: 'CARD_NOT_FOUND',
              message: `Card ${id} not found`,
            },
          },
          404
        );
      }

      return c.json({
        success: true,
        data: result.card,
        event: result.event,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'CARD_MOVE_ERROR',
            message: error instanceof Error ? error.message : 'Failed to move card',
          },
        },
        500
      );
    }
  });

  /**
   * GET /api/cards/:id/network
   * Get network of connected cards
   */
  app.get('/:id/network', (c) => {
    try {
      const id = c.req.param('id');
      const depth = parseInt(c.req.query('depth') ?? '1', 10);
      const linkTypes = c.req.query('linkTypes')?.split(',').filter(Boolean);

      const network = linkService.getCardNetwork(db, id, depth, linkTypes);

      return c.json({
        success: true,
        data: network,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NETWORK_FETCH_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch network',
          },
        },
        500
      );
    }
  });

  return app;
}
