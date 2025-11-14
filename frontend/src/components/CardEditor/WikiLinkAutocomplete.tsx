import { useEffect, useRef, useState } from 'react';
import { useCards } from '../../hooks/useCards';
import { fuzzySearch } from '../../lib/fuzzySearch';
import type { Card } from '../../lib/types';
import { getCardTypeIcon } from '../../lib/treeUtils';
import './WikiLinkAutocomplete.css';

interface WikiLinkAutocompleteProps {
  query: string;
  position: { top: number; left: number };
  onSelect: (card: Card | null) => void;
  onClose: () => void;
}

export function WikiLinkAutocomplete({
  query,
  position,
  onSelect,
  onClose,
}: WikiLinkAutocompleteProps) {
  const { data: cards } = useCards();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter and rank cards by fuzzy search
  const matchedCards = fuzzySearch(
    cards || [],
    query,
    (card) => card.title,
    10
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % matchedCards.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + matchedCards.length) % matchedCards.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (matchedCards[selectedIndex]) {
          onSelect(matchedCards[selectedIndex]);
        } else {
          // Create new card with this title
          onSelect(null);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, matchedCards, onSelect, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="wiki-link-autocomplete"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {matchedCards.length > 0 ? (
        <ul className="autocomplete-list">
          {matchedCards.map((card, index) => (
            <li
              key={card.id}
              className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => onSelect(card)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="autocomplete-icon">{getCardTypeIcon(card.cardType)}</span>
              <span className="autocomplete-title">{card.title}</span>
              <span className="autocomplete-type">{card.cardType}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="autocomplete-empty">
          <p>No cards found</p>
          <p className="autocomplete-hint">
            Press <kbd>Enter</kbd> to create "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
