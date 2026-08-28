'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth.schema';
import { customerAuthService } from '@/services/api';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [devResetPath, setDevResetPath] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setMessage(null);
    setDevResetPath(null);
    try {
      const result = await customerAuthService.forgotPassword(values);
      setMessage(result.message);
      if (result.devResetPath) {
        setDevResetPath(result.devResetPath);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Request failed');
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

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {devResetPath ? (
        <p className="text-muted-foreground text-sm">
          Dev reset link:{' '}
          <Link href={devResetPath} className="text-primary hover:underline">
            {devResetPath}
          </Link>
        </p>
      ) : null}
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send reset link'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
