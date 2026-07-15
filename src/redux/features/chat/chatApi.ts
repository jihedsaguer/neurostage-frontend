import { baseApi } from '../../api/baseApi';
import type { ChatRoom, ChatMessage, ChatParticipantUser } from '@/types/chat.types';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /chat/rooms — fetch all rooms accessible to the current user
    fetchChatRooms: builder.query<ChatRoom[], void>({
      query: () => ({ url: '/chat/rooms' }),
      providesTags: ['Chat'],
    }),

    // GET /chat/rooms/:id/messages — fetch message history for a room
    fetchRoomMessages: builder.query<ChatMessage[], string>({
      query: (roomId) => ({ url: `/chat/rooms/${roomId}/messages` }),
      providesTags: (_r, _e, roomId) => [{ type: 'Chat', id: roomId }],
    }),

    // GET /users/chat-participants — all users available for chat rooms
    // Accessible to all authenticated roles (replaces GET /users which is admin-only)
    getChatParticipants: builder.query<ChatParticipantUser[], void>({
      query: () => ({ url: '/users/chat-participants' }),
      providesTags: ['User'],
    }),

    // POST /chat/rooms — create a new room
    createChatRoom: builder.mutation<ChatRoom, { name: string; description?: string }>({
      query: (body) => ({
        url: '/chat/rooms',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),

    // POST /chat/rooms/:id/participants — add a participant to a room
    addParticipant: builder.mutation<ChatRoom, { roomId: string; userId: string }>({
      query: ({ roomId, userId }) => ({
        url: `/chat/rooms/${roomId}/participants`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (_result, _error, { roomId }) => ['Chat', { type: 'Chat', id: roomId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useFetchChatRoomsQuery,
  useFetchRoomMessagesQuery,
  useLazyFetchRoomMessagesQuery,
  useGetChatParticipantsQuery,
  useCreateChatRoomMutation,
  useAddParticipantMutation,
} = chatApi;
