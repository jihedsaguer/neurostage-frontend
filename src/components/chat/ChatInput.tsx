import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip,
  Smile,
  Loader2
} from 'lucide-react';

interface Props {
  onSend: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
  isSending?: boolean;
}

/**
 * Modern chat input with:
 * - Auto-expanding textarea
 * - Typing indicators
 * - Attachment button (UI only for now)
 * - Emoji picker button (UI only for now)
 * - Send on Shift+Enter
 */
const ChatInput = ({ 
  onSend, 
  onTyping, 
  disabled = false,
  placeholder = 'Write a message…',
  isSending = false
}: Props) => {
  const [value, setValue] = useState('');
  const [rows, setRows] = useState(1);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea based on content
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Debounce typing event
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (newValue.trim()) {
        typingTimerRef.current = setTimeout(() => {
          onTyping();
        }, 300);
      }

      // Auto-expand textarea
      const lineCount = newValue.split('\n').length;
      setRows(Math.min(Math.max(lineCount, 1), 5));
    },
    [onTyping]
  );

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isSending) return;

    onSend(trimmed);
    setValue('');
    setRows(1);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    // Focus back to input
    textareaRef.current?.focus();
  }, [value, disabled, isSending, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Send on Enter (no shift). Newline on Shift+Enter.
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = !disabled && !isSending && value.trim().length > 0;

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 flex-shrink-0">
      <div className="flex items-end gap-3">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-slate-600 hover:bg-slate-100 flex-shrink-0"
          disabled={disabled}
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" aria-hidden />
        </Button>

        {/* Input */}
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent focus-within:bg-white">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            aria-label="Chat message input"
            className="flex-1 resize-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0 text-sm placeholder:text-slate-400"
          />
        </div>

        {/* Emoji button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-slate-600 hover:bg-slate-100 flex-shrink-0"
          disabled={disabled}
          aria-label="Add emoji"
        >
          <Smile className="h-4 w-4" aria-hidden />
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </div>

      <p className="text-xs text-slate-400 mt-2">
        {!disabled ? (
          <>Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Shift+Enter</kbd> for newline</>
        ) : (
          'Select a room to start chatting'
        )}
      </p>
    </div>
  );
};

export default ChatInput;
