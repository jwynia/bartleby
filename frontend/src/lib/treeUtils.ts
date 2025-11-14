import type { Card } from './types';

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  data: Card;
}

/**
 * Build a hierarchical tree structure from a flat array of cards
 */
export function buildTree(cards: Card[]): TreeNode[] {
  const cardMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // First pass: Create tree nodes for all cards
  cards.forEach((card) => {
    cardMap.set(card.id, {
      id: card.id,
      name: card.title,
      children: [],
      data: card,
    });
  });

  // Second pass: Build parent-child relationships
  cards.forEach((card) => {
    const node = cardMap.get(card.id);
    if (!node) return;

    if (card.parentId && cardMap.has(card.parentId)) {
      // Add to parent's children
      const parent = cardMap.get(card.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    } else {
      // No parent or parent doesn't exist - this is a root node
      roots.push(node);
    }
  });

  // Sort children by position within each level
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.data.position || 0) - (b.data.position || 0));
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(roots);

  return roots;
}

/**
 * Get all ancestor IDs for a given card
 */
export function getAncestorIds(cardId: string, cards: Card[]): string[] {
  const ancestors: string[] = [];
  let currentId: string | null = cardId;

  while (currentId) {
    const card = cards.find((c) => c.id === currentId);
    if (!card || !card.parentId) break;

    ancestors.push(card.parentId);
    currentId = card.parentId;
  }

  return ancestors;
}

/**
 * Get all descendant IDs for a given card
 */
export function getDescendantIds(cardId: string, cards: Card[]): string[] {
  const descendants: string[] = [];
  const children = cards.filter((c) => c.parentId === cardId);

  children.forEach((child) => {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(child.id, cards));
  });

  return descendants;
}

/**
 * Count the number of child cards (direct children only)
 */
export function getChildCount(cardId: string, cards: Card[]): number {
  return cards.filter((c) => c.parentId === cardId).length;
}

/**
 * Get icon for card type
 */
export function getCardTypeIcon(cardType: string): string {
  const iconMap: Record<string, string> = {
    chapter: '📖',
    scene: '🎬',
    character: '👤',
    location: '📍',
    note: '📝',
    research: '🔬',
    plot: '🗺️',
  };

  return iconMap[cardType.toLowerCase()] || '📄';
}

/**
 * Get color for card type
 */
export function getCardTypeColor(cardType: string): string {
  const colorMap: Record<string, string> = {
    chapter: '#3b82f6', // blue
    scene: '#8b5cf6', // purple
    character: '#ec4899', // pink
    location: '#10b981', // green
    note: '#f59e0b', // amber
    research: '#06b6d4', // cyan
    plot: '#ef4444', // red
  };

  return colorMap[cardType.toLowerCase()] || '#64748b'; // gray default
}
