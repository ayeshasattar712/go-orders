import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/api';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => usersService.list(),
  });
}
