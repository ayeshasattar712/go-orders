import { cn } from '@/lib/utils';

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function VendorAvatar({
  name,
  className,
  textClassName,
}: {
  name: string;
  className?: string;
  textClassName?: string;
}) {
  return (
    <div
      className={cn(
        'bg-primary/10 text-primary flex items-center justify-center font-bold',
        className,
      )}
      aria-hidden
    >
      <span className={cn('leading-none', textClassName)}>{initialsFromName(name)}</span>
    </div>
  );
}
