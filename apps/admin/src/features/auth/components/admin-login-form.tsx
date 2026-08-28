'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { adminAuthService } from '@/services/api';
import { useStaffAuthStore } from '@/store/staff-auth-store';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { ADMIN_DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useStaffAuthStore((state) => state.setUser);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin123!',
      rememberMe: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await adminAuthService.login(values);
      setUser(result.user);
      const next = searchParams.get('next') || ADMIN_DEFAULT_LOGIN_REDIRECT;
      router.replace(next);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email}
        {...register('email')}
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password}
        {...register('password')}
      />

      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Staff accounts are created by a Super Admin in{' '}
        <span className="text-foreground font-medium">Admin → Users</span>.
      </p>
    </form>
  );
}
