import type { Metadata } from 'next';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Create account',
};

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your account" description="Start with a secure enterprise-ready workspace.">
      <RegisterForm />
    </AuthLayout>
  );
}
