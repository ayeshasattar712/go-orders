'use client';

import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ChatThread } from '@/types/admin';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ThreadList({
  threads,
  activeThreadId,
  onSelect,
  viewerRole,
}: {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelect: (threadId: string) => void;
  viewerRole: 'customer' | 'admin';
}) {
  if (threads.length === 0) {
    return <p className="text-muted-foreground p-4 text-sm">No conversations yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y">
      {threads
        .slice()
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        .map((thread) => {
          const unread = viewerRole === 'admin' ? thread.unreadForAdmin : thread.unreadForCustomer;
          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelect(thread.id)}
              className={cn(
                'hover:bg-muted flex items-start gap-3 p-4 text-left transition-colors',
                activeThreadId === thread.id && 'bg-muted',
              )}
            >
              <Avatar>
                <AvatarFallback>{initials(thread.clientName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">
                    {viewerRole === 'admin' ? thread.clientName : 'GoOrder Admin'}
                  </p>
                  <span className="text-muted-foreground shrink-0 text-[11px]">
                    {formatDate(thread.lastMessageAt)}
                  </span>
                </div>
                <p className="text-foreground/80 truncate text-xs font-medium">{thread.subject}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {thread.lastMessagePreview}
                </p>
              </div>
              {unread > 0 ? <Badge variant="brand">{unread}</Badge> : null}
            </button>
          );
        })}
    </div>
  );
}
