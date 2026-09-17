'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
      <div className="flex min-w-0 items-start gap-3">
        <span className="bg-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
          <Mail className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold tracking-wide">Newsletter</h4>
          <p className="mt-1 text-sm leading-relaxed text-white/60">
            New arrivals, flash deals, and procurement tips — no spam.
          </p>
        </div>
      </div>

      {done ? (
        <p className="text-sm font-medium text-emerald-300 sm:shrink-0">
          Thanks — you are subscribed.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-center"
        >
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="h-11 rounded-full border-white/15 bg-white/10 text-white placeholder:text-white/40"
          />
          <Button type="submit" className="h-11 shrink-0 rounded-full px-6">
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
}
