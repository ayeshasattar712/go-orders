import Image from 'next/image';
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
  logo,
  className,
  textClassName,
}: {
  name: string;
  logo?: string;
  className?: string;
  textClassName?: string;
}) {
  if (logo) {
    return (
      <div className={cn('relative overflow-hidden bg-white', className)}>
        <Image src={logo} alt="" fill className="object-cover" sizes="64px" />
      </div>
    );
  }

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
