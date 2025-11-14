import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLinks, createLink, deleteLink } from '../lib/api';
import type { CreateLinkInput } from '../lib/types';

export function useLinks(cardId?: string) {
  return useQuery({
    queryKey: ['links', cardId],
    queryFn: () => getLinks(cardId ? { cardId } : undefined),
    enabled: !!cardId,
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLinkInput) => createLink(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}
