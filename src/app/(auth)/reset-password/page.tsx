import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { Loader } from '@/components/ui/loader';

export const metadata: Metadata = {
  title: 'Reset password',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Choose a new password" description="Use a strong password you have not used before.">
      <Suspense fallback={<Loader />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
