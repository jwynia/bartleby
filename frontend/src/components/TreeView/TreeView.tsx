import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Tree, NodeApi, MoveHandler } from 'react-arborist';
import { useCards, useCreateCard, useMoveCard } from '../../hooks/useCards';
import { useTreeStore } from '../../stores/treeStore';
import { buildTree } from '../../lib/treeUtils';
import type { TreeNode } from '../../lib/treeUtils';
import type { CreateCardInput } from '../../lib/types';
import { TreeNodeComponent } from './TreeNode';
import './TreeView.css';

export function TreeView() {
  const treeRef = useRef<any>(null);
  const navigate = useNavigate();

  const { data: cards, isLoading, error } = useCards();
  const createCard = useCreateCard();
  const moveCardMutation = useMoveCard();

  const { expandedIds, selectedId, setSelected } = useTreeStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardType, setNewCardType] = useState('note');

  // Build tree structure from cards
  const treeData = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    return buildTree(cards);
  }, [cards]);

  // Handle node selection
  const handleSelect = (nodes: NodeApi<TreeNode>[]) => {
    const node = nodes[0];
    if (node) {
      setSelected(node.id);
      // Navigate to card detail route
      navigate({ to: '/cards/$cardId', params: { cardId: node.id } });
    } else {
      setSelected(null);
      navigate({ to: '/' });
    }
  };

  // Handle create card
  const handleCreate = () => {
    if (!newCardTitle.trim()) return;

    const input: CreateCardInput = {
      title: newCardTitle,
      cardType: newCardType,
      content: '',
      parentId: selectedId || undefined,
    };

    createCard.mutate(input, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewCardTitle('');
        setNewCardType('note');
      },
    });
  };

  // Handle card move (drag-and-drop)
  const handleMove: MoveHandler<TreeNode> = ({ dragIds, parentId, index }) => {
    // Only handle single card moves for now
    if (dragIds.length !== 1) return;

    const cardId = dragIds[0];
    const newParentId = parentId || null;
    const newPosition = index;

    // Prevent moving a card onto itself or its descendants
    if (cards) {
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;

      // Check if trying to move onto a descendant
      const isDescendant = (targetId: string | null, potentialAncestorId: string): boolean => {
        if (!targetId) return false;
        if (targetId === potentialAncestorId) return true;
        const targetCard = cards.find((c) => c.id === targetId);
        if (!targetCard || !targetCard.parentId) return false;
        return isDescendant(targetCard.parentId, potentialAncestorId);
      };

      if (newParentId && isDescendant(newParentId, cardId)) {
        console.warn('Cannot move a card to its own descendant');
        return;
      }
    }

    // Perform the move
    moveCardMutation.mutate({
      id: cardId,
      parentId: newParentId,
      position: newPosition,
    });
  };

  // Handle delete card (with confirmation)
  // const handleDelete = (_id: string) => {
  //   if (window.confirm('Are you sure you want to delete this card?')) {
  //     deleteCard.mutate(id);
  //   }
  // };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N: New card
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowCreateModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="tree-view">
        <div className="tree-header">
          <h2>Cards</h2>
        </div>
        <div className="tree-content">
          <p className="placeholder-text">Loading cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tree-view">
        <div className="tree-header">
          <h2>Cards</h2>
        </div>
        <div className="tree-content">
          <p className="error-text">Error loading cards: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tree-view">
      <div className="tree-header">
        <h2>Cards</h2>
        <button
          className="tree-action"
          onClick={() => setShowCreateModal(true)}
          title="New Card (Cmd+N)"
        >
          +
        </button>
      </div>

      {showCreateModal && (
        <div className="create-modal">
          <h3>New Card</h3>
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Card title..."
            className="modal-input"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setShowCreateModal(false);
            }}
          />
          <select
            value={newCardType}
            onChange={(e) => setNewCardType(e.target.value)}
            className="modal-select"
          >
            <option value="note">Note</option>
            <option value="chapter">Chapter</option>
            <option value="scene">Scene</option>
            <option value="character">Character</option>
            <option value="location">Location</option>
            <option value="research">Research</option>
            <option value="plot">Plot</option>
          </select>
          <div className="modal-actions">
            <button
              onClick={handleCreate}
              disabled={createCard.isPending}
              className="modal-button primary"
            >
              {createCard.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="modal-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="tree-content">
        {treeData.length === 0 ? (
          <div className="empty-state">
            <p>No cards yet</p>
            <p className="hint-text">Click + to create your first card</p>
          </div>
        ) : (
          <Tree
            ref={treeRef}
            data={treeData}
            openByDefault={false}
            width="100%"
            height={600}
            indent={20}
            rowHeight={36}
            overscanCount={10}
            onSelect={handleSelect}
            onMove={handleMove}
            selection={selectedId || undefined}
            {...(expandedIds.size > 0 && {
              initialOpenState: Object.fromEntries(
                Array.from(expandedIds).map(id => [id, true])
              ),
            })}
          >
            {TreeNodeComponent}
          </Tree>
        )}
      </div>
    </div>
  );
}
