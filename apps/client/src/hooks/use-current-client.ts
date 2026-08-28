'use client';

import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { useAdminStore } from '@/store/admin-store';

/**
 * Resolves the admin-managed Client record (credit, invoices, quotations)
 * associated with the currently authenticated customer's email.
 */
export function useCurrentClient() {
  const user = useCustomerAuthStore((state) => state.user);
  return useAdminStore((state) =>
    user
      ? state.clients.find((client) => client.email.toLowerCase() === user.email.toLowerCase())
      : undefined,
  );
}
