import { apiClient } from '@/lib/axios';
import type { InvoiceAlertLogEntry } from '@/types/admin';
import type { ApiSuccessResponse } from '@/types/api';

export const invoiceAlertLogService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ logs: InvoiceAlertLogEntry[] }>>(
        '/invoice-alert-log',
      );
    return data.data.logs;
  },
};
