import { useQuery } from '@tanstack/react-query';
import { supportTicketsService } from '@/services/api';

export const supportTicketKeys = {
  all: ['support-tickets'] as const,
  list: () => [...supportTicketKeys.all, 'list'] as const,
};

export function useSupportTickets() {
  return useQuery({
    queryKey: supportTicketKeys.list(),
    queryFn: () => supportTicketsService.list(),
  });
}
