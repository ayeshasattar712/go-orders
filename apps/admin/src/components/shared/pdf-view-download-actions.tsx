'use client';

import { useEffect, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function toPdfBlob(blob: Blob) {
  return blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
}

export function PdfViewDownloadActions({
  title,
  description,
  downloadLabel = 'PDF',
  variant = 'ghost',
  size = 'sm',
  loadPreview,
  onDownload,
}: {
  title: string;
  description: string;
  downloadLabel?: string;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'default';
  loadPreview: () => Promise<Blob>;
  onDownload: () => Promise<void>;
}) {
  const [downloading, setDownloading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!previewOpen) return;

    let cancelled = false;
    let createdUrl: string | null = null;
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewUrl(null);

    void loadPreview()
      .then((blob) => {
        if (blob.type.includes('json')) {
          throw new Error('Unable to open PDF');
        }
        const url = URL.createObjectURL(toPdfBlob(blob));
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        createdUrl = url;
        setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPreviewError('Could not open this PDF. Try Download instead.');
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [previewOpen, loadPreview]);

  async function handleDownload(event?: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();
    setDownloading(true);
    try {
      await onDownload();
    } finally {
      setDownloading(false);
    }
  }

  function handleView(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPreviewOpen(true);
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button type="button" size={size} variant="outline" onClick={handleView}>
        <Eye className="h-3.5 w-3.5" />
        View
      </Button>
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={downloading}
        onClick={() => handleDownload()}
      >
        <Download className="h-3.5 w-3.5" />
        {downloading ? 'Saving...' : downloadLabel}
      </Button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[min(90dvh,52rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:p-0">
          <DialogHeader className="border-b p-4 pr-12 text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 bg-zinc-100">
            {previewLoading ? (
              <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
                Loading preview...
              </p>
            ) : previewError ? (
              <p className="text-muted-foreground flex h-full items-center justify-center px-6 text-center text-sm">
                {previewError}
              </p>
            ) : previewUrl ? (
              <iframe title={title} src={previewUrl} className="h-full w-full border-0" />
            ) : null}
          </div>
          <DialogFooter className="border-t p-3 sm:justify-end">
            <Button type="button" size="sm" variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button type="button" size="sm" onClick={() => handleDownload()} disabled={downloading}>
              <Download className="h-3.5 w-3.5" />
              {downloading ? 'Saving...' : 'Download'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
