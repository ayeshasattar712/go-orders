import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  label: string;
}

export function CheckoutStepper({ steps, activeIndex }: { steps: Step[]; activeIndex: number }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-2 sm:gap-4">
      {steps.map((step, index) => {
        const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming';
        return (
          <li key={step.id} className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                state === 'done' && 'border-primary bg-primary text-primary-foreground',
                state === 'active' && 'border-primary text-primary',
                state === 'upcoming' && 'border-border text-muted-foreground',
              )}
            >
              {state === 'done' ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-sm font-medium',
                state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 ? <span className="bg-border mx-1 h-px w-8 sm:w-12" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
