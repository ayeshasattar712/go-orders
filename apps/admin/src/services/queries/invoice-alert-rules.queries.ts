import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoiceAlertRulesService } from '@/services/api';

export const invoiceAlertRuleKeys = {
  all: ['invoice-alert-rules'] as const,
  list: () => [...invoiceAlertRuleKeys.all, 'list'] as const,
};

export function useInvoiceAlertRules() {
  return useQuery({
    queryKey: invoiceAlertRuleKeys.list(),
    queryFn: () => invoiceAlertRulesService.list(),
  });
}

export function useToggleInvoiceAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      invoiceAlertRulesService.update(id, { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceAlertRuleKeys.all }),
  });
}
