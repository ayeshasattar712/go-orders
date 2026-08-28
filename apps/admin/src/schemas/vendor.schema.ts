import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().trim().min(1).max(150),
  slug: z.string().trim().min(1).max(180).optional(),
  logo: z.string().trim().min(1).max(2000),
  banner: z.string().trim().min(1).max(2000),
  location: z.string().trim().min(1).max(150),
  responseTime: z.string().trim().min(1).max(50),
  certifications: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  categories: z.array(z.string().trim().min(1)).max(20).default([]),
  contactPerson: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(1).max(30),
  address: z.string().trim().min(1).max(300),
});

export const updateVendorSchema = createVendorSchema.partial().extend({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
