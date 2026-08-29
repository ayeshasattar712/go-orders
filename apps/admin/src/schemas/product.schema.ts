import { z } from 'zod';

const bulkPriceTierSchema = z.object({
  minQty: z.number().int().positive(),
  maxQty: z.number().int().positive().nullable(),
  price: z.number().nonnegative(),
});

const specificationSchema = z.object({
  label: z.string().trim().min(1).max(100),
  value: z.string().trim().min(1).max(300),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(220).optional(),
  shortDescription: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(5000),
  images: z.array(z.string().trim().min(1).max(2000)).min(1).max(10),
  categoryId: z.string().trim().min(1),
  vendorId: z.string().trim().min(1),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  currency: z.string().trim().length(3).default('PKR'),
  stock: z.number().int().nonnegative(),
  stockStatus: z.enum(['in-stock', 'low-stock', 'out-of-stock', 'preorder']),
  sku: z.string().trim().min(1).max(60),
  unit: z.string().trim().min(1).max(60),
  minOrderQty: z.number().int().positive(),
  bulkPricing: z.array(bulkPriceTierSchema).max(10).default([]),
  specifications: z.array(specificationSchema).max(30).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  isBestSeller: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isNew: z.boolean().optional(),
  deliveryEstimateDays: z.number().int().nonnegative(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
