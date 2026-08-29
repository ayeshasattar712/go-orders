'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ordersService } from '@/services/api';
import { saveBlobFile } from '@/lib/save-blob';

export async function saveChallanPdf(orderNumber: string) {
  const file = await ordersService.downloadChallanPdf(orderNumber);
  saveBlobFile(file.blob, file.filename);
}

export function DownloadChallanPdfButton({
  orderNumber,
  variant = 'outline',
  size = 'sm',
  label = 'Challan PDF',
}: {
  orderNumber: string;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'default';
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPending(true);
    try {
      await saveChallanPdf(orderNumber);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" size={size} variant={variant} disabled={pending} onClick={handleClick}>
      <FileText className="h-3.5 w-3.5" />
      {pending ? 'Saving...' : label}
    </Button>
  );
}
