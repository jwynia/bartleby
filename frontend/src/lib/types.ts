/**
 * Frontend types (mirroring backend types)
 */

// ============================================================================
// Card
// ============================================================================

export interface Card {
  id: string;
  title: string;
  content: string;
  cardType: string;
  metadata: Record<string, any>;
  parentId: string | null;
  position: number;
  createdAt: number;
  modifiedAt: number;
}

export interface CreateCardInput {
  title: string;
  content?: string;
  cardType: string;
  metadata?: Record<string, any>;
  parentId?: string | null;
  position?: number;
}

export interface UpdateCardInput {
  title?: string;
  content?: string;
  cardType?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Link
// ============================================================================

export type LinkCreatedFrom = 'A' | 'B' | 'inline-A' | 'inline-B' | 'explicit';

export interface Link {
  id: string;
  cardAId: string;
  cardBId: string;
  linkType: string;
  createdFrom: LinkCreatedFrom;
  metadata: {
    inlineRefA?: string;
    inlineRefB?: string;
    [key: string]: any;
  };
  createdAt: number;
}

export interface CreateLinkInput {
  cardAId: string;
  cardBId: string;
  linkType: string;
  createdFrom?: LinkCreatedFrom;
  metadata?: Link['metadata'];
}

export interface UpdateLinkInput {
  linkType?: string;
  metadata?: Link['metadata'];
}

// ============================================================================
// ProjectConfig
// ============================================================================

export interface CardTypeConfig {
  id: string;
  label: string;
  color?: string;
  icon?: string;
  defaultMetadata?: Record<string, any>;
}

export interface LinkTypeConfig {
  id: string;
  label: string;
  color?: string;
  bidirectional: boolean;
}

export interface ProjectConfig {
  projectMetadata: {
    title: string;
    author?: string;
    [key: string]: any;
  };
  cardTypes: CardTypeConfig[];
  linkTypes: LinkTypeConfig[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface SuccessResponse<T> {
  success: true;
  data: T;
  event?: any;
  links?: Array<{ link: Link; otherCard: Card }>;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ============================================================================
// Extended Types
// ============================================================================

export interface CardWithLinks extends Card {
  links: Array<{ link: Link; otherCard: Card }>;
}

export interface CardNetwork {
  center: Card;
  cards: Card[];
  links: Link[];
}
