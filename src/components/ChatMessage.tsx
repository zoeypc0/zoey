import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const ChatMessage = ({ role, content, isStreaming = false }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={cn(
      "animate-fade-in mb-4",
      isUser ? "flex justify-end" : "flex justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] px-4 py-3 rounded-2xl",
        isUser 
          ? "message-user rounded-br-md" 
          : "message-ai rounded-bl-md"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-current animate-typing" />
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
