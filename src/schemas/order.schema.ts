import { z } from 'zod';

export const createOrderItemSchema = z.object({
  productId: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200),
  image: z.string().min(1).max(2000),
  quantity: z.number().int().positive().max(10_000),
  price: z.number().nonnegative(),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1, 'Cart is empty'),
  vendorName: z.string().min(1).max(200),
  shipping: z.number().nonnegative().max(10_000),
  tax: z.number().nonnegative().max(1_000_000),
});

export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
