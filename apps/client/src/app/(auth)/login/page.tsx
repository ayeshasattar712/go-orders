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
    <AuthLayout
      title="Customer sign in"
      description="Sign in to shop, track orders, and manage your account."
    >
      <LoginForm nextPath={next} />
    </AuthLayout>
  );
}
