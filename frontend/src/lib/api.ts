/**
 * API client for Bartleby backend
 */

import type {
  Card,
  CardWithLinks,
  CreateCardInput,
  UpdateCardInput,
  Link,
  CreateLinkInput,
  UpdateLinkInput,
  ProjectConfig,
  CardNetwork,
  ApiResponse,
} from './types';

const API_BASE = '/api';

/**
 * Fetch wrapper with error handling
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}

// ============================================================================
// Card API
// ============================================================================

export async function getCards(filters?: {
  type?: string;
  parentId?: string;
  q?: string;
}): Promise<Card[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.parentId !== undefined) params.append('parentId', filters.parentId);
  if (filters?.q) params.append('q', filters.q);

  const query = params.toString();
  return fetchApi<Card[]>(`/cards${query ? `?${query}` : ''}`);
}

export async function getCard(id: string): Promise<CardWithLinks> {
  return fetchApi<CardWithLinks>(`/cards/${id}`);
}

export async function createCard(input: CreateCardInput): Promise<Card> {
  return fetchApi<Card>('/cards', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateCard(id: string, changes: UpdateCardInput): Promise<Card> {
  return fetchApi<Card>(`/cards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export async function deleteCard(id: string): Promise<{ id: string }> {
  return fetchApi<{ id: string }>(`/cards/${id}`, {
    method: 'DELETE',
  });
}

export async function moveCard(
  id: string,
  parentId: string | null,
  position: number
): Promise<Card> {
  return fetchApi<Card>(`/cards/${id}/move`, {
    method: 'POST',
    body: JSON.stringify({ parentId, position }),
  });
}

export async function getCardNetwork(
  id: string,
  depth?: number,
  linkTypes?: string[]
): Promise<CardNetwork> {
  const params = new URLSearchParams();
  if (depth !== undefined) params.append('depth', depth.toString());
  if (linkTypes?.length) params.append('linkTypes', linkTypes.join(','));

  const query = params.toString();
  return fetchApi<CardNetwork>(`/cards/${id}/network${query ? `?${query}` : ''}`);
}

// ============================================================================
// Link API
// ============================================================================

export async function getLinks(filters?: { cardId?: string; type?: string }): Promise<Link[]> {
  const params = new URLSearchParams();
  if (filters?.cardId) params.append('cardId', filters.cardId);
  if (filters?.type) params.append('type', filters.type);

  const query = params.toString();
  return fetchApi<Link[]>(`/links${query ? `?${query}` : ''}`);
}

export async function createLink(input: CreateLinkInput): Promise<Link> {
  return fetchApi<Link>('/links', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateLink(id: string, changes: UpdateLinkInput): Promise<Link> {
  return fetchApi<Link>(`/links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export async function deleteLink(id: string): Promise<{ id: string }> {
  return fetchApi<{ id: string }>(`/links/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Config API
// ============================================================================

export async function getConfig(): Promise<ProjectConfig> {
  return fetchApi<ProjectConfig>('/config');
}

export async function updateConfig(changes: Partial<ProjectConfig>): Promise<ProjectConfig> {
  return fetchApi<ProjectConfig>('/config', {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

// ============================================================================
// Events API
// ============================================================================

export async function getEvents(filters?: {
  since?: number;
  limit?: number;
  type?: string;
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.since !== undefined) params.append('since', filters.since.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.type) params.append('type', filters.type);

  const query = params.toString();
  return fetchApi<any[]>(`/events${query ? `?${query}` : ''}`);
}
