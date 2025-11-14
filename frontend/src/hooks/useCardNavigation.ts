import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTreeStore } from '../stores/treeStore';
import { useCards } from './useCards';

/**
 * Hook for keyboard navigation between cards
 * Provides prev/next navigation shortcuts
 */
export function useCardNavigation() {
  const navigate = useNavigate();
  const { selectedId, setSelected } = useTreeStore();
  const { data: cards } = useCards();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if Cmd/Ctrl is pressed (Cmd+[ or Cmd+])
      if (!(e.metaKey || e.ctrlKey)) return;

      // Previous card: Cmd+[
      if (e.key === '[') {
        e.preventDefault();
        navigateToPreviousCard();
      }
      // Next card: Cmd+]
      else if (e.key === ']') {
        e.preventDefault();
        navigateToNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const navigateToPreviousCard = () => {
    if (!cards || !selectedId) return;

    const currentIndex = cards.findIndex(c => c.id === selectedId);
    if (currentIndex > 0) {
      const prevCard = cards[currentIndex - 1];
      setSelected(prevCard.id);
      navigate({ to: '/cards/$cardId', params: { cardId: prevCard.id } });
    }
  };

  const navigateToNextCard = () => {
    if (!cards || !selectedId) return;

    const currentIndex = cards.findIndex(c => c.id === selectedId);
    if (currentIndex >= 0 && currentIndex < cards.length - 1) {
      const nextCard = cards[currentIndex + 1];
      setSelected(nextCard.id);
      navigate({ to: '/cards/$cardId', params: { cardId: nextCard.id } });
    }
  };

  return {
    navigateToPreviousCard,
    navigateToNextCard,
  };
}
