import { X } from 'lucide-react';
import ChatMessage from './ChatMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

const ChatHistory = ({ isOpen, onClose, messages }: ChatHistoryProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border/30">
          <h2 className="text-lg font-semibold text-gradient">Full History</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>No conversation history yet</p>
              <p className="text-sm mt-2">Start chatting to see your history here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
