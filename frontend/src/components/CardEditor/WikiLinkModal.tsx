import { useState, useRef, useEffect } from 'react';
import { useCards, useCreateCard } from '../../hooks/useCards';
import { useCreateLink } from '../../hooks/useLinks';
import { fuzzySearch } from '../../lib/fuzzySearch';
import type { Card } from '../../lib/types';
import { getCardTypeIcon } from '../../lib/treeUtils';
import './WikiLinkModal.css';

interface WikiLinkModalProps {
  sourceCardId: string;
  onInsert: (title: string, targetCardId: string) => void;
  onClose: () => void;
}

export function WikiLinkModal({ sourceCardId, onInsert, onClose }: WikiLinkModalProps) {
  const { data: cards } = useCards();
  const createCard = useCreateCard();
  const createLink = useCreateLink();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter cards by search query
  const matchedCards = fuzzySearch(
    cards?.filter((c) => c.id !== sourceCardId) || [],
    query,
    (card) => card.title,
    10
  );

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, matchedCards.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Handle selection
  const handleSelect = async () => {
    if (selectedIndex < matchedCards.length) {
      // Link to existing card
      const targetCard = matchedCards[selectedIndex];

      // Create link in backend
      await createLink.mutateAsync({
        cardAId: sourceCardId,
        cardBId: targetCard.id,
        linkType: 'reference',
        createdFrom: 'explicit',
      });

      onInsert(targetCard.title, targetCard.id);
      onClose();
    } else if (query.trim()) {
      // Create new card
      const newCard = await createCard.mutateAsync({
        title: query.trim(),
        cardType: 'note',
        content: '',
      });

      // Create link to new card
      await createLink.mutateAsync({
        cardAId: sourceCardId,
        cardBId: newCard.id,
        linkType: 'reference',
        createdFrom: 'explicit',
      });

      onInsert(newCard.title, newCard.id);
      onClose();
    }
  };

  const handleCardClick = async (card: Card) => {
    // Create link in backend
    await createLink.mutateAsync({
      cardAId: sourceCardId,
      cardBId: card.id,
      linkType: 'reference',
      createdFrom: 'explicit',
    });

    onInsert(card.title, card.id);
    onClose();
  };

  const handleCreateNew = async () => {
    if (!query.trim()) return;

    const newCard = await createCard.mutateAsync({
      title: query.trim(),
      cardType: 'note',
      content: '',
    });

    await createLink.mutateAsync({
      cardAId: sourceCardId,
      cardBId: newCard.id,
      linkType: 'reference',
      createdFrom: 'explicit',
    });

    onInsert(newCard.title, newCard.id);
    onClose();
  };

  return (
    <div className="wiki-link-modal-overlay" onClick={onClose}>
      <div className="wiki-link-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Insert Link</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <input
            ref={inputRef}
            type="text"
            className="wiki-link-search"
            placeholder="Search or create card..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />

          <div className="wiki-link-results">
            {matchedCards.length > 0 ? (
              <>
                <div className="results-section">
                  <h4>Existing Cards</h4>
                  <ul className="results-list">
                    {matchedCards.map((card, index) => (
                      <li
                        key={card.id}
                        className={`result-item ${index === selectedIndex ? 'selected' : ''}`}
                        onClick={() => handleCardClick(card)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <span className="result-icon">{getCardTypeIcon(card.cardType)}</span>
                        <span className="result-title">{card.title}</span>
                        <span className="result-type">{card.cardType}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {query.trim() && !matchedCards.some((c) => c.title.toLowerCase() === query.toLowerCase()) && (
                  <div className="results-section">
                    <h4>Create New</h4>
                    <ul className="results-list">
                      <li
                        className={`result-item create-new ${selectedIndex === matchedCards.length ? 'selected' : ''}`}
                        onClick={handleCreateNew}
                        onMouseEnter={() => setSelectedIndex(matchedCards.length)}
                      >
                        <span className="result-icon">+</span>
                        <span className="result-title">Create "{query}"</span>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : query.trim() ? (
              <div className="results-empty">
                <p>No cards found</p>
                <button className="primary" onClick={handleCreateNew}>
                  Create "{query}"
                </button>
              </div>
            ) : (
              <div className="results-empty">
                <p>Type to search for cards...</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="modal-hints">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Select</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
