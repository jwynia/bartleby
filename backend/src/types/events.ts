/**
 * Event types for event sourcing
 */

import type { Card, Link, ProjectConfig } from './index.js';

// ============================================================================
// Base Event
// ============================================================================

export interface BaseEvent {
  id: string;
  timestamp: number;
  type: string;
}

// ============================================================================
// Card Events
// ============================================================================

export interface CardCreatedEvent extends BaseEvent {
  type: 'card.created';
  payload: {
    cardId: string;
    title: string;
    content: string;
    cardType: string;
    metadata: Record<string, any>;
    parentId: string | null;
    position: number;
  };
}

export interface CardUpdatedEvent extends BaseEvent {
  type: 'card.updated';
  payload: {
    cardId: string;
    changes: Partial<Pick<Card, 'title' | 'content' | 'cardType' | 'metadata'>>;
  };
}

export interface CardDeletedEvent extends BaseEvent {
  type: 'card.deleted';
  payload: {
    cardId: string;
  };
}

export interface CardMovedEvent extends BaseEvent {
  type: 'card.moved';
  payload: {
    cardId: string;
    oldParentId: string | null;
    newParentId: string | null;
    oldPosition: number;
    newPosition: number;
  };
}

// ============================================================================
// Link Events
// ============================================================================

export interface LinkCreatedEvent extends BaseEvent {
  type: 'link.created';
  payload: {
    linkId: string;
    cardAId: string;
    cardBId: string;
    linkType: string;
    createdFrom: Link['createdFrom'];
    metadata: Link['metadata'];
  };
}

export interface LinkUpdatedEvent extends BaseEvent {
  type: 'link.updated';
  payload: {
    linkId: string;
    changes: Partial<Pick<Link, 'linkType' | 'metadata'>>;
  };
}

export interface LinkDeletedEvent extends BaseEvent {
  type: 'link.deleted';
  payload: {
    linkId: string;
  };
}

// ============================================================================
// Config Events
// ============================================================================

export interface ConfigUpdatedEvent extends BaseEvent {
  type: 'config.updated';
  payload: {
    changes: Partial<ProjectConfig>;
  };
}

// ============================================================================
// Event Union Type
// ============================================================================

export type Event =
  | CardCreatedEvent
  | CardUpdatedEvent
  | CardDeletedEvent
  | CardMovedEvent
  | LinkCreatedEvent
  | LinkUpdatedEvent
  | LinkDeletedEvent
  | ConfigUpdatedEvent;

// Type guards for events
export function isCardEvent(event: Event): event is CardCreatedEvent | CardUpdatedEvent | CardDeletedEvent | CardMovedEvent {
  return event.type.startsWith('card.');
}

export function isLinkEvent(event: Event): event is LinkCreatedEvent | LinkUpdatedEvent | LinkDeletedEvent {
  return event.type.startsWith('link.');
}

export function isConfigEvent(event: Event): event is ConfigUpdatedEvent {
  return event.type.startsWith('config.');
}
