import Link from 'next/link';
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
    <div className="via-background to-background flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100 px-4 dark:from-orange-950/40">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
          <span className="bg-hero-gradient flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold text-white">
            GO
          </span>
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </Link>
      </div>
      <div className="bg-card shadow-primary/10 w-full max-w-md rounded-2xl border p-8 shadow-lg">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
