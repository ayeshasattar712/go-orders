'use client';

import type { Permission } from '@/constants/roles';
import { hasPermission } from '@/lib/permissions';
import { useCustomerAuthStore } from '@/store/customer-auth-store';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const user = useCustomerAuthStore((state) => state.user);
  if (!hasPermission(user, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
