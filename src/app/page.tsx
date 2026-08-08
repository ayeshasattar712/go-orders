import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { clientEnv } from '@/lib/env';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_55%)]" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Enterprise Boilerplate
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Production-ready Next.js App Router foundation with JWT auth, refresh tokens, RBAC,
          secure headers, and scalable feature architecture.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Create account</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Demo: <code>admin@example.com</code> / <code>Admin123!</code>
        </p>
      </div>
    </main>
  );
}
