'use client';

import type { FieldError } from 'react-hook-form';
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
  ...props
}: FormFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        className={cn(error && 'border-destructive focus-visible:ring-destructive', className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error?.message ? <p className="text-sm text-destructive">{error.message}</p> : null}
    </div>
  );
}
