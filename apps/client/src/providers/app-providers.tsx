'use client';

import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * Surface-agnostic providers only (theme, query client, tooltips) — mounted
 * once at the root layout for every route. Session state is deliberately
 * NOT provided here: CustomerAuthProvider and StaffAuthProvider are mounted
 * separately by each surface's own layout so customer and admin pages never
 * share a session provider tree.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
