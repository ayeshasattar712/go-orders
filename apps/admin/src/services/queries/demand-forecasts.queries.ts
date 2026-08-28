import { useQuery } from '@tanstack/react-query';
import { demandForecastsService } from '@/services/api';

export const demandForecastKeys = {
  all: ['demand-forecasts'] as const,
  list: () => [...demandForecastKeys.all, 'list'] as const,
};

export function useDemandForecasts() {
  return useQuery({
    queryKey: demandForecastKeys.list(),
    queryFn: () => demandForecastsService.list(),
  });
}
