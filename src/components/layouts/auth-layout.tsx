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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-background to-background px-4 dark:from-slate-900">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </Link>
      </div>
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
