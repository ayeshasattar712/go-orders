'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  author: string;
  initials: string;
  body: string;
  time: string;
  isSelf?: boolean;
}

const seedMessages: Record<'customer' | 'team', ChatMessage[]> = {
  customer: [
    {
      id: '1',
      author: 'Aisha Rahman',
      initials: 'AR',
      body: 'Hi! Can you confirm the ETA for order GO-2026-07602?',
      time: '9:02 AM',
    },
    {
      id: '2',
      author: 'You',
      initials: 'ME',
      body: "Hi Aisha, checking now — it's currently delayed due to a routing issue. New ETA is Aug 12.",
      time: '9:04 AM',
      isSelf: true,
    },
    {
      id: '3',
      author: 'Aisha Rahman',
      initials: 'AR',
      body: 'Thanks for the update, appreciate the quick response!',
      time: '9:05 AM',
    },
  ],
  team: [
    {
      id: '1',
      author: 'Priya Nair',
      initials: 'PN',
      body: 'Heads up — Denver FC is at 91% capacity, might need overflow routing this week.',
      time: '8:12 AM',
    },
    {
      id: '2',
      author: 'You',
      initials: 'ME',
      body: "I'll loop in warehouse ops and see if Charlotte can take overflow.",
      time: '8:15 AM',
      isSelf: true,
    },
    {
      id: '3',
      author: 'Daniel Osei',
      initials: 'DO',
      body: 'Charlotte has headroom, 45% utilization. Can support overflow.',
      time: '8:20 AM',
    },
  ],
};

export function ChatPanel({ variant }: { variant: 'customer' | 'team' }) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages[variant]);
  const [draft, setDraft] = useState('');

  function sendMessage() {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        author: 'You',
        initials: 'ME',
        body: draft,
        time: 'Now',
        isSelf: true,
      },
    ]);
    setDraft('');
  }

  return (
    <div className="flex h-[420px] flex-col rounded-xl border">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex gap-2.5', message.isSelf && 'flex-row-reverse')}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>{message.initials}</AvatarFallback>
            </Avatar>
            <div className={cn('max-w-[70%]', message.isSelf && 'items-end text-right')}>
              <div
                className={cn(
                  'rounded-2xl px-3.5 py-2 text-sm',
                  message.isSelf ? 'bg-primary text-primary-foreground' : 'bg-muted',
                )}
              >
                {message.body}
              </div>
              <p className="text-muted-foreground mt-1 text-[11px]">
                {message.author} · {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t p-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <Button size="icon" onClick={sendMessage} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
