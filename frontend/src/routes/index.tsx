import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getCards, createCard, deleteCard, getConfig } from '../lib/api';
import type { CreateCardInput } from '../lib/types';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [selectedType, setSelectedType] = useState('note');

  // Fetch config for card types
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: getConfig,
  });

  // Fetch all cards
  const { data: cards, isLoading, error } = useQuery({
    queryKey: ['cards'],
    queryFn: () => getCards(),
  });

  // Create card mutation
  const createMutation = useMutation({
    mutationFn: (input: CreateCardInput) => createCard(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setIsCreating(false);
      setNewCardTitle('');
    },
  });

  // Delete card mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });

  const handleCreate = () => {
    if (!newCardTitle.trim()) return;

    createMutation.mutate({
      title: newCardTitle,
      cardType: selectedType,
      content: '',
    });
  };

  if (isLoading) {
    return <div className="loading">Loading cards...</div>;
  }

  if (error) {
    return <div className="error">Error loading cards: {(error as Error).message}</div>;
  }

  return (
    <div style={{ flex: 1, padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>All Cards</h2>
        <button className="primary" onClick={() => setIsCreating(true)}>
          New Card
        </button>
      </div>

      {isCreating && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create New Card</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Title
            </label>
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Card title..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                fontSize: '1rem',
              }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                fontSize: '1rem',
              }}
            >
              {config?.cardTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="primary" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => {
              setIsCreating(false);
              setNewCardTitle('');
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {cards && cards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <p>No cards yet. Create your first card to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {cards?.map((card) => (
            <div key={card.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{card.title}</h3>
                  <span className="card-type">{card.cardType}</span>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(card.id)}
                  disabled={deleteMutation.isPending}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Delete
                </button>
              </div>
              {card.content && (
                <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                  {card.content.substring(0, 150)}
                  {card.content.length > 150 ? '...' : ''}
                </div>
              )}
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                Created: {new Date(card.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
