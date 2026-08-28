import { FileText, Image as ImageIcon, Paperclip, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatAttachment, ChatMessage } from '@/types/admin';

function AttachmentChip({ attachment }: { attachment: ChatAttachment }) {
  const Icon =
    attachment.type === 'image' ? ImageIcon : attachment.type === 'pdf' ? FileText : Paperclip;
  return (
    <div className="bg-background/60 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{attachment.name}</span>
      <span className="text-muted-foreground shrink-0">{attachment.size}</span>
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  return (
    <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {message.body ? <p className="whitespace-pre-wrap">{message.body}</p> : null}
        {message.attachments?.length ? (
          <div className={cn('mt-2 flex flex-col gap-1.5', !message.body && 'mt-0')}>
            {message.attachments.map((attachment) => (
              <AttachmentChip key={attachment.id} attachment={attachment} />
            ))}
          </div>
        ) : null}
      </div>
      <span className="text-muted-foreground flex items-center gap-1 px-1 text-[11px]">
        {message.senderName} · {formatTime(message.createdAt)}
        {isOwn && message.readAt ? <CheckCheck className="text-info h-3 w-3" /> : null}
      </span>
    </div>
  );
}
