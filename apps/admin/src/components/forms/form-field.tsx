'use client';

import { useState } from 'react';
import type { FieldError } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  containerClassName?: string;
}

export function FormField({
  label,
  error,
  id,
  containerClassName,
  className,
  type,
  ...props
}: FormFieldProps) {
  const fieldId = id ?? props.name;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <div className="relative">
        <Input
          id={fieldId}
          type={isPassword ? (visible ? 'text' : 'password') : type}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            isPassword && 'pr-10',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {error?.message ? <p className="text-destructive text-sm">{error.message}</p> : null}
    </div>
  );
}
