'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ordersService } from '@/services/api';
import { saveBlobFile } from '@/lib/save-blob';

export function DownloadOrderPdfButton({
  orderNumber,
  variant = 'ghost',
  size = 'sm',
}: {
  orderNumber: string;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'default';
}) {
  const [pending, setPending] = useState(false);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPending(true);
    try {
      const file = await ordersService.downloadPdf(orderNumber);
      saveBlobFile(file.blob, file.filename);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" size={size} variant={variant} disabled={pending} onClick={handleClick}>
      <Download className="h-3.5 w-3.5" />
      {pending ? 'Saving...' : 'PDF'}
    </Button>
  );
}
