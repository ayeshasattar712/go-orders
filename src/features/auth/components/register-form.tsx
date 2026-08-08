'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/schemas/auth.schema';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/auth-store';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: undefined as unknown as true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await authService.register(values);
      setUser(result.user);
      router.replace(DEFAULT_LOGIN_REDIRECT);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to register');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" error={errors.firstName} {...register('firstName')} />
        <FormField label="Last name" error={errors.lastName} {...register('lastName')} />
      </div>
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
        autoComplete="new-password"
        error={errors.password}
        {...register('password')}
      />
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword}
        {...register('confirmPassword')}
      />

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1 rounded border" {...register('acceptTerms')} />
        <span>I accept the terms and privacy policy</span>
      </label>
      {errors.acceptTerms?.message ? (
        <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
      ) : null}

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
