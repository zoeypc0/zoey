import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseVoiceProps {
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  onTranscript: (text: string) => void;
}

export const useVoice = ({ elevenLabsApiKey, elevenLabsVoiceId, onTranscript }: UseVoiceProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Speech recognition not supported in this browser');
      toast.error('Speech recognition not supported. Try Chrome or Edge.');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim();
        if (transcript) {
          onTranscript(transcript);
          stopListening();
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setVoiceError('Microphone access denied');
        toast.error('Please allow microphone access');
      } else if (event.error !== 'aborted') {
        setVoiceError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [onTranscript]);

  // Start listening
  const startListening = useCallback(async () => {
    setVoiceError(null);
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('Listening... Speak now');
      }
    } catch (err) {
      console.error('Failed to start listening:', err);
      setVoiceError('Could not access microphone');
      toast.error('Could not access microphone');
    }
  }, [initRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Play next audio in queue
  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    const audioUrl = audioQueueRef.current.shift()!;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      playNextInQueue();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      playNextInQueue();
    };

    audio.play().catch(console.error);
  }, []);

  // Text to speech using ElevenLabs
  const speak = useCallback(async (text: string) => {
    if (!elevenLabsApiKey) {
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    setIsSpeaking(true);
    setVoiceError(null);

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.message || 'ElevenLabs API error');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      audioQueueRef.current.push(audioUrl);
      
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    } catch (err) {
      console.error('TTS error:', err);
      setVoiceError(err instanceof Error ? err.message : 'Speech synthesis failed');
      setIsSpeaking(false);
      
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [elevenLabsApiKey, elevenLabsVoiceId, playNextInQueue]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    audioQueueRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    isPlayingRef.current = false;
  }, []);

  return {
    isListening,
    isSpeaking,
    voiceError,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
  };
};

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
