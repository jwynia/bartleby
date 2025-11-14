import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCards, createCard, updateCard, deleteCard, moveCard } from '../lib/api';
import type { Card, CreateCardInput, UpdateCardInput } from '../lib/types';

export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: () => getCards(),
  });
}

export function useCard(id: string | undefined) {
  return useQuery({
    queryKey: ['cards', id],
    queryFn: async () => {
      if (!id) return null;
      const cards = await getCards();
      return cards.find((c) => c.id === id) || null;
    },
    enabled: !!id,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCardInput) => createCard(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardInput }) =>
      updateCard(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cards'] });

      // Snapshot previous value
      const previousCards = queryClient.getQueryData<Card[]>(['cards']);

      // Optimistically update
      if (previousCards) {
        queryClient.setQueryData<Card[]>(
          ['cards'],
          previousCards.map((card) =>
            card.id === id ? { ...card, ...data } : card
          )
        );
      }

      return { previousCards };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCards) {
        queryClient.setQueryData(['cards'], context.previousCards);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, parentId, position }: { id: string; parentId: string | null; position: number }) =>
      moveCard(id, parentId, position),
    onMutate: async ({ id, parentId, position }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cards'] });

      // Snapshot previous value
      const previousCards = queryClient.getQueryData<Card[]>(['cards']);

      // Optimistically update
      if (previousCards) {
        queryClient.setQueryData<Card[]>(
          ['cards'],
          previousCards.map((card) =>
            card.id === id ? { ...card, parentId, position } : card
          )
        );
      }

      return { previousCards };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousCards) {
        queryClient.setQueryData(['cards'], context.previousCards);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}
