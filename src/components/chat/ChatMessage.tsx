import type { ChatMessage as ChatMessageType } from '@/types/chat.types';
import { chatUserDisplayName, chatUserInitials } from '@/types/chat.types';

interface Props {
  message: ChatMessageType;
  currentUserId?: string;
  showAvatar?: boolean;
  showSender?: boolean;
}

/**
 * Renders a single chat message bubble.
 * Own messages are right-aligned and primary-colored.
 * Others are left-aligned with a muted background.
 * System messages are centered, gray, and italic.
 */
const ChatMessage = ({
  message,
  currentUserId,
  showAvatar = false,
  showSender = false,
}: Props) => {
  if (message.type === 'SYSTEM' || !message.sender) {
    return (
      <div className="flex justify-center my-2" role="status" aria-label={message.content}>
        <span className="text-xs text-slate-500 italic px-4 py-2 bg-slate-100 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const isOwn = message.sender.id === currentUserId;
  const displayName = chatUserDisplayName(message.sender);
  const initials = chatUserInitials(message.sender);
  const time = new Date(message.createdAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && showAvatar && (
          <div
            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0"
            aria-hidden
          >
            {initials}
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
          {showSender && !isOwn && (
            <span className="text-xs text-slate-500 font-semibold">{displayName}</span>
          )}

          <div
            className={`px-4 py-3 rounded-3xl text-sm leading-relaxed break-words ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
            }`}
          >
            {message.content}
          </div>

          <span className="text-[11px] text-slate-400 mt-1">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
