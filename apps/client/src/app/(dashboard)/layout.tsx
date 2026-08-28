import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layouts/dashboard-shell';
import { CustomerAuthProvider } from '@/providers/customer-auth-provider';
import { getCustomerSession } from '@/lib/auth/customer-auth';
import { CUSTOMER_DEFAULT_LOGOUT_REDIRECT } from '@/constants/routes';

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await getCustomerSession();
  if (!session) {
    redirect(CUSTOMER_DEFAULT_LOGOUT_REDIRECT);
  }

  return (
    <CustomerAuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </CustomerAuthProvider>
  );
}
