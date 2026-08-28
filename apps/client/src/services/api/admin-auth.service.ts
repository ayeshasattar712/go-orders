import { apiClient } from '@/lib/axios';
import type { LoginInput } from '@/schemas/auth.schema';
import type { AuthResponse, User } from '@/types/auth';
import type { ApiSuccessResponse } from '@/types/api';

export const adminAuthService = {
  async login(payload: LoginInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      '/auth/admin/login',
      payload,
    );
    return data.data;
  },

  async logout() {
    await apiClient.post('/auth/admin/logout');
  },

  async me() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ user: User }>>('/auth/admin/me');
    return data.data.user;
  },
};
