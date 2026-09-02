'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { customerAuthService } from '@/services/api';
import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { CUSTOMER_DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';

function safeNextPath(nextPath: string | undefined) {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return CUSTOMER_DEFAULT_LOGIN_REDIRECT;
  }
  return nextPath;
}

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const setUser = useCustomerAuthStore((state) => state.setUser);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'user@example.com',
      password: 'User1234!',
      rememberMe: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await customerAuthService.login(values);
      setUser(result.user);
      router.replace(safeNextPath(nextPath));
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

      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        No account?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
