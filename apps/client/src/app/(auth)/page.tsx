import type { Metadata } from 'next';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Create account',
};

/** Base URL (/) — customer signup. Logged-in customers are redirected to /home by middleware. */
export default function CustomerSignupPage() {
  return (
    <AuthLayout
      title="Create your customer account"
      description="Sign up to browse the catalog, add items to your cart, and place orders."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
