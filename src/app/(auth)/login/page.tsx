import type { Metadata } from 'next';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthLayout title="Welcome back" description="Sign in to access your secure workspace.">
      <LoginForm nextPath={next} />
    </AuthLayout>
  );
}
