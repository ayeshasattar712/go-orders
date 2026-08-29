import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '@/services/api';
import type { Client } from '@/types/admin';

export const clientKeys = {
  all: ['clients'] as const,
  list: () => [...clientKeys.all, 'list'] as const,
};

export function useClients() {
  return useQuery({
    queryKey: clientKeys.list(),
    queryFn: () => clientsService.list(),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.all }),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      status?: Client['status'];
      creditLimit?: number;
      creditFrozen?: boolean;
      creditTerms?: Client['creditTerms'];
    }) => clientsService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.all }),
  });
}
