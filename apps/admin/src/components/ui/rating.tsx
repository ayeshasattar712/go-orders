import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function Rating({ value, count, size = 'md', showValue = false, className }: RatingProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index + 1 <= Math.round(value);
          return (
            <Star
              key={index}
              className={cn(
                sizeMap[size],
                filled ? 'fill-warning text-warning' : 'fill-muted text-muted',
              )}
            />
          );
        })}
      </div>
      {showValue ? <span className="text-sm font-medium">{value.toFixed(1)}</span> : null}
      {count !== undefined ? (
        <span className="text-muted-foreground text-sm">({count.toLocaleString()})</span>
      ) : null}
    </div>
  );
}
