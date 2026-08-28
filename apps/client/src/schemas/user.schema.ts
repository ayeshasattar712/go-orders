import { z } from 'zod';
import { ROLES } from '@/constants/roles';

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(255),
});

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  role: z
    .enum([
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.FINANCE_MANAGER,
      ROLES.PROCUREMENT_MANAGER,
      ROLES.INVENTORY_MANAGER,
      ROLES.SALES_MANAGER,
      ROLES.MANAGER,
      ROLES.USER,
      ROLES.VIEWER,
    ])
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
