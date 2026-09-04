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
import { chatService } from '@/services/api';
import type { ChatMessage, ChatThread } from '@/types/admin';

export default function AdminChatInboxPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showConversationOnMobile, setShowConversationOnMobile] = useState(false);

  useEffect(() => {
    void chatService.listThreads().then((items) => {
      setThreads(items);
      if (items[0]) setSelectedThreadId(items[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedThreadId) return;
    let cancelled = false;
    void chatService.listMessages(selectedThreadId).then((result) => {
      if (cancelled) return;
      setMessages(result.messages);
      setThreads((current) =>
        current.map((thread) => (thread.id === result.thread.id ? result.thread : thread)),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [selectedThreadId]);

  const activeThread = threads.find((thread) => thread.id === selectedThreadId);

  async function handleSend(body: string) {
    if (!selectedThreadId) return;
    const result = await chatService.sendMessage(selectedThreadId, body);
    setMessages((current) => [...current, result.message]);
    setThreads((current) =>
      current.map((thread) => (thread.id === result.thread.id ? result.thread : thread)),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Client messages</h2>
        <p className="text-muted-foreground">
          Reply to customer chats about orders, invoices, and delivery.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid min-h-[24rem] md:min-h-[32rem] md:grid-cols-[320px_1fr]">
          <div className={`border-r ${showConversationOnMobile ? 'hidden md:block' : ''}`}>
            <div className="flex items-center justify-between border-b p-3">
              <p className="text-sm font-semibold">Conversations</p>
            </div>
            <ThreadList
              threads={threads}
              activeThreadId={selectedThreadId}
              onSelect={(id) => {
                setMessages([]);
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
                <ChatComposer onSend={(body) => void handleSend(body)} />
              </>
            ) : (
              <EmptyState
                title="No conversations yet"
                description="When a customer starts a chat, it appears here."
                className="h-full border-0"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
