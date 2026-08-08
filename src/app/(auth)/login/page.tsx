import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';
import { Loader } from '@/components/ui/loader';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to access your secure workspace.">
      <Suspense fallback={<Loader />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
