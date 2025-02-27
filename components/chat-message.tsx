import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex w-full items-start gap-4 py-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn(
        "flex flex-col gap-2 rounded-lg border p-4 max-w-[80%]",
        isUser ? "bg-primary text-primary-foreground" : "bg-card"
      )}>
        <div className="whitespace-pre-wrap text-sm">
          {message.content}
        </div>
        {/* Client-side only rendering of timestamp to avoid hydration mismatch */}
        <div className="text-xs text-muted-foreground" suppressHydrationWarning>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}