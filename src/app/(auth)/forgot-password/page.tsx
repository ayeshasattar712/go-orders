import type { Metadata } from 'next';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot password',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we will send reset instructions."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
