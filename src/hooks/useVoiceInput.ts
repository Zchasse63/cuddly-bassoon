/* eslint-disable react-hooks/set-state-in-effect */
'use client';

/**
 * Voice Input Hook
 *
 * Speech-to-text functionality using Web Speech API
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { onTranscript, onError, language = 'en-US', continuous = false } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // webkitSpeechRecognition is a vendor-prefixed API not in standard TypeScript types
      type SpeechRecognitionConstructor = new () => SpeechRecognition;
      const windowWithWebkit = window as Window &
        typeof globalThis & { webkitSpeechRecognition?: SpeechRecognitionConstructor };
      const SpeechRecognitionAPI: SpeechRecognitionConstructor | undefined =
        window.SpeechRecognition || windowWithWebkit.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognitionAPI);

      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        const recognition = recognitionRef.current;

        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const alternative = result?.[0];
            if (!alternative) continue;

            const transcriptPiece = alternative.transcript;
            if (result.isFinal) {
              finalTranscript += transcriptPiece + ' ';
            } else {
              interimTranscript += transcriptPiece;
            }
          }

          const fullTranscript = (finalTranscript || interimTranscript).trim();
          setTranscript(fullTranscript);

          if (finalTranscript && onTranscript) {
            onTranscript(finalTranscript.trim());
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          const errorMessage = getSpeechErrorMessage(event.error);
          setError(errorMessage);
          setIsListening(false);
          if (onError) {
            onError(errorMessage);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = 'Speech recognition is not supported in your browser';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        setError(null);
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        const errorMsg = 'Failed to start speech recognition';
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    }
  }, [isSupported, isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

function getSpeechErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'No microphone found. Please check your microphone.';
    case 'not-allowed':
      return 'Microphone permission denied. Please allow microphone access.';
    case 'network':
      return 'Network error. Please check your connection.';
    case 'aborted':
      return 'Speech recognition aborted.';
    default:
      return `Speech recognition error: ${error}`;
  }
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
