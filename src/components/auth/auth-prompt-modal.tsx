'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/schemas/auth.schema';
import { customerAuthService } from '@/services/api';
import { useCustomerAuthStore } from '@/store/customer-auth-store';
import { useAuthPromptStore } from '@/store/auth-prompt-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormField } from '@/components/forms/form-field';
import { Button } from '@/components/ui/button';

function MiniLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const setUser = useCustomerAuthStore((state) => state.setUser);
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await customerAuthService.login(values);
      setUser(result.user);
      router.refresh();
      onSuccess();
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
      <p className="text-muted-foreground text-center text-xs">
        Demo: user@example.com / User1234!
      </p>
    </form>
  );
}

function MiniRegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const setUser = useCustomerAuthStore((state) => state.setUser);
  const router = useRouter();
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
      const result = await customerAuthService.register(values);
      setUser(result.user);
      router.refresh();
      onSuccess();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create account');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
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
      <label className="text-muted-foreground flex items-start gap-2 text-xs">
        <input type="checkbox" className="mt-0.5 rounded border" {...register('acceptTerms')} />
        <span>I accept the terms and privacy policy</span>
      </label>
      {errors.acceptTerms?.message ? (
        <p className="text-destructive text-sm">{errors.acceptTerms.message}</p>
      ) : null}
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}

export function AuthPromptModal() {
  const isOpen = useAuthPromptStore((state) => state.isOpen);
  const reason = useAuthPromptStore((state) => state.reason);
  const tab = useAuthPromptStore((state) => state.tab);
  const close = useAuthPromptStore((state) => state.close);
  const setTab = useAuthPromptStore((state) => state.setTab);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="bg-primary/10 text-primary mx-auto flex h-11 w-11 items-center justify-center rounded-full">
            <Lock className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Sign in to continue</DialogTitle>
          <DialogDescription className="text-center">
            {reason || 'Please sign in or create a free account to continue.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(value) => setTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign in</TabsTrigger>
            <TabsTrigger value="register">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="pt-4">
            <MiniLoginForm onSuccess={close} />
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <MiniRegisterForm onSuccess={close} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
