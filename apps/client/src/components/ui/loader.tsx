import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  label?: string;
}

export function Loader({ className, label = 'Loading...' }: LoaderProps) {
  return (
    <div
      className={cn('text-muted-foreground flex items-center justify-center gap-2 py-8', className)}
    >
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
