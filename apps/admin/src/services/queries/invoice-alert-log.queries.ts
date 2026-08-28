import { useQuery } from '@tanstack/react-query';
import { invoiceAlertLogService } from '@/services/api';

export const invoiceAlertLogKeys = {
  all: ['invoice-alert-log'] as const,
  list: () => [...invoiceAlertLogKeys.all, 'list'] as const,
};

export function useInvoiceAlertLog() {
  return useQuery({
    queryKey: invoiceAlertLogKeys.list(),
    queryFn: () => invoiceAlertLogService.list(),
  });
}
