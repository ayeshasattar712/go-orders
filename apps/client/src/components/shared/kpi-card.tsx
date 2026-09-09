import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  iconTone?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  className?: string;
}

const toneStyles = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-600',
  warning: 'bg-amber-500/10 text-amber-600',
  info: 'bg-sky-500/10 text-sky-600',
  destructive: 'bg-destructive/10 text-destructive',
};

export function KpiCard({
  label,
  value,
  hint,
  delta,
  deltaLabel = 'vs last period',
  icon: Icon,
  iconTone = 'primary',
  className,
}: KpiCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card className={cn('w-full min-w-0 shadow-none', className)}>
      <CardContent className="flex h-full flex-col gap-4 p-5 pt-5 sm:p-5 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              {label}
            </p>
            <p className="text-2xl leading-none font-semibold tracking-tight tabular-nums sm:text-[1.75rem]">
              {value}
            </p>
          </div>
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              toneStyles[iconTone],
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
        </div>

        {hint ? <p className="text-muted-foreground mt-auto text-xs leading-relaxed">{hint}</p> : null}

        {delta !== undefined ? (
          <div className="mt-auto flex items-center gap-1 text-xs">
            <span
              className={cn(
                'flex items-center gap-0.5 font-medium',
                isPositive ? 'text-emerald-600' : 'text-destructive',
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(delta)}%
            </span>
            <span className="text-muted-foreground">{deltaLabel}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
