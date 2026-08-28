import { apiClient } from '@/lib/axios';
import type { Testimonial } from '@/types/catalog';
import type { ApiSuccessResponse } from '@/types/api';

export const testimonialsService = {
  async list() {
    const { data } =
      await apiClient.get<ApiSuccessResponse<{ testimonials: Testimonial[] }>>('/testimonials');
    return data.data.testimonials;
  },
};
