import { useState, useCallback, useRef } from 'react';
import type { Card } from '../lib/types';

interface AutocompleteState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  range: { from: number; to: number } | null;
}

export function useWikiLinkAutocomplete() {
  const [state, setState] = useState<AutocompleteState>({
    isOpen: false,
    query: '',
    position: { top: 0, left: 0 },
    range: null,
  });

  const editorRef = useRef<HTMLElement | null>(null);

  // Set editor element reference
  const setEditorElement = useCallback((element: HTMLElement | null) => {
    editorRef.current = element;
  }, []);

  // Detect [[ pattern in content
  const detectWikiLink = useCallback((content: string, cursorPos: number) => {
    // Look backwards from cursor for [[
    const beforeCursor = content.substring(0, cursorPos);
    const lastOpenBracket = beforeCursor.lastIndexOf('[[');

    if (lastOpenBracket === -1) {
      return null;
    }

    // Check if there's a closing ]] between [[ and cursor
    const betweenBrackets = content.substring(lastOpenBracket + 2, cursorPos);
    if (betweenBrackets.includes(']]')) {
      return null;
    }

    // Extract query (text between [[ and cursor)
    const query = betweenBrackets;

    return {
      query,
      from: lastOpenBracket,
      to: cursorPos,
    };
  }, []);

  // Open autocomplete
  const openAutocomplete = useCallback((query: string, from: number, to: number) => {
    if (!editorRef.current) return;

    // Calculate position for dropdown (below cursor)
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setState({
      isOpen: true,
      query,
      position: {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      },
      range: { from, to },
    });
  }, []);

  // Close autocomplete
  const closeAutocomplete = useCallback(() => {
    setState({
      isOpen: false,
      query: '',
      position: { top: 0, left: 0 },
      range: null,
    });
  }, []);

  // Handle card selection
  const handleSelect = useCallback(
    (card: Card | null, insertWikiLink: (title: string, cardId: string | null) => void) => {
      if (card) {
        // Insert link to existing card
        insertWikiLink(card.title, card.id);
      } else if (state.query) {
        // Create new card with this title (ghost link for now)
        insertWikiLink(state.query, null);
      }
      closeAutocomplete();
    },
    [state.query, closeAutocomplete]
  );

  return {
    autocomplete: state,
    setEditorElement,
    detectWikiLink,
    openAutocomplete,
    closeAutocomplete,
    handleSelect,
  };
}
