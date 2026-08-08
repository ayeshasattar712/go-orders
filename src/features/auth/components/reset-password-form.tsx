'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth.schema';
import { authService } from '@/services/api';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authService.resetPassword(values);
      router.replace('/login?reset=success');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to reset password');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" {...register('token')} />
      <FormField
        label="New password"
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

      {errors.token?.message ? (
        <p className="text-sm text-destructive">{errors.token.message}</p>
      ) : null}
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
        {isSubmitting ? 'Updating...' : 'Reset password'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
