import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@/services/api';
import { invoiceKeys } from './invoices.queries';
import { ledgerEntryKeys } from './ledger-entries.queries';
import { clientKeys } from './clients.queries';
import type { ReceivedPayment } from '@/types/enterprise';

export const paymentKeys = {
  all: ['payments'] as const,
  list: () => [...paymentKeys.all, 'list'] as const,
};

export function usePayments() {
  return useQuery({
    queryKey: paymentKeys.list(),
    queryFn: () => paymentsService.list(),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReceivedPayment['status'] }) =>
      paymentsService.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: ledgerEntryKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
