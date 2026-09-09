'use client';

import { useCallback } from 'react';
import { PdfViewDownloadActions } from '@/components/shared/pdf-view-download-actions';
import { ordersService } from '@/services/api';
import { saveBlobFile } from '@/lib/save-blob';

export async function saveChallanPdf(orderNumber: string) {
  const file = await ordersService.downloadChallanPdf(orderNumber);
  const blob =
    file.blob.type === 'application/pdf'
      ? file.blob
      : new Blob([file.blob], { type: 'application/pdf' });
  saveBlobFile(blob, file.filename);
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
  const loadPreview = useCallback(async () => {
    const file = await ordersService.downloadChallanPdf(orderNumber, { inline: true });
    return file.blob;
  }, [orderNumber]);

  const onDownload = useCallback(async () => {
    await saveChallanPdf(orderNumber);
  }, [orderNumber]);

  return (
    <PdfViewDownloadActions
      title="View challan"
      description={`Review delivery challan for ${orderNumber} on screen. Use Download if you want to save a copy.`}
      downloadLabel={label}
      variant={variant}
      size={size}
      loadPreview={loadPreview}
      onDownload={onDownload}
    />
  );
}
