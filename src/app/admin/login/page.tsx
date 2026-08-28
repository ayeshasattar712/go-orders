import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { AdminLoginForm } from '@/features/auth/components/admin-login-form';
import { Loader } from '@/components/ui/loader';

export const metadata: Metadata = {
  title: 'Admin sign in',
};

export default function AdminLoginPage() {
  return (
    <AuthLayout title="GoOrder Admin" description="Sign in to the staff control panel.">
      <Suspense fallback={<Loader />}>
        <AdminLoginForm />
      </Suspense>
    </AuthLayout>
  );
}
