import type { Metadata } from 'next';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { AdminLoginForm } from '@/features/auth/components/admin-login-form';

export const metadata: Metadata = {
  title: 'Admin sign in',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthLayout title="GoOrder Admin" description="Sign in to the staff control panel.">
      <AdminLoginForm nextPath={next} />
    </AuthLayout>
  );
}
