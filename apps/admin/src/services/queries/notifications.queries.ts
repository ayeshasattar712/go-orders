import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '@/services/api';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationsService.list(),
  });
}
