'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium',
    'transition-[color,background-color,box-shadow,opacity,filter] duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'will-change-transform select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        brand: 'bg-accent-brand text-accent-brand-foreground shadow-sm hover:bg-accent-brand/90',
        gradient: 'bg-hero-gradient text-white shadow-lg shadow-primary/35 hover:opacity-90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-full px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...(props as React.HTMLAttributes<HTMLElement>)}>
          {children}
        </Slot>
      );
    }

    const animatePress = !disabled && variant !== 'link';

    return (
      <motion.button
        className={classes}
        ref={ref}
        disabled={disabled}
        whileHover={animatePress ? { scale: 1.03, y: -1 } : undefined}
        whileTap={animatePress ? { scale: 0.92, y: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 520, damping: 22, mass: 0.6 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
