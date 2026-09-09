'use client';

import { useCallback } from 'react';
import { PdfViewDownloadActions } from '@/components/shared/pdf-view-download-actions';
import { invoicesService } from '@/services/api';
import { saveBlobFile } from '@/lib/save-blob';

export function DownloadInvoicePdfButton({
  invoiceId,
  invoiceNumber,
  variant = 'ghost',
  size = 'sm',
}: {
  invoiceId: string;
  invoiceNumber: string;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'default';
}) {
  const loadPreview = useCallback(async () => {
    const file = await invoicesService.downloadPdf(invoiceId, { inline: true });
    return file.blob;
  }, [invoiceId]);

  const onDownload = useCallback(async () => {
    const file = await invoicesService.downloadPdf(invoiceId);
    const blob =
      file.blob.type === 'application/pdf'
        ? file.blob
        : new Blob([file.blob], { type: 'application/pdf' });
    saveBlobFile(blob, file.filename);
  }, [invoiceId]);

  return (
    <PdfViewDownloadActions
      title="View invoice"
      description={`Review invoice ${invoiceNumber} on screen. Use Download if you want to save a copy.`}
      variant={variant}
      size={size}
      loadPreview={loadPreview}
      onDownload={onDownload}
    />
  );
}
