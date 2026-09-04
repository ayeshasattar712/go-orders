import Link from 'next/link';
import { Boxes } from 'lucide-react';
import { clientEnv } from '@/lib/env';

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-navy-glow flex min-h-screen flex-col items-center justify-center px-4 text-white">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-2xl font-semibold tracking-tight"
        >
          <span className="bg-hero-gradient shadow-primary/35 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg">
            <Boxes className="h-5 w-5" />
          </span>
          <span className="font-display">{clientEnv.NEXT_PUBLIC_APP_NAME}</span>
        </Link>
        <p className="text-primary mt-3 text-xs font-semibold tracking-[0.24em] uppercase">
          Staff control panel
        </p>
      </div>
      <div className="text-foreground w-full max-w-md rounded-3xl border border-white/10 bg-white p-5 shadow-2xl sm:p-8">
        <div className="mb-6 space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
