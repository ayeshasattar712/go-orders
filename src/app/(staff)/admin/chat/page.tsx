'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ThreadList } from '@/features/chat/thread-list';
import { MessageBubble } from '@/features/chat/message-bubble';
import { ChatComposer } from '@/features/chat/chat-composer';
import { useChatStore } from '@/store/chat-store';

export default function AdminChatInboxPage() {
  const threads = useChatStore((state) => state.threads);
  const allMessages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const markThreadRead = useChatStore((state) => state.markThreadRead);

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showConversationOnMobile, setShowConversationOnMobile] = useState(false);

  const activeThreadId = selectedThreadId ?? threads[0]?.id ?? null;

  useEffect(() => {
    if (activeThreadId) markThreadRead(activeThreadId, 'admin');
  }, [activeThreadId, markThreadRead]);

  const messages = allMessages
    .filter((message) => message.threadId === activeThreadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Client messages</h2>
        <p className="text-muted-foreground">
          Respond to client conversations about orders, invoices, and general inquiries.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid md:grid-cols-[320px_1fr]" style={{ minHeight: '32rem' }}>
          <div className={`border-r ${showConversationOnMobile ? 'hidden md:block' : ''}`}>
            <div className="flex items-center justify-between border-b p-3">
              <p className="text-sm font-semibold">Conversations</p>
            </div>
            <ThreadList
              threads={threads}
              activeThreadId={activeThreadId}
              onSelect={(id) => {
                setSelectedThreadId(id);
                setShowConversationOnMobile(true);
              }}
              viewerRole="admin"
            />
          </div>

          <div className={`flex flex-col ${showConversationOnMobile ? '' : 'hidden md:flex'}`}>
            {activeThread ? (
              <>
                <div className="flex items-center gap-2 border-b p-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="md:hidden"
                    onClick={() => setShowConversationOnMobile(false)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <Link
                      href={`/admin/clients/${activeThread.clientId}`}
                      className="hover:text-primary text-sm font-semibold hover:underline"
                    >
                      {activeThread.clientName}
                    </Link>
                    <p className="text-muted-foreground text-xs">{activeThread.subject}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderRole === 'admin'}
                    />
                  ))}
                </div>
                <ChatComposer
                  onSend={(body, attachments) =>
                    sendMessage({
                      threadId: activeThread.id,
                      senderRole: 'admin',
                      senderName: 'GoOrder Admin',
                      body,
                      attachments,
                    })
                  }
                />
              </>
            ) : (
              <EmptyState
                title="No conversations yet"
                description="Client conversations will appear here."
                className="h-full border-0"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
