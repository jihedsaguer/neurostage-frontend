import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  useFetchChatRoomsQuery,
  useLazyFetchRoomMessagesQuery,
  useCreateChatRoomMutation,
  useAddParticipantMutation,
} from '@/redux/features/chat/chatApi';
import {
  setRooms,
  setCurrentRoom,
  setMessages,
  selectCurrentRoom,
  selectCurrentRoomId,
} from '@/redux/features/chat/chatSlice';
import { useChatSocket } from '@/lib/hooks/useChatSocket';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import CreateChatRoomModal from '@/components/chat/CreateChatRoomModal';
import AddChatParticipantModal from '@/components/chat/AddChatParticipantModal';
import { MessageSquare } from 'lucide-react';

/**
 * ChatPage — full-screen chat layout: sidebar + main window.
 *
 * Flow:
 * 1. REST: fetch rooms on mount, seed Redux state.
 * 2. Socket: connect with JWT, join current room on selection.
 * 3. On room change: fetch message history via REST, then subscribe via socket.
 */
const ChatPage = () => {
  const dispatch = useAppDispatch();
  const currentRoomId = useAppSelector(selectCurrentRoomId);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const role = useAppSelector((state) => state.auth.role);
  
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [manageParticipantsOpen, setManageParticipantsOpen] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);

  // Admin check
  const canCreateRoom = role === 'super_admin' || role === 'admin_formation';
  const canManageParticipants = canCreateRoom && !!currentRoom;

  // ── REST: load rooms ──────────────────────────────────────────────
  const { data: rooms = [], isLoading: loadingRooms } = useFetchChatRoomsQuery();

  useEffect(() => {
    if (rooms.length > 0) {
      dispatch(setRooms(rooms));
    }
  }, [rooms, dispatch]);

  // ── REST: load history when room changes ──────────────────────────
  const [fetchMessages, { isLoading: loadingHistory }] = useLazyFetchRoomMessagesQuery();

  // ── Socket ────────────────────────────────────────────────────────
  const { joinRoom, leaveRoom, sendMessage, sendTyping } = useChatSocket();

  const handleSelectRoom = (roomId: string) => {
    // Leave previous room
    if (currentRoomId && currentRoomId !== roomId) {
      leaveRoom(currentRoomId);
    }

    dispatch(setCurrentRoom(roomId));

    // Load history then join socket room
    fetchMessages(roomId)
      .unwrap()
      .then((msgs) => {
        dispatch(setMessages({ roomId, messages: msgs }));
      })
      .catch(() => {
        // History unavailable — still open the socket room
      });

    joinRoom(roomId);
  };

  const handleSend = (roomId: string, content: string) => {
    sendMessage(roomId, content);
  };

  const handleTyping = (roomId: string) => {
    sendTyping(roomId);
  };

  const [createChatRoom] = useCreateChatRoomMutation();
  const [addParticipant] = useAddParticipantMutation();

  const isFetchBaseQueryError = (error: unknown): error is { status: number; data?: unknown } => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as any).status === 'number'
    );
  };

  const handleCreateRoom = async (data: { name: string; description?: string }) => {
    setIsCreatingRoom(true);
    try {
      await createChatRoom(data).unwrap();
      setCreateRoomOpen(false);
    } catch (err) {
      let message = 'Failed to create room.';

      if (isFetchBaseQueryError(err)) {
        if (err.status === 403) {
          message = 'Forbidden: only SUPER_ADMIN or ADMIN_FORMATION can create chat rooms.';
        } else if (err.data && typeof err.data === 'object' && 'message' in err.data) {
          message = String((err.data as { message?: string }).message ?? message);
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      console.error('Failed to create room:', err);
      throw new Error(message);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleAddParticipant = async (userId: string) => {
    if (!currentRoomId) return;

    setIsAddingParticipant(true);
    try {
      await addParticipant({ roomId: currentRoomId, userId }).unwrap();
      setManageParticipantsOpen(false);
    } catch (err) {
      let message = 'Failed to add participant.';

      if (isFetchBaseQueryError(err)) {
        if (err.status === 403) {
          message = 'Forbidden: only SUPER_ADMIN or ADMIN_FORMATION can add participants.';
        } else if (err.status === 404) {
          message = 'User or room not found.';
        } else if (err.status === 409) {
          message = 'User is already a participant.';
        } else if (err.data && typeof err.data === 'object' && 'message' in err.data) {
          message = String((err.data as { message?: string }).message ?? message);
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      console.error('Failed to add participant:', err);
      throw new Error(message);
    } finally {
      setIsAddingParticipant(false);
    }
  };

  return (
    <>
      <div className="flex h-[calc(100vh-0px)] bg-white" aria-label="Chat">
        {/* Sidebar */}
        <ChatSidebar 
          onSelectRoom={handleSelectRoom} 
          onCreateRoom={() => setCreateRoomOpen(true)}
          isLoading={loadingRooms}
          canCreateRoom={canCreateRoom}
        />

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentRoom ? (
            <ChatWindow
              room={currentRoom}
              onSend={handleSend}
              onTyping={handleTyping}
              onLeave={leaveRoom}
              canManageParticipants={canManageParticipants}
              onManageParticipants={() => setManageParticipantsOpen(true)}
              isLoadingHistory={loadingHistory}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" aria-hidden />
              <p className="text-base font-medium text-slate-500">
                Select a conversation to start
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Choose a room from the list on the left
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Create Room Modal */}
      <CreateChatRoomModal
        open={createRoomOpen}
        onOpenChange={setCreateRoomOpen}
        onSubmit={handleCreateRoom}
        isLoading={isCreatingRoom}
      />

      <AddChatParticipantModal
        open={manageParticipantsOpen}
        onOpenChange={setManageParticipantsOpen}
        roomId={currentRoomId ?? ''}
        currentParticipantIds={currentRoom?.participants?.map((p) => p.id) ?? []}
        onSubmit={handleAddParticipant}
        isLoading={isAddingParticipant}
      />
    </>
  );
};

export default ChatPage;
