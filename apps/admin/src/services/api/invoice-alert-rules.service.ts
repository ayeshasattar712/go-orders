import { apiClient } from '@/lib/axios';
import type { InvoiceAlertRule } from '@/types/admin';
import type { ApiSuccessResponse } from '@/types/api';

export const invoiceAlertRulesService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ rules: InvoiceAlertRule[] }>>(
        '/invoice-alert-rules',
      );
    return data.data.rules;
  },

  async update(id: string, payload: { enabled?: boolean }) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ rule: InvoiceAlertRule }>>(
      `/invoice-alert-rules/${id}`,
      payload,
    );
    return data.data.rule;
  },
};
