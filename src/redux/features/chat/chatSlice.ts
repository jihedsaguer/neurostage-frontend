import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatRoom, ChatMessage, ChatUser } from '@/types/chat.types';
import { TYPING_DEBOUNCE_MS } from '@/types/chat.types';

const initialState: ChatState = {
  rooms: [],
  currentRoomId: null,
  messages: {},
  typingUsers: {},
  joinedRooms: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // ─── Room management ────────────────────────────────────────────────────
    setRooms(state, action: PayloadAction<ChatRoom[]>) {
      state.rooms = action.payload;
    },

    setCurrentRoom(state, action: PayloadAction<string | null>) {
      state.currentRoomId = action.payload;
    },

    markRoomJoined(state, action: PayloadAction<string>) {
      if (!state.joinedRooms.includes(action.payload)) {
        state.joinedRooms.push(action.payload);
      }
    },

    markRoomLeft(state, action: PayloadAction<string>) {
      state.joinedRooms = state.joinedRooms.filter((id) => id !== action.payload);
    },

    // ─── Message management ─────────────────────────────────────────────────
    setMessages(state, action: PayloadAction<{ roomId: string; messages: ChatMessage[] }>) {
      const { roomId, messages } = action.payload;
      state.messages[roomId] = messages;
    },

    addMessage(state, action: PayloadAction<ChatMessage>) {
      const msg = action.payload;
      if (!msg.roomId) return;

      if (!state.messages[msg.roomId]) {
        state.messages[msg.roomId] = [];
      }

      const isOptimistic = msg.id.startsWith('optimistic-');

      if (!isOptimistic) {
        // Real server message: remove any matching optimistic entry
        // (same content, sent within the last 30 s, by the same sender)
        const thirtySecondsAgo = Date.now() - 30_000;
        state.messages[msg.roomId] = state.messages[msg.roomId].filter((m) => {
          if (!m.id.startsWith('optimistic-')) return true;
          const ts = parseInt(m.id.replace('optimistic-', ''), 10);
          const sameContent = m.content === msg.content;
          const sameSender = m.sender?.id === msg.sender?.id;
          const isRecent = ts > thirtySecondsAgo;
          return !(sameContent && sameSender && isRecent);
        });
      }

      // Prevent true duplicates (same real id)
      const alreadyExists = state.messages[msg.roomId].some((m) => m.id === msg.id);
      if (!alreadyExists) {
        state.messages[msg.roomId].push(msg);
      }

      // Update last message on the room object (use real messages only)
      if (!isOptimistic) {
        const room = state.rooms.find((r) => r.id === msg.roomId);
        if (room) {
          room.lastMessage = msg;
          room.updatedAt = msg.createdAt;
        }
      }
    },

    // ─── Typing indicators ──────────────────────────────────────────────────
    setTypingUsers(
      state,
      action: PayloadAction<{ roomId: string; users: ChatUser[] }>
    ) {
      const { roomId, users } = action.payload;
      state.typingUsers[roomId] = users;
    },

    addTypingUser(
      state,
      action: PayloadAction<{ roomId: string; user: ChatUser }>
    ) {
      const { roomId, user } = action.payload;
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      const existing = state.typingUsers[roomId].find((u) => u.id === user.id);
      if (!existing) {
        state.typingUsers[roomId].push(user);
      }
    },

    removeTypingUser(
      state,
      action: PayloadAction<{ roomId: string; userId: string }>
    ) {
      const { roomId, userId } = action.payload;
      if (state.typingUsers[roomId]) {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter(
          (u) => u.id !== userId
        );
      }
    },

    // ─── Reset (e.g. on logout) ─────────────────────────────────────────────
    resetChat() {
      return initialState;
    },
  },
});

export const {
  setRooms,
  setCurrentRoom,
  markRoomJoined,
  markRoomLeft,
  setMessages,
  addMessage,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;

// ─── Selectors ──────────────────────────────────────────────────────────────

import type { RootState } from '@/redux/store';

export const selectRooms = (state: RootState) => state.chat.rooms;
export const selectCurrentRoomId = (state: RootState) => state.chat.currentRoomId;
export const selectCurrentRoom = (state: RootState) =>
  state.chat.rooms.find((r) => r.id === state.chat.currentRoomId) ?? null;
export const selectMessages = (roomId: string) => (state: RootState) =>
  state.chat.messages[roomId] ?? [];
export const selectTypingUsers = (roomId: string) => (state: RootState) =>
  state.chat.typingUsers[roomId] ?? [];
export const selectIsRoomJoined = (roomId: string) => (state: RootState) =>
  state.chat.joinedRooms.includes(roomId);

// Re-export constant for components
export { TYPING_DEBOUNCE_MS };
