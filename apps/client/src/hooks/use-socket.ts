'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, ChatThread } from '@/types/admin';

const SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:3002';

interface UseSocketOptions {
  onMessage?: (message: ChatMessage) => void;
  onThreadCreated?: (thread: ChatThread) => void;
  onThreadUpdated?: (thread: ChatThread) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { onMessage, onThreadCreated, onThreadUpdated } = options;

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('message:new', (message: ChatMessage) => {
      onMessage?.(message);
    });

    socket.on('thread:created', (thread: ChatThread) => {
      onThreadCreated?.(thread);
    });

    socket.on('thread:updated', (thread: ChatThread) => {
      onThreadUpdated?.(thread);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [onMessage, onThreadCreated, onThreadUpdated]);

  const joinThread = useCallback((threadId: string, role: 'customer' | 'admin') => {
    socketRef.current?.emit('join', { threadId, role });
  }, []);

  const sendMessage = useCallback((message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    const fullMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    socketRef.current?.emit('message:send', fullMessage);
    return fullMessage;
  }, []);

  const createThread = useCallback(
    (params: {
      clientId: string;
      clientName: string;
      subject: string;
      firstMessage: string;
      senderRole: 'customer' | 'admin';
      senderName: string;
    }) => {
      socketRef.current?.emit('thread:create', params);
    },
    [],
  );

  const markThreadRead = useCallback((threadId: string, viewerRole: 'customer' | 'admin') => {
    socketRef.current?.emit('thread:read', { threadId, viewerRole });
  }, []);

  return {
    isConnected,
    joinThread,
    sendMessage,
    createThread,
    markThreadRead,
  };
}
