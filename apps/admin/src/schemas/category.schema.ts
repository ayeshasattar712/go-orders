import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(120).optional(),
  icon: z.string().trim().min(1).max(60),
  image: z.string().trim().min(1).max(2000),
  description: z.string().trim().min(1).max(1000),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
