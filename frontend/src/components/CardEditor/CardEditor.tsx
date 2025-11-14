import { useState, useEffect, useCallback } from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { useTreeStore } from '../../stores/treeStore';
import { useCard, useUpdateCard } from '../../hooks/useCards';
import { useAutosave } from '../../hooks/useAutosave';
import { SaveIndicator, type SaveStatus } from './SaveIndicator';
import { CardHeader } from './CardHeader';
import { LoadingSkeleton } from '../LoadingSkeleton/LoadingSkeleton';
import { WikiLinkModal } from './WikiLinkModal';
import './CardEditor.css';
import './CardHeader.css';
import './WikiLinkModal.css';

function EditorComponent() {
  const { selectedId } = useTreeStore();
  const { data: card, isLoading } = useCard(selectedId || undefined);
  const updateCard = useUpdateCard();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showWikiLinkModal, setShowWikiLinkModal] = useState(false);

  // Update local state when card changes
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setContent(card.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [card]);

  // Autosave content
  useAutosave({
    value: content,
    onSave: useCallback((newContent: string) => {
      if (!selectedId || !card) return;
      if (newContent === card.content) return;

      setSaveStatus('saving');
      updateCard.mutate(
        { id: selectedId, data: { content: newContent } },
        {
          onSuccess: () => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
          },
          onError: () => {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
          },
        }
      );
    }, [selectedId, card, updateCard]),
    delay: 2000,
    enabled: !!selectedId && !!card,
  });

  // Autosave title
  useAutosave({
    value: title,
    onSave: useCallback((newTitle: string) => {
      if (!selectedId || !card) return;
      if (newTitle === card.title) return;

      updateCard.mutate(
        { id: selectedId, data: { title: newTitle } },
        {
          onError: () => {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
          },
        }
      );
    }, [selectedId, card, updateCard]),
    delay: 1000,
    enabled: !!selectedId && !!card,
  });

  // Insert wiki link into editor
  const insertWikiLink = useCallback((linkTitle: string, targetCardId: string) => {
    // Insert markdown link at cursor position
    const linkText = `[${linkTitle}](/cards/${targetCardId})`;

    // Append to content for now (cursor position tracking would require ProseMirror integration)
    setContent((prev) => {
      const trimmed = prev.trim();
      if (trimmed) {
        return `${trimmed}\n\n${linkText}`;
      }
      return linkText;
    });
  }, []);

  // Create Milkdown editor
  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, content);
        ctx.get(listenerCtx).updated((_ctx, doc, prevDoc) => {
          const markdown = doc.toString();
          if (markdown !== content && markdown !== prevDoc?.toString()) {
            setContent(markdown);
          }
        });
      })
      .use(commonmark)
      .use(listener)
  );

  // Update editor content when card changes
  useEffect(() => {
    if (!get()) return;

    const editor = get();
    if (!editor) return;

    // For now, we'll let the editor update through defaultValueCtx
    // More sophisticated sync can be added later if needed
  }, [content, get]);

  // Keyboard shortcut for wiki link modal (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && selectedId) {
        e.preventDefault();
        setShowWikiLinkModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  if (!selectedId) {
    return (
      <div className="card-editor">
        <div className="editor-empty-state">
          <p>No card selected</p>
          <p className="hint-text">Select a card from the tree to edit</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card-editor">
        <LoadingSkeleton variant="editor" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="card-editor">
        <div className="editor-empty-state">
          <p>Card not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-editor">
      <CardHeader card={card} />
      <div className="editor-header">
        <input
          type="text"
          className="card-title-input"
          placeholder="Card title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="editor-actions">
          <button
            className="wiki-link-btn"
            onClick={() => setShowWikiLinkModal(true)}
            title="Insert Link (Cmd+K)"
          >
            🔗
          </button>
          <SaveIndicator status={saveStatus} />
        </div>
      </div>
      <div className="editor-content">
        <Milkdown />
      </div>

      {showWikiLinkModal && selectedId && (
        <WikiLinkModal
          sourceCardId={selectedId}
          onInsert={insertWikiLink}
          onClose={() => setShowWikiLinkModal(false)}
        />
      )}
    </div>
  );
}

export function CardEditor() {
  return (
    <MilkdownProvider>
      <EditorComponent />
    </MilkdownProvider>
  );
}
