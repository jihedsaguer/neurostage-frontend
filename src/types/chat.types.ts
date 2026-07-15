/**
 * Chat feature — type definitions.
 * Mirrors the NestJS backend contract exactly.
 */

import type { UserDto } from './user';

// ─── Domain types ───────────────────────────────────────────────────────────

export type MessageType = 'TEXT' | 'SYSTEM';

export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  content: string;
  type: MessageType;
  sender: ChatUser | null; // null for SYSTEM messages
  createdAt: string;       // ISO date
}

export interface ChatRoom {
  id: string;
  stageId: string | null;
  name: string;
  participants: ChatUser[];
  lastMessage: ChatMessage | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Socket event payloads ───────────────────────────────────────────────────

/** Emitted by client to join a room */
export interface JoinRoomPayload {
  roomId: string;
}

/** Emitted by client to send a message */
export interface SendMessagePayload {
  roomId: string;
  content: string;
}

/** Emitted by client while typing */
export interface TypingPayload {
  roomId: string;
}

/** Received from server when a new message arrives */
export interface NewMessageEvent {
  message: ChatMessage;
}

/** Received from server when a user is typing */
export interface UserTypingEvent {
  roomId: string;
  user: ChatUser;
}

// ─── REST request / response ──────────────────────────────────────────────────

export interface GetRoomMessagesParams {
  roomId: string;
  limit?: number;
  before?: string; // ISO date cursor for pagination
}

/**
 * Returned by GET /users/chat-participants
 * Accessible to all authenticated roles — does NOT require admin.
 */
export interface ChatParticipantUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | null;
}

// ─── Redux state ──────────────────────────────────────────────────────────────

export interface ChatState {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  /** keyed by roomId */
  messages: Record<string, ChatMessage[]>;
  /** keyed by roomId — users currently typing */
  typingUsers: Record<string, ChatUser[]>;
  /** tracks rooms being joined */
  joinedRooms: string[];
}

// ─── Typing timeout constant (ms) ────────────────────────────────────────────

export const TYPING_DEBOUNCE_MS = 3000;

// ─── Helper: display name ────────────────────────────────────────────────────

export function chatUserDisplayName(user: ChatUser | UserDto | null | undefined): string {
  if (!user) return 'Inconnu';
  return `${user.firstName} ${user.lastName}`.trim();
}

export function chatUserInitials(user: ChatUser | null | undefined): string {
  if (!user) return '?';
  return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
}
