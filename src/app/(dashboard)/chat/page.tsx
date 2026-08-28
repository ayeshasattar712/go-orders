'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, MessagesSquare, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ThreadList } from '@/features/chat/thread-list';
import { MessageBubble } from '@/features/chat/message-bubble';
import { ChatComposer } from '@/features/chat/chat-composer';
import { useChatStore } from '@/store/chat-store';
import { useCurrentClient } from '@/hooks/use-current-client';
import { useCustomerAuthStore } from '@/store/customer-auth-store';

export default function CustomerChatPage() {
  const client = useCurrentClient();
  const user = useCustomerAuthStore((state) => state.user);
  const threads = useChatStore((state) =>
    client ? state.threads.filter((t) => t.clientId === client.id) : [],
  );
  const allMessages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const createThread = useChatStore((state) => state.createThread);
  const markThreadRead = useChatStore((state) => state.markThreadRead);

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showConversationOnMobile, setShowConversationOnMobile] = useState(false);

  const activeThreadId = selectedThreadId ?? threads[0]?.id ?? null;

  useEffect(() => {
    if (activeThreadId) markThreadRead(activeThreadId, 'customer');
  }, [activeThreadId, markThreadRead]);

  if (!client) {
    return (
      <EmptyState
        title="Chat unavailable"
        description="Your account isn't linked to a GoOrder client record yet. Contact support to enable chat."
      />
    );
  }

  const messages = allMessages
    .filter((message) => message.threadId === activeThreadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const activeThread = threads.find((t) => t.id === activeThreadId);

  function handleStartNewThread() {
    const id = createThread({
      clientId: client!.id,
      clientName: client!.companyName,
      subject: 'New conversation',
      firstMessage: 'Hi GoOrder Admin, I have a question.',
      senderRole: 'customer',
      senderName: user
        ? `${user.firstName} ${user.lastName}`.trim() || client!.contactName
        : client!.contactName,
    });
    setSelectedThreadId(id);
    setShowConversationOnMobile(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Chat with GoOrder</h2>
        <p className="text-muted-foreground">
          Message the GoOrder team directly about orders, invoices, or anything else.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid md:grid-cols-[320px_1fr]" style={{ minHeight: '32rem' }}>
          <div className={`border-r ${showConversationOnMobile ? 'hidden md:block' : ''}`}>
            <div className="flex items-center justify-between border-b p-3">
              <p className="text-sm font-semibold">Conversations</p>
              <Button size="sm" variant="ghost" onClick={handleStartNewThread}>
                <Plus className="h-4 w-4" /> New
              </Button>
            </div>
            <ThreadList
              threads={threads}
              activeThreadId={activeThreadId}
              onSelect={(id) => {
                setSelectedThreadId(id);
                setShowConversationOnMobile(true);
              }}
              viewerRole="customer"
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
                    <p className="text-sm font-semibold">GoOrder Admin</p>
                    <p className="text-muted-foreground text-xs">{activeThread.subject}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderRole === 'customer'}
                    />
                  ))}
                </div>
                <ChatComposer
                  onSend={(body, attachments) =>
                    sendMessage({
                      threadId: activeThread.id,
                      senderRole: 'customer',
                      senderName: user
                        ? `${user.firstName} ${user.lastName}`.trim() || client.contactName
                        : client.contactName,
                      body,
                      attachments,
                    })
                  }
                />
              </>
            ) : (
              <EmptyState
                title="No conversation selected"
                description="Start a new conversation with GoOrder Admin."
                action={
                  <Button onClick={handleStartNewThread}>
                    <MessagesSquare className="h-4 w-4" /> Start conversation
                  </Button>
                }
                className="h-full border-0"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
