"use client";

import { useTranslations } from "next-intl";
import { useState, useRef } from "react";
import { Play, Square, Volume2 } from "lucide-react";
import clsx from "clsx";

interface ScannerSoundScreenProps {
  locale: string;
}

export default function ScannerSoundScreen({ locale }: ScannerSoundScreenProps) {
  const t = useTranslations("scannerSound");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset
    } else {
      audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col h-full bg-surface-base px-6 py-8 sm:px-12 md:px-20 lg:max-w-4xl lg:mx-auto">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src="/audio/ct-scanner-sound.mp3"
        loop
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-brand-light/10 text-brand-dark rounded-xl">
          <Volume2 className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{t("title")}</h1>
          <p className="text-lg text-slate-300 mt-1">{t("subtitle")}</p>
        </div>
      </div>

      <div className="bg-surface-elevated rounded-3xl p-6 sm:p-10 border border-slate-700/50 shadow-xl mb-12">
        <p className="text-slate-300 text-lg sm:text-xl leading-relaxed">
          {t("description")}
        </p>
      </div>

      {/* Interactive Player Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
        {/* Pulsing Visualizer background when playing */}
        <div className="relative flex items-center justify-center mb-12">
          {isPlaying && (
            <>
              <div className="absolute inset-0 bg-brand-base/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 bg-brand-base/10 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            </>
          )}

          {/* Main Button */}
          <button
            onClick={toggleSound}
            className={clsx(
              "relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-300 shadow-2xl",
              isPlaying 
                ? "bg-slate-800 text-brand-light border-4 border-brand-base hover:bg-slate-700"
                : "bg-brand-base text-white hover:bg-brand-light hover:scale-105"
            )}
            aria-label={isPlaying ? t("stop") : t("play")}
          >
            {isPlaying ? (
              <>
                <Square className="h-16 w-16 fill-current" />
                <span className="font-semibold text-lg">{t("stop")}</span>
              </>
            ) : (
              <>
                <Play className="h-16 w-16 fill-current ml-2" />
                <span className="font-semibold text-lg">{t("play")}</span>
              </>
            )}
          </button>
        </div>
        
        {/* Status Text */}
        <p className={clsx(
          "text-xl font-medium transition-opacity duration-300",
          isPlaying ? "text-brand-light opacity-100" : "text-transparent opacity-0"
        )}>
          {t("playing")}
        </p>
      </div>
    </div>
  );
}
