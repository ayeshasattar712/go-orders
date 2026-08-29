import { z } from 'zod';
import { ROLES } from '@/constants/roles';
import { CREDIT_TERMS } from '@/constants/credit-terms';

const optionalEmail = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().email().max(255).optional(),
);

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

/** Super Admin creates staff accounts inside /admin/users (no public admin signup). */
export const createStaffSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: optionalEmail,
  password: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().min(8).max(128).optional(),
  ),
  role: z.enum([
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.FINANCE_MANAGER,
    ROLES.PROCUREMENT_MANAGER,
    ROLES.INVENTORY_MANAGER,
    ROLES.SALES_MANAGER,
    ROLES.MANAGER,
    ROLES.VIEWER,
  ]),
});

export const createClientLoginSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  companyName: z.string().trim().min(1).max(120),
  email: optionalEmail,
  phone: z.string().trim().max(40).optional(),
  creditLimit: z.number().min(0).optional(),
  creditTerms: z
    .enum([
      CREDIT_TERMS.COD,
      CREDIT_TERMS.PREPAID,
      CREDIT_TERMS.NET_15,
      CREDIT_TERMS.NET_30,
      CREDIT_TERMS.NET_45,
      CREDIT_TERMS.NET_60,
    ])
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type CreateClientLoginInput = z.infer<typeof createClientLoginSchema>;
