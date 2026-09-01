import { redirect } from 'next/navigation';
import { WorkspaceShell } from '@/components/layouts/workspace-shell';
import { StaffAuthProvider } from '@/providers/staff-auth-provider';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { hasPermission } from '@/lib/permissions';
import { PERMISSIONS } from '@/constants/roles';
import { ADMIN_DEFAULT_LOGOUT_REDIRECT } from '@/constants/routes';

export const dynamic = 'force-dynamic';

/**
 * Single shared layout for the entire staff/admin surface (admin/* plus the
 * former (workspace) modules — procurement, inventory, delivery, accounting,
 * crm, ai-forecasting, assets, tenders, bi). Previously admin/layout.tsx and
 * (workspace)/layout.tsx were byte-identical and neither did a server-side
 * check; this does the real check once, in one place, as defense in depth
 * behind the middleware gate.
 */
export default async function StaffGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session || !hasPermission(session, PERMISSIONS.ADMIN_ACCESS)) {
    redirect(ADMIN_DEFAULT_LOGOUT_REDIRECT);
  }

  return (
    <StaffAuthProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </StaffAuthProvider>
  );
}
