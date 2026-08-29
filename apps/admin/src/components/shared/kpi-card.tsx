import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  iconTone?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
  className?: string;
}

const toneStyles = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
};

export function KpiCard({
  label,
  value,
  delta,
  deltaLabel = 'vs last period',
  icon: Icon,
  iconTone = 'primary',
  className,
}: KpiCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card className={cn('card-hover', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              toneStyles[iconTone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
        {delta !== undefined ? (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span
              className={cn(
                'flex items-center gap-0.5 font-medium',
                isPositive ? 'text-success' : 'text-destructive',
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
