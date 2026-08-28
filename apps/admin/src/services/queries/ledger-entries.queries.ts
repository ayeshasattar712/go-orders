import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ledgerEntriesService } from '@/services/api';

export const ledgerEntryKeys = {
  all: ['ledger-entries'] as const,
  list: () => [...ledgerEntryKeys.all, 'list'] as const,
};

export function useLedgerEntries() {
  return useQuery({
    queryKey: ledgerEntryKeys.list(),
    queryFn: () => ledgerEntriesService.list(),
  });
}

export function useCreateLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ledgerEntriesService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ledgerEntryKeys.all }),
  });
}
