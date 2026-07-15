/**
 * useChatSocket
 *
 * Creates and manages a Socket.IO connection to the backend WebSocket gateway.
 * Authentication is handled by passing the JWT token from Redux on connect.
 *
 * Usage:
 *   const socket = useChatSocket();
 *   socket.joinRoom(roomId);
 *   socket.sendMessage(roomId, 'Hello!');
 */

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  addMessage,
  addTypingUser,
  removeTypingUser,
  markRoomJoined,
  markRoomLeft,
  TYPING_DEBOUNCE_MS,
} from '@/redux/features/chat/chatSlice';
import type { ChatMessage, ChatUser, UserTypingEvent } from '@/types/chat.types';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface UseChatSocketReturn {
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  sendTyping: (roomId: string) => void;
  isConnected: () => boolean;
}

// -------------------------------------------------------------------
// Message normalization
//
// The NestJS gateway may return the message in several shapes depending
// on how the entity is serialised. We normalise every variant into the
// ChatMessage interface that Redux expects.
// -------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMessage(raw: any): ChatMessage | null {
  if (!raw || typeof raw !== 'object') return null;

  // ── Unwrap envelope shapes ─────────────────────────────────────────
  // Shape: { message: ChatMessage }
  if (raw.message && typeof raw.message === 'object' && ('id' in raw.message || 'content' in raw.message)) {
    return normalizeMessage(raw.message);
  }
  // Shape: { data: ChatMessage }
  if (raw.data && typeof raw.data === 'object' && ('id' in raw.data || 'content' in raw.data)) {
    return normalizeMessage(raw.data);
  }

  // ── Extract roomId from every possible field name ─────────────────
  const roomId: string | null =
    raw.roomId ??
    raw.room_id ??
    raw.chatRoomId ??
    raw.chat_room_id ??
    raw.room?.id ??
    raw.chatRoom?.id ??
    null;

  if (!roomId) {
    console.warn('[Chat] normalizeMessage: no roomId found in', raw);
    return null;
  }

  // ── Extract sender ────────────────────────────────────────────────
  let sender: ChatUser | null = null;

  if (raw.sender && typeof raw.sender === 'object' && raw.sender.id) {
    // Already a ChatUser object
    sender = {
      id: raw.sender.id,
      firstName: raw.sender.firstName ?? raw.sender.first_name ?? '',
      lastName: raw.sender.lastName ?? raw.sender.last_name ?? '',
      email: raw.sender.email ?? '',
    };
  } else {
    // Flat sender fields
    const senderId = raw.senderId ?? raw.sender_id ?? raw.userId ?? raw.user_id ?? null;
    if (senderId) {
      sender = {
        id: senderId,
        firstName: raw.senderFirstName ?? raw.sender_first_name ?? raw.userFirstName ?? '',
        lastName: raw.senderLastName ?? raw.sender_last_name ?? raw.userLastName ?? '',
        email: raw.senderEmail ?? raw.sender_email ?? '',
      };
    }
  }

  return {
    id: raw.id ?? `echo-${Date.now()}`,
    roomId,
    content: raw.content ?? raw.message ?? raw.text ?? '',
    type: raw.type ?? 'TEXT',
    sender,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
}

// -------------------------------------------------------------------
// Hook
// -------------------------------------------------------------------

export function useChatSocket(): UseChatSocketReturn {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const currentUser = useAppSelector((s) => s.auth.user);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!accessToken) return;

    // Build the correct WebSocket URL.
    // VITE_API_URL = "http://localhost/api"  →  WS base = "http://localhost"
    // Nginx proxies /socket.io/ on the root, not under /api.
    const apiUrl = import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL ?? '';
    const socketUrl = apiUrl.replace(/\/api\/?$/, '');

    const socket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      path: '/socket.io',
    });

    socket.on('connect', () => {
      console.info('[Chat] Socket connected, id:', socket.id);
    });
    socket.on('disconnect', (reason) => {
      console.info('[Chat] Socket disconnected:', reason);
    });

    socketRef.current = socket;

    // ── Incoming message handler (handles all shapes + field names) ──

    const handleIncomingMessage = (event: unknown) => {
      const msg = normalizeMessage(event);

      if (msg) {
        console.info('[Chat] ← message received, room:', msg.roomId, 'id:', msg.id);
        dispatch(addMessage(msg));
      } else {
        console.warn('[Chat] Received unrecognised message shape:', event);
      }
    };

    // Listen to both common event names the backend might use
    socket.on('newMessage', handleIncomingMessage);
    socket.on('message',    handleIncomingMessage);
    socket.on('chatMessage', handleIncomingMessage);

    // ── Typing ───────────────────────────────────────────────────────

    socket.on('userTyping', (event: UserTypingEvent) => {
      const { roomId, user } = event;
      dispatch(addTypingUser({ roomId, user }));

      clearTimeout(typingTimeoutsRef.current[`${roomId}-${user.id}`]);
      typingTimeoutsRef.current[`${roomId}-${user.id}`] = setTimeout(() => {
        dispatch(removeTypingUser({ roomId, userId: user.id }));
      }, TYPING_DEBOUNCE_MS);
    });

    // ── Room lifecycle ───────────────────────────────────────────────

    socket.on('joinedRoom', (payload: { roomId: string }) => {
      dispatch(markRoomJoined(payload.roomId));
    });

    socket.on('connect_error', (err) => {
      console.error('[Chat] Socket connection error:', err.message);
    });

    // Debug logger in dev — shows exact event names and raw field names
    if (import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.onAny((eventName: string, data: any) => {
        console.debug('[SOCKET DEBUG]', eventName, {
          id:         data?.id,
          roomId:     data?.roomId,
          room_id:    data?.room_id,
          chatRoomId: data?.chatRoomId,
          content:    typeof data?.content === 'string' ? data.content.slice(0, 40) : data?.content,
          sender:     data?.sender?.id ?? data?.senderId,
        });
      });
    }

    return () => {
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // ── Emitters ─────────────────────────────────────────────────────

  const joinRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('joinRoom', { roomId });
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('leaveRoom', { roomId });
    dispatch(markRoomLeft(roomId));
  }, [dispatch]);

  /**
   * Send a message and immediately add an optimistic entry to Redux so
   * the sender sees their own message without waiting for the server echo.
   * When the real echo arrives it replaces/deduplicates the optimistic one.
   */
  const sendMessage = useCallback((roomId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    // Optimistic update — sender sees the message immediately
    if (currentUser) {
      const optimistic: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        roomId,
        content: trimmed,
        type: 'TEXT',
        sender: {
          id:        currentUser.id,
          firstName: currentUser.firstName,
          lastName:  currentUser.lastName,
          email:     currentUser.email,
        },
        createdAt: new Date().toISOString(),
      };
      dispatch(addMessage(optimistic));
    }

    // Emit to server
    socketRef.current?.emit('sendMessage', { roomId, content: trimmed });
  }, [currentUser, dispatch]);

  const sendTyping = useCallback((roomId: string) => {
    socketRef.current?.emit('typing', { roomId });
  }, []);

  const isConnected = useCallback(() => socketRef.current?.connected ?? false, []);

  return { joinRoom, leaveRoom, sendMessage, sendTyping, isConnected };
}
