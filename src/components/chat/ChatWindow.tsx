import { useEffect, useRef, useMemo } from 'react';
import { useAppSelector } from '@/redux/hooks';
import {
  selectMessages,
  selectTypingUsers,
  selectIsRoomJoined,
} from '@/redux/features/chat/chatSlice';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { chatUserDisplayName } from '@/types/chat.types';
import type { ChatRoom } from '@/types/chat.types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  Users,
  LogOut,
  Info,
  UserPlus,
} from 'lucide-react';

interface Props {
  room?: ChatRoom;
  roomId?: string;
  roomName?: string;
  onSend: (roomId: string, content: string) => void;
  onTyping: (roomId: string) => void;
  onLeave?: (roomId: string) => void;
  onManageParticipants?: () => void;
  canManageParticipants?: boolean;
  isLoadingHistory?: boolean;
}

/**
 * Modern Slack-style chat window with:
 * - Header with room info and participants
 * - Message bubbles with grouping by sender
 * - Typing indicators
 * - Empty state
 * - Message input with send button
 */
const ChatWindow = ({ 
  room,
  roomId: legacyRoomId,
  roomName: legacyRoomName,
  onSend, 
  onTyping, 
  onLeave,
  onManageParticipants,
  canManageParticipants = false,
  isLoadingHistory = false, 
}: Props) => {
  // Support both new (room object) and legacy (roomId/roomName) props
  const roomId = room?.id || legacyRoomId || '';
  const roomName = room?.name || legacyRoomName || '';
  const participants = room?.participants || [];

  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const messages = useAppSelector(selectMessages(roomId));
  const typingUsers = useAppSelector(selectTypingUsers(roomId));
  const isJoined = useAppSelector(selectIsRoomJoined(roomId));

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Group messages by sender for better visual hierarchy
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    for (const msg of messages) {
      const senderKey = msg.sender?.id || 'SYSTEM';

      if (currentGroup && currentGroup.senderKey === senderKey && msg.type !== 'SYSTEM') {
        currentGroup.messages.push(msg);
      } else {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          senderKey,
          sender: msg.sender,
          type: msg.type,
          messages: [msg],
        };
      }
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  const handleSend = (content: string) => onSend(roomId, content);
  const handleTyping = () => onTyping(roomId);
  const handleLeave = () => onLeave?.(roomId);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Room info */}
          <div>
            <h2 className="text-base font-semibold text-slate-900">{roomName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
              {isJoined ? ' • Connected' : ' • Connecting…'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Participants Avatars */}
          {participants.length > 0 && (
            <div className="flex items-center -space-x-2">
              {participants.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {participants.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-slate-600">
                  +{participants.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3 ml-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Room info"
            >
              <Info className="h-4 w-4 text-slate-600" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onManageParticipants}
              aria-label="Manage participants"
            >
              <Users className="h-4 w-4 text-slate-600" aria-hidden />
            </Button>
            {canManageParticipants && onManageParticipants && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onManageParticipants}
                aria-label="Add participant"
              >
                <UserPlus className="h-4 w-4 text-slate-600" aria-hidden />
              </Button>
            )}
            {onLeave && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                onClick={handleLeave}
                aria-label="Leave room"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div
          className="flex flex-col p-6 space-y-4"
          aria-live="polite"
          aria-label="Chat messages"
          role="log"
        >
          {isLoadingHistory ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" aria-hidden />
              <p className="text-sm font-medium text-slate-500">No messages yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Start the conversation by sending a message
              </p>
            </div>
          ) : (
            groupedMessages.map((group, idx) => {
              if (group.type === 'SYSTEM') {
                return group.messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} currentUserId={currentUserId} />
                ));
              }

              const isOwnGroup = group.sender?.id === currentUserId;
              const groupTime = new Date(group.messages[group.messages.length - 1].createdAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={idx} className={`flex ${isOwnGroup ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%]">
                    {!isOwnGroup && group.sender && (
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {group.sender.firstName[0]}{group.sender.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{chatUserDisplayName(group.sender)}</p>
                          <p className="text-[11px] text-slate-400">{groupTime}</p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {group.messages.map((msg, messageIndex) => (
                        <ChatMessage
                          key={msg.id}
                          message={msg}
                          currentUserId={currentUserId}
                          showAvatar={!isOwnGroup && messageIndex === 0}
                          showSender={!isOwnGroup && messageIndex === 0}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-3" aria-live="polite">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {typingUsers[0].firstName[0]}{typingUsers[0].lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                      aria-hidden
                    />
                  ))}
                </span>
                <span className="text-xs text-slate-500">
                  {typingUsers.map(chatUserDisplayName).join(', ')}{' '}
                  {typingUsers.length === 1 ? 'is typing' : 'are typing'}
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} aria-hidden />
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput 
        onSend={handleSend} 
        onTyping={handleTyping} 
        disabled={!roomId}
        placeholder={roomId ? `Message #${roomName}` : 'Select a room to send messages'}
      />
    </div>
  );
};

export default ChatWindow;
