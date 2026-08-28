import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'] }));
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: ['http://localhost:3000', 'http://localhost:3001'], methods: ['GET', 'POST'] },
});

interface ChatMessage {
  id: string;
  threadId: string;
  senderRole: 'customer' | 'admin';
  senderId?: string;
  senderName: string;
  body: string;
  createdAt: string;
  readAt?: string;
  attachments?: Array<{ name: string; type: string; url: string; size: string }>;
}

interface ChatThread {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  relatedOrderNumber?: string;
  relatedInvoiceNumber?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadForAdmin: number;
  unreadForCustomer: number;
}

type RoomRole = 'customer' | 'admin';

const threads = new Map<string, ChatThread>();
const messages = new Map<string, ChatMessage[]>();
const socketsByThread = new Map<string, Set<string>>();

function getOrCreateThread(threadId: string): ChatThread {
  if (!threads.has(threadId)) {
    const thread: ChatThread = {
      id: threadId,
      clientId: '',
      clientName: '',
      subject: 'New conversation',
      lastMessagePreview: '',
      lastMessageAt: new Date().toISOString(),
      unreadForAdmin: 0,
      unreadForCustomer: 0,
    };
    threads.set(threadId, thread);
    messages.set(threadId, []);
  }
  return threads.get(threadId)!;
}

function getThreadMessages(threadId: string): ChatMessage[] {
  return messages.get(threadId) ?? [];
}

function addMessage(threadId: string, message: ChatMessage) {
  const threadMessages = messages.get(threadId) ?? [];
  threadMessages.push(message);
  messages.set(threadId, threadMessages);
  const thread = threads.get(threadId);
  if (thread) {
    thread.lastMessagePreview = message.body || 'Sent an attachment';
    thread.lastMessageAt = message.createdAt;
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', ({ threadId, role }: { threadId: string; role: RoomRole }) => {
    const thread = getOrCreateThread(threadId);
    socket.join(threadId);
    socket.data.threadId = threadId;
    socket.data.role = role;

    if (!socketsByThread.has(threadId)) {
      socketsByThread.set(threadId, new Set());
    }
    socketsByThread.get(threadId)!.add(socket.id);

    socket.emit('thread:history', { thread, messages: getThreadMessages(threadId) });

    if (role === 'admin') {
      thread.unreadForAdmin = 0;
    } else {
      thread.unreadForCustomer = 0;
    }

    io.to(threadId).emit('thread:updated', thread);
  });

  socket.on('message:send', (message: ChatMessage) => {
    const thread = getOrCreateThread(message.threadId);
    addMessage(message.threadId, message);

    if (message.senderRole === 'customer') {
      thread.unreadForAdmin = (thread.unreadForAdmin || 0) + 1;
      thread.unreadForCustomer = 0;
    } else {
      thread.unreadForCustomer = (thread.unreadForCustomer || 0) + 1;
      thread.unreadForAdmin = 0;
    }

    io.to(message.threadId).emit('message:new', message);
    io.to(message.threadId).emit('thread:updated', thread);
  });

  socket.on(
    'thread:create',
    ({
      clientId,
      clientName,
      subject,
      firstMessage,
      senderRole,
      senderName,
    }: {
      clientId: string;
      clientName: string;
      subject: string;
      firstMessage: string;
      senderRole: RoomRole;
      senderName: string;
    }) => {
      const threadId = `thread_${Date.now()}`;
      const thread: ChatThread = {
        id: threadId,
        clientId,
        clientName,
        subject,
        lastMessagePreview: firstMessage,
        lastMessageAt: new Date().toISOString(),
        unreadForAdmin: senderRole === 'customer' ? 1 : 0,
        unreadForCustomer: senderRole === 'admin' ? 1 : 0,
      };
      threads.set(threadId, thread);
      messages.set(threadId, []);
      socketsByThread.set(threadId, new Set());

      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        threadId,
        senderRole,
        senderName,
        body: firstMessage,
        createdAt: new Date().toISOString(),
      };
      addMessage(threadId, message);

      io.emit('thread:created', thread);
      io.emit('thread:updated', thread);
      socket.emit('thread:created', thread);
    },
  );

  socket.on(
    'thread:read',
    ({ threadId, viewerRole }: { threadId: string; viewerRole: RoomRole }) => {
      const thread = threads.get(threadId);
      if (!thread) return;

      if (viewerRole === 'admin') {
        thread.unreadForAdmin = 0;
      } else {
        thread.unreadForCustomer = 0;
      }

      const threadMessages = messages.get(threadId) ?? [];
      threadMessages.forEach((m) => {
        if (!m.readAt && m.senderRole !== viewerRole) {
          m.readAt = new Date().toISOString();
        }
      });

      io.to(threadId).emit('thread:updated', thread);
    },
  );

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const threadId = socket.data.threadId as string | undefined;
    if (threadId) {
      const threadSockets = socketsByThread.get(threadId);
      if (threadSockets) {
        threadSockets.delete(socket.id);
        if (threadSockets.size === 0) {
          socketsByThread.delete(threadId);
        }
      }
    }
  });
});

const PORT = process.env.CHAT_SERVER_PORT || 3002;
server.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down chat server...');
  server.close(() => {
    process.exit(0);
  });
});
