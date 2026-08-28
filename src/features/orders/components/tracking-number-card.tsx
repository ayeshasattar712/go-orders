'use client';

import { useState } from 'react';
import { Check, Copy, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TrackingNumberCard({
  trackingNumber,
  carrier,
}: {
  trackingNumber: string;
  carrier: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — ignore silently, tracking number is still visible.
    }
  }

  return (
    <div className="bg-muted/40 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <PackageSearch className="h-4 w-4" />
        </span>
        <div>
          <p className="text-muted-foreground text-xs">Tracking number · {carrier}</p>
          <p className="font-mono text-sm font-semibold">{trackingNumber}</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={handleCopy}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}
