import { apiClient } from '@/lib/axios';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@/schemas/auth.schema';
import type { AuthResponse, User } from '@/types/auth';
import type { ApiSuccessResponse } from '@/types/api';

export const customerAuthService = {
  async login(payload: LoginInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      '/auth/customer/login',
      payload,
    );
    return data.data;
  },

  async register(payload: RegisterInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      '/auth/customer/register',
      payload,
    );
    return data.data;
  },

  async logout() {
    await apiClient.post('/auth/customer/logout');
  },

  async me() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ user: User }>>('/auth/customer/me');
    return data.data.user;
  },

  async forgotPassword(payload: ForgotPasswordInput) {
    const { data } = await apiClient.post<
      ApiSuccessResponse<{ message: string; devResetPath?: string }>
    >('/auth/forgot-password', payload);
    return data.data;
  },

  async resetPassword(payload: ResetPasswordInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ message: string }>>(
      '/auth/reset-password',
      payload,
    );
    return data.data;
  },
};
