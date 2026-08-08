'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/auth-store';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
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
      const result = await authService.login(values);
      setUser(result.user);
      const next = searchParams.get('next') || DEFAULT_LOGIN_REDIRECT;
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

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border" {...register('rememberMe')} />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
