import { useState, useEffect, useCallback, useRef } from "react";
import type { Locale } from "@/types";

interface UseSpeechSynthesisReturn {
  isAvailable: boolean;
  isEnabled: boolean;
  isSpeaking: boolean;
  setEnabled: (enabled: boolean) => void;
  speak: (text: string) => void;
  cancel: () => void;
}

export function useSpeechSynthesis(locale: Locale): UseSpeechSynthesisReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // 1. Availability and Population
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsAvailable(true);
      synthRef.current = window.speechSynthesis;
      
      const populateVoices = () => {
        if (synthRef.current) {
          setVoices(synthRef.current.getVoices());
        }
      };
      
      populateVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = populateVoices;
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const getBestVoice = useCallback((targetLocale: Locale) => {
    if (!voices.length) return null;

    let targetLang = "en-US"; // Default generic
    let fallbackLangs: string[] = [];
    
    if (targetLocale === "en") {
      targetLang = "en-ZW";
      fallbackLangs = ["en-GB", "en-ZA", "en-US"];
    } else if (targetLocale === "sn") {
      targetLang = "sn";
      fallbackLangs = ["sn-ZW", "en-ZW", "en-ZA", "en-GB"];
    } else if (targetLocale === "nd") {
      targetLang = "nd";
      fallbackLangs = ["nd-ZW", "en-ZW", "en-ZA", "en-GB"];
    }

    // Attempt direct match
    let voice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang.toLowerCase()));
    
    // Attempt fallback cascades sequence 
    if (!voice) {
      for (const fallback of fallbackLangs) {
        voice = voices.find(v => v.lang.toLowerCase().startsWith(fallback.toLowerCase()));
        if (voice) break;
      }
    }
    
    // Final generic hit mapped by OS default 
    if (!voice) {
      voice = voices.find(v => v.default) || voices[0];
    }

    return voice || null;
  }, [voices]);

  const cancel = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !isEnabled || !isAvailable) return;

    try {
      // Always forcibly halt any actively buffered lines avoiding pileups.
      cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getBestVoice(locale);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      // Spec driven timings
      utterance.rate = 0.85; 
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
      
    } catch (e) {
      // Failsafe guarding native binding panics entirely silently avoiding UI halts.
      console.warn("SpeechSynthesis catch:", e);
    }
  }, [isEnabled, isAvailable, locale, getBestVoice, cancel]);

  return {
    isAvailable,
    isEnabled,
    isSpeaking,
    setEnabled,
    speak,
    cancel
  };
}
