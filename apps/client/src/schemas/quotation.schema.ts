import { z } from 'zod';

export const createQuotationSchema = z.object({
  productId: z.string().min(1).max(100).optional(),
  productName: z.string().trim().min(1).max(200),
  quantity: z.number().int().positive().max(100_000),
  unit: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(1000).optional(),
  estimatedTotal: z.number().nonnegative().max(100_000_000).optional(),
  vendorId: z.string().min(1).max(100).optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
