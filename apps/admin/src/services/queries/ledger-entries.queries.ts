import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ledgerEntriesService } from '@/services/api';
import type { LedgerEntry } from '@/types/enterprise';

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
    onSuccess: (entry) => {
      queryClient.setQueryData<LedgerEntry[]>(ledgerEntryKeys.list(), (current = []) => [
        entry,
        ...current,
      ]);
      queryClient.invalidateQueries({ queryKey: ledgerEntryKeys.all });
    },
  });
}
