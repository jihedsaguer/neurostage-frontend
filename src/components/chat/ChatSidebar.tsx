import { useMemo, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { selectRooms, selectCurrentRoomId } from '@/redux/features/chat/chatSlice';
import { chatUserDisplayName } from '@/types/chat.types';
import type { ChatRoom } from '@/types/chat.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Hash, 
  Lock,
  Loader2 
} from 'lucide-react';

interface Props {
  onSelectRoom: (roomId: string) => void;
  onCreateRoom?: () => void;
  isLoading?: boolean;
  canCreateRoom?: boolean;
}

/**
 * Modern Slack-style chat sidebar with:
 * - Search functionality
 * - Room grouping (Stage rooms vs Custom)
 * - Last message preview
 * - Create room button (admin only)
 */
const ChatSidebar = ({ 
  onSelectRoom, 
  onCreateRoom, 
  isLoading = false,
  canCreateRoom = false 
}: Props) => {
  const rooms = useAppSelector(selectRooms);
  const currentRoomId = useAppSelector(selectCurrentRoomId);
  const [searchQuery, setSearchQuery] = useState('');

  // Group rooms by type
  const { stageRooms, customRooms } = useMemo(() => {
    const filtered = rooms.filter((room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      stageRooms: filtered.filter((r) => r.stageId),
      customRooms: filtered.filter((r) => !r.stageId),
    };
  }, [rooms, searchQuery]);

  const RoomButton = ({ room }: { room: ChatRoom }) => {
    const isActive = room.id === currentRoomId;
    const lastMsg = room.lastMessage;
    const timeAgo = lastMsg 
      ? formatTimeAgo(new Date(lastMsg.createdAt))
      : '';

    return (
      <button
        onClick={() => onSelectRoom(room.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`
          w-full text-left px-3 py-2.5 rounded-md transition-all
          hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500
          ${isActive ? 'bg-blue-100 text-blue-900' : 'text-slate-700 hover:bg-slate-100'}
        `}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Avatar */}
          <div
            className={`
              w-9 h-9 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5
              ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}
            `}
          >
            {room.stageId ? (
              <Hash className="h-4 w-4" aria-hidden />
            ) : (
              <Lock className="h-3 w-3" aria-hidden />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Room name */}
            <p
              className={`text-sm font-medium truncate ${
                isActive ? 'text-blue-900' : 'text-slate-900'
              }`}
            >
              {room.name}
            </p>

            {/* Last message preview */}
            {lastMsg ? (
              <p className={`text-xs truncate mt-1 ${
                isActive ? 'text-blue-700' : 'text-slate-500'
              }`}>
                <span className="font-medium">
                  {lastMsg.sender ? chatUserDisplayName(lastMsg.sender) : 'System'}:
                </span>
                {' '}
                {lastMsg.content}
              </p>
            ) : (
              <p className={`text-xs truncate mt-1 italic ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}>
                No messages yet
              </p>
            )}
          </div>

          {/* Timestamp */}
          {lastMsg && (
            <span className={`text-xs flex-shrink-0 whitespace-nowrap ml-2 ${
              isActive ? 'text-blue-600' : 'text-slate-400'
            }`}>
              {timeAgo}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <aside
      className="w-72 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full"
      aria-label="Chat rooms"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" aria-hidden />
            Messages
          </h2>
          {canCreateRoom && (
            <Button
              onClick={onCreateRoom}
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-blue-100"
              aria-label="Create new room"
            >
              <Plus className="h-4 w-4 text-blue-600" aria-hidden />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            type="text"
            placeholder="Search rooms…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Room list */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
              <span className="text-xs">Loading…</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 px-2 text-center">
              <MessageSquare className="h-8 w-8 mb-2 opacity-20" aria-hidden />
              <p className="text-xs font-medium text-slate-500">No rooms yet</p>
              {canCreateRoom && (
                <p className="text-xs text-slate-400 mt-1">
                  Create one to get started
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Stage Rooms Section */}
              {stageRooms.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1.5">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Stage Rooms
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {stageRooms.map((room) => (
                      <RoomButton key={room.id} room={room} />
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Rooms Section */}
              {customRooms.length > 0 && (
                <div>
                  <div className="px-2 py-1.5">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Custom Rooms
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {customRooms.map((room) => (
                      <RoomButton key={room.id} room={room} />
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {stageRooms.length === 0 && customRooms.length === 0 && searchQuery && (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-xs">No rooms match your search</p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

/**
 * Format date as relative time (e.g., "2m ago", "1h ago")
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default ChatSidebar;
