import { apiClient } from '@/lib/axios';
import type { LedgerEntry } from '@/types/enterprise';
import type { ApiSuccessResponse } from '@/types/api';

export const ledgerEntriesService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ entries: LedgerEntry[] }>>('/ledger-entries');
    return data.data.entries;
  },

  async create(payload: {
    date?: string;
    account: string;
    description: string;
    debit?: number;
    credit?: number;
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ entry: LedgerEntry }>>(
      '/ledger-entries',
      payload,
    );
    return data.data.entry;
  },
};
