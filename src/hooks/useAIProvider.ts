import { useState, useCallback } from 'react';

interface Settings {
  ollamaUrl: string;
  ollamaModel: string;
  geminiApiKey: string;
  groqApiKey: string;
  providerPriority: ('ollama' | 'gemini' | 'groq')[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type StreamCallback = (chunk: string, done: boolean) => void;

export const useAIProvider = (settings: Settings) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const tryOllama = async (
    messages: Message[],
    onStream: StreamCallback
  ): Promise<boolean> => {
    if (!settings.ollamaUrl) return false;

    try {
      const response = await fetch(`${settings.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.ollamaModel || 'llama2',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!response.ok) throw new Error('Ollama request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              fullContent += json.message.content;
              onStream(json.message.content, false);
            }
            if (json.done) {
              onStream('', true);
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      setActiveProvider('ollama');
      return true;
    } catch (err) {
      console.log('Ollama failed, trying next provider...');
      return false;
    }
  };

  const tryGemini = async (
    messages: Message[],
    onStream: StreamCallback
  ): Promise<boolean> => {
    if (!settings.geminiApiKey) return false;

    try {
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${settings.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        }
      );

      if (!response.ok) throw new Error('Gemini request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onStream('', true);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Parse streaming JSON array
        const matches = buffer.match(/\{"candidates".*?\}\]/g);
        if (matches) {
          for (const match of matches) {
            try {
              const json = JSON.parse(match + '}');
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                onStream(text, false);
              }
            } catch {
              // Continue parsing
            }
          }
        }
      }

      setActiveProvider('gemini');
      return true;
    } catch (err) {
      console.log('Gemini failed, trying next provider...');
      return false;
    }
  };

  const tryGroq = async (
    messages: Message[],
    onStream: StreamCallback
  ): Promise<boolean> => {
    if (!settings.groqApiKey) return false;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!response.ok) throw new Error('Groq request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onStream('', true);
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onStream('', true);
            continue;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              onStream(content, false);
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      setActiveProvider('groq');
      return true;
    } catch (err) {
      console.log('Groq failed');
      return false;
    }
  };

  const sendMessage = useCallback(
    async (messages: Message[], onStream: StreamCallback) => {
      setIsLoading(true);
      setError(null);
      setActiveProvider(null);

      const providers: Record<string, typeof tryOllama> = {
        ollama: tryOllama,
        gemini: tryGemini,
        groq: tryGroq,
      };

      for (const providerName of settings.providerPriority) {
        const tryProvider = providers[providerName];
        if (tryProvider) {
          const success = await tryProvider(messages, onStream);
          if (success) {
            setIsLoading(false);
            return;
          }
        }
      }

      setError('All providers failed. Please check your settings.');
      setIsLoading(false);
      onStream('', true);
    },
    [settings]
  );

  return {
    sendMessage,
    isLoading,
    activeProvider,
    error,
    clearError,
  };
};
