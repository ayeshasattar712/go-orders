import { apiClient } from '@/lib/axios';
import type { Vendor } from '@/types/catalog';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateVendorInput, UpdateVendorInput } from '@/schemas/vendor.schema';

export const vendorsService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ vendors: Vendor[] }>>('/vendors');
    return data.data.vendors;
  },

  async create(payload: CreateVendorInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ vendor: Vendor }>>(
      '/vendors',
      payload,
    );
    return data.data.vendor;
  },

  async update(id: string, payload: UpdateVendorInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ vendor: Vendor }>>(
      `/vendors/${id}`,
      payload,
    );
    return data.data.vendor;
  },

  async remove(id: string) {
    await apiClient.delete(`/vendors/${id}`);
  },
};
