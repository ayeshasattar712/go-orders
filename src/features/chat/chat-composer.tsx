'use client';

import { useRef, useState } from 'react';
import { FileText, Image as ImageIcon, Paperclip, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatAttachment } from '@/types/admin';

function inferType(fileName: string): ChatAttachment['type'] {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'file';
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatComposer({
  onSend,
}: {
  onSend: (body: string, attachments: ChatAttachment[]) => void;
}) {
  const [body, setBody] = useState('');
  const [pendingFiles, setPendingFiles] = useState<{ file: File; attachment: ChatAttachment }[]>(
    [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next = Array.from(fileList).map((file) => ({
      file,
      attachment: {
        id: `att_${Date.now()}_${file.name}`,
        name: file.name,
        type: inferType(file.name),
        url: '#',
        size: formatSize(file.size),
      } satisfies ChatAttachment,
    }));
    setPendingFiles((prev) => [...prev, ...next]);
  }

  function handleSend() {
    if (!body.trim() && pendingFiles.length === 0) return;
    onSend(
      body.trim(),
      pendingFiles.map((p) => p.attachment),
    );
    setBody('');
    setPendingFiles([]);
  }

  return (
    <div className="border-t p-3">
      {pendingFiles.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map((pending) => {
            const Icon =
              pending.attachment.type === 'image'
                ? ImageIcon
                : pending.attachment.type === 'pdf'
                  ? FileText
                  : Paperclip;
            return (
              <span
                key={pending.attachment.id}
                className="bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
              >
                <Icon className="h-3 w-3" />
                {pending.attachment.name}
                <button
                  type="button"
                  onClick={() =>
                    setPendingFiles((prev) =>
                      prev.filter((p) => p.attachment.id !== pending.attachment.id),
                    )
                  }
                  aria-label="Remove attachment"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          rows={1}
          className="bg-background focus-visible:ring-ring flex-1 resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus-visible:ring-2"
        />
        <Button type="button" size="icon" onClick={handleSend} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
