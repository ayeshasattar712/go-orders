import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesService } from '@/services/api';
import { clientKeys } from './clients.queries';
import { ledgerEntryKeys } from './ledger-entries.queries';
import type { Invoice } from '@/types/enterprise';

export const invoiceKeys = {
  all: ['invoices'] as const,
  list: () => [...invoiceKeys.all, 'list'] as const,
};

export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.list(),
    queryFn: () => invoicesService.list(),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: ledgerEntryKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      status?: Invoice['status'];
      amountPaid?: number;
    }) => invoicesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: ledgerEntryKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
