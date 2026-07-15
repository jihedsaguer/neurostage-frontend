import { useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle, Send, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useRagQueryMutation } from '@/redux/features/rag/ragApi';
import { useAiFeatures } from '@/lib/hooks/useAiFeatures';
import { getApiErrorMessage } from '@/lib/apiErrorMessage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { RagSource } from '@/types/rag.types';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSource[];
}

function SourceCitations({ sources }: { sources: RagSource[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!sources.length) return null;

  return (
    <div className="mt-2 space-y-1">
      {sources.map((source) => {
        const isOpen = expanded === source.documentName;
        return (
          <div key={source.documentName} className="text-xs">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : source.documentName)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600 hover:bg-slate-50"
            >
              {source.documentName}
              {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {isOpen && (
              <p className="mt-1 rounded-md bg-slate-100 p-2 text-slate-600 leading-relaxed">
                {source.excerpt}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-slate-100 w-fit">
      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

export function RagChatbot() {
  const { canUseRag } = useAiFeatures();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ragQuery, { isLoading }] = useRagQueryMutation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!canUseRag) return null;

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await ragQuery({ question }).unwrap();
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
        },
      ]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Service temporarily unavailable. Please try again.'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open NEUROSTAGE Assistant"
      >
        <MessageCircle className="h-5 w-5" />
        <span>Ask AI</span>
        <Badge variant="outline" className="text-purple-200 border-purple-300/50 bg-purple-900/20 text-[10px]">
          ✨ AI
        </Badge>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-[400px] flex flex-col p-0 gap-0">
          <SheetHeader className="px-6 py-4 border-b border-slate-200">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              NEUROSTAGE Assistant
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4 min-h-[200px]">
              {messages.length === 0 && !error && (
                <p className="text-sm text-slate-500 text-center py-8 px-4">
                  Ask me anything about internship procedures, conventions, or regulations.
                </p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-slate-100 text-slate-800',
                    )}
                  >
                    {msg.content}
                    {msg.role === 'assistant' && msg.sources && (
                      <SourceCitations sources={msg.sources} />
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 text-center space-y-2">
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={() => setError(null)}>
                    Dismiss
                  </Button>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-slate-200 p-4 flex gap-2">
            <Input
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default RagChatbot;
