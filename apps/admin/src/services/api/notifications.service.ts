import { apiClient } from '@/lib/axios';
import type { AppNotification } from '@/types/admin';
import type { ApiSuccessResponse } from '@/types/api';

export const notificationsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ notifications: AppNotification[] }>>(
        '/notifications',
      );
    return data.data.notifications;
  },
};
