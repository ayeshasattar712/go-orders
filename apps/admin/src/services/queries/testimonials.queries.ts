import { useQuery } from '@tanstack/react-query';
import { testimonialsService } from '@/services/api';

export const testimonialKeys = {
  all: ['testimonials'] as const,
  list: () => [...testimonialKeys.all, 'list'] as const,
};

export function useTestimonials() {
  return useQuery({
    queryKey: testimonialKeys.list(),
    queryFn: () => testimonialsService.list(),
  });
}
