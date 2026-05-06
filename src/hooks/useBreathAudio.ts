import { useState, useEffect, useCallback, useRef } from "react";
import type { Locale } from "@/types";

type BreathCommand = "inhale" | "hold" | "exhale" | "complete";

/**
 * Audio file paths for pre-recorded voice-overs.
 * Place your recorded .mp3 files in /public/audio/breathhold/
 * 
 * Naming convention: {locale}-{command}.mp3
 * e.g. sn-inhale.mp3, nd-exhale.mp3
 */
const AUDIO_MAP: Record<string, Record<BreathCommand, string>> = {
  sn: {
    inhale: "/audio/breathhold/sn-inhale.mp3",
    hold: "/audio/breathhold/sn-hold.mp3",
    exhale: "/audio/breathhold/sn-exhale.mp3",
    complete: "/audio/breathhold/sn-complete.mp3",
  },
  nd: {
    inhale: "/audio/breathhold/nd-inhale.mp3",
    hold: "/audio/breathhold/nd-hold.mp3",
    exhale: "/audio/breathhold/nd-exhale.mp3",
    complete: "/audio/breathhold/nd-complete.mp3",
  },
};

interface UseBreathAudioReturn {
  isAvailable: boolean;
  isEnabled: boolean;
  isSpeaking: boolean;
  setEnabled: (enabled: boolean) => void;
  speak: (text: string, command?: BreathCommand) => void;
  cancel: () => void;
}

export function useBreathAudio(locale: Locale): UseBreathAudioReturn {
  const [isEnabled, setEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check availability
  useEffect(() => {
    // Pre-recorded audio is always available; speechSynthesis is a bonus for English
    setIsAvailable(true);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const playAudioFile = useCallback((src: string) => {
    cancel();

    const audio = new Audio(src);
    audioRef.current = audio;

    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.onerror = () => {
      console.warn(`[BreathAudio] Failed to play: ${src}, falling back to silent`);
      setIsSpeaking(false);
    };

    audio.play().catch((e) => {
      console.warn("[BreathAudio] Playback blocked:", e);
      setIsSpeaking(false);
    });
  }, [cancel]);

  const speakWithSynthesis = useCallback((text: string) => {
    if (!synthRef.current) return;

    cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);

      // For English, try to find a good voice
      const voices = synthRef.current.getVoices();
      const englishVoice =
        voices.find((v) => v.lang.startsWith("en-GB")) ||
        voices.find((v) => v.lang.startsWith("en-ZA")) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.default) ||
        voices[0];

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn("[BreathAudio] SpeechSynthesis error:", e);
    }
  }, [cancel]);

  const speak = useCallback(
    (text: string, command?: BreathCommand) => {
      if (!isEnabled) return;

      // For Shona and Ndebele, use pre-recorded audio files
      const audioMap = AUDIO_MAP[locale];
      if (audioMap && command) {
        const src = audioMap[command];
        if (src) {
          playAudioFile(src);
          return;
        }
      }

      // For English (or if no audio file found), use speechSynthesis
      speakWithSynthesis(text);
    },
    [isEnabled, locale, playAudioFile, speakWithSynthesis]
  );

  return {
    isAvailable,
    isEnabled,
    isSpeaking,
    setEnabled,
    speak,
    cancel,
  };
}
