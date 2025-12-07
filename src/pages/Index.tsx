import { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, History, Send, Mic, Volume2, VolumeX } from 'lucide-react';
import AnimatedOrb from '@/components/AnimatedOrb';
import ChatMessage from '@/components/ChatMessage';
import SettingsPanel from '@/components/SettingsPanel';
import ChatHistory from '@/components/ChatHistory';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useAIProvider } from '@/hooks/useAIProvider';
import { useVoice } from '@/hooks/useVoice';
import { useTheme } from '@/hooks/useTheme';
import { useColorPalette } from '@/hooks/useColorPalette';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AppSettings {
  ollamaUrl: string;
  ollamaModel: string;
  geminiApiKey: string;
  groqApiKey: string;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  providerPriority: ('ollama' | 'gemini' | 'groq')[];
  voiceOutputEnabled: boolean;
}

const defaultSettings: AppSettings = {
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama2',
  geminiApiKey: '',
  groqApiKey: '',
  elevenLabsApiKey: '',
  elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
  providerPriority: ['ollama', 'gemini', 'groq'],
  voiceOutputEnabled: true,
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('zoey-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { theme, toggleTheme } = useTheme();
  const { palette, setPalette } = useColorPalette();
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { sendMessage, isLoading, activeProvider, error, clearError } = useAIProvider(settings);
  
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setInput(transcript);
    setTimeout(() => {
      const sendButton = document.getElementById('send-button');
      sendButton?.click();
    }, 100);
  }, []);

  const {
    isListening,
    isSpeaking,
    voiceError,
    toggleListening,
    speak,
    stopSpeaking,
  } = useVoice({
    elevenLabsApiKey: settings.elevenLabsApiKey,
    elevenLabsVoiceId: settings.elevenLabsVoiceId,
    onTranscript: handleVoiceTranscript,
  });

  useEffect(() => {
    localStorage.setItem('zoey-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (activeProvider) {
      toast.success(`Connected via ${activeProvider.toUpperCase()}`);
    }
  }, [activeProvider]);

  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStreamingContent('');
    setIsStreaming(true);
    clearError();

    const allMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    let fullResponse = '';

    await sendMessage(allMessages, (chunk, done) => {
      if (!done) {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      } else {
        setIsStreaming(false);
        if (fullResponse) {
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: fullResponse,
          };
          setMessages(prev => [...prev, assistantMessage]);
          setStreamingContent('');
          
          if (settings.voiceOutputEnabled) {
            speak(fullResponse);
          }
        }
      }
    });
  }, [input, isLoading, messages, sendMessage, clearError, settings.voiceOutputEnabled, speak]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    clearError();
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      setTimeout(() => {
        const sendButton = document.getElementById('send-button');
        sendButton?.click();
      }, 100);
    }
  }, [messages, clearError]);

  const toggleVoiceOutput = () => {
    setSettings(prev => ({ ...prev, voiceOutputEnabled: !prev.voiceOutputEnabled }));
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  const lastAIMessage = [...messages].reverse().find(m => m.role === 'assistant');

  const getStatusText = () => {
    if (isListening) return 'Listening...';
    if (isLoading) return 'Thinking...';
    if (isStreaming) return 'Speaking...';
    if (isSpeaking) return 'Reading aloud...';
    return 'Tap the mic to speak';
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Animated ambient background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />
      </div>

      {/* Header - Fixed */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 relative z-10">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="p-3 rounded-2xl glass-panel hover:scale-105 transition-all duration-300"
          title="View History"
        >
          <History className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <h1 className="text-2xl font-bold text-gradient tracking-tight">ZOEY</h1>
        
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 rounded-2xl glass-panel hover:scale-105 transition-all duration-300"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Main Content - Flexible, takes remaining space */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 min-h-0">
        {/* Status Text */}
        <div className="text-center mb-2 flex-shrink-0">
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            {getStatusText()}
          </p>
        </div>

        {/* Personalization Text */}
        <div className="text-center mb-3 flex-shrink-0">
          <p className="text-xs text-muted-foreground/70 font-light tracking-widest uppercase">
            Made only for you, <span className="text-primary font-medium">Punsara</span>
          </p>
        </div>

        {/* Animated Orb - Responsive size */}
        <div className="relative flex-shrink-0 mb-3">
          <AnimatedOrb 
            isListening={isListening} 
            isSpeaking={isStreaming || isSpeaking}
            size={Math.min(280, window.innerWidth * 0.65)}
            colorPalette={palette}
          />
          
          {isListening && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 voice-wave text-primary">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex-shrink-0 w-full max-w-md px-2">
            <ErrorDisplay
              error={error}
              onRetry={handleRetry}
              isRetrying={isLoading}
            />
          </div>
        )}

        {/* Chat Response Area - Scrollable */}
        {!error && (lastUserMessage || lastAIMessage || (isStreaming && streamingContent)) && (
          <div className="flex-1 w-full max-w-md min-h-0 overflow-y-auto scrollbar-thin px-2 py-2">
            <div className="space-y-3">
              {lastUserMessage && (
                <ChatMessage role="user" content={lastUserMessage.content} />
              )}
              {isStreaming && streamingContent && (
                <ChatMessage role="assistant" content={streamingContent} isStreaming />
              )}
              {!isStreaming && lastAIMessage && (
                <ChatMessage role="assistant" content={lastAIMessage.content} />
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Voice Output Toggle */}
        <button
          onClick={toggleVoiceOutput}
          className={`flex-shrink-0 mt-2 p-2 rounded-full glass-panel transition-all duration-300 ${
            settings.voiceOutputEnabled 
              ? 'text-primary' 
              : 'text-muted-foreground'
          }`}
          title={settings.voiceOutputEnabled ? 'Voice output on' : 'Voice output off'}
        >
          {settings.voiceOutputEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </main>

      {/* Input Dock - Always at bottom */}
      <footer className="flex-shrink-0 p-4 pb-6 relative z-10 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* Mic Button */}
          <button
            onClick={toggleListening}
            className={`p-4 voice-button flex-shrink-0 ${isListening ? 'listening' : ''}`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <Mic className="w-5 h-5 text-white" />
          </button>

          {/* Text Input */}
          <div className="flex-1 glass-panel flex items-center gap-3 px-4 py-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or speak..."
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
              disabled={isLoading || isListening}
            />
            
            <button
              id="send-button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {activeProvider && (
          <p className="text-center text-xs text-muted-foreground mt-2 tracking-wide">
            Connected via <span className="text-primary font-semibold">{activeProvider}</span>
          </p>
        )}
      </footer>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        theme={theme}
        onThemeChange={toggleTheme}
        colorPalette={palette}
        onColorPaletteChange={setPalette}
      />

      {/* Chat History */}
      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        messages={messages}
      />
    </div>
  );
};

export default Index;