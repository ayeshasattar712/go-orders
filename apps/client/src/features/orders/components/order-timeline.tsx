import { Check, Circle, Truck } from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import type { OrderTimelineStep } from '@/types/catalog';

export function OrderTimeline({ steps }: { steps: OrderTimelineStep[] }) {
  const currentIndex = [...steps].reverse().findIndex((step) => step.timestamp !== null);
  const activeIndex = currentIndex === -1 ? -1 : steps.length - 1 - currentIndex;

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isDone = step.timestamp !== null;
        const isCurrent = index === activeIndex;
        return (
          <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
            {index < steps.length - 1 ? (
              <span
                className={cn(
                  'absolute top-8 left-[15px] h-full w-0.5',
                  isDone ? 'bg-primary' : 'bg-border',
                )}
              />
            ) : null}
            <span
              className={cn(
                'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                isDone
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground',
                isCurrent && 'ring-primary/15 ring-4',
              )}
            >
              {isDone ? (
                isCurrent ? (
                  <Truck className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )
              ) : (
                <Circle className="h-2.5 w-2.5 fill-current" />
              )}
            </span>
            <div className="pt-1">
              <p className={cn('font-medium', !isDone && 'text-muted-foreground')}>{step.label}</p>
              <p className="text-muted-foreground text-sm">{step.description}</p>
              {step.timestamp ? (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {formatDateTime(step.timestamp)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
