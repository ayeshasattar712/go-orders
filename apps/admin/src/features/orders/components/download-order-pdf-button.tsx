'use client';

import { useCallback } from 'react';
import { PdfViewDownloadActions } from '@/components/shared/pdf-view-download-actions';
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
  const loadPreview = useCallback(async () => {
    const file = await ordersService.downloadPdf(orderNumber, { inline: true });
    return file.blob;
  }, [orderNumber]);

  const onDownload = useCallback(async () => {
    const file = await ordersService.downloadPdf(orderNumber);
    const blob =
      file.blob.type === 'application/pdf'
        ? file.blob
        : new Blob([file.blob], { type: 'application/pdf' });
    saveBlobFile(blob, file.filename);
  }, [orderNumber]);

  return (
    <PdfViewDownloadActions
      title="View order"
      description={`Review order ${orderNumber} on screen. Use Download if you want to save a copy.`}
      downloadLabel="PDF"
      variant={variant}
      size={size}
      loadPreview={loadPreview}
      onDownload={onDownload}
    />
  );
}
