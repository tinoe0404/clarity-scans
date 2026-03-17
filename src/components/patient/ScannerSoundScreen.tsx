"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useCallback } from "react";
import { Play, Square, Volume2 } from "lucide-react";
import clsx from "clsx";
import type { Locale } from "@/types";
import { AppShell } from "@/components/shared";
import PatientHeader from "./PatientHeader";
import TabNavigation from "./TabNavigation";

/**
 * Creates a realistic CT scanner sound using the Web Audio API.
 * Combines a low-frequency hum, mid-frequency buzz, and periodic clicking
 * to simulate the actual environment of a CT scanner room.
 */
function createScannerSound(audioCtx: AudioContext): GainNode {
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.35;

  // 1. Low-frequency hum (the base motor drone)
  const hum = audioCtx.createOscillator();
  const humGain = audioCtx.createGain();
  hum.type = "sawtooth";
  hum.frequency.value = 60;
  humGain.gain.value = 0.3;
  hum.connect(humGain).connect(masterGain);
  hum.start();

  // 2. Mid-frequency whirring/buzzing (the gantry rotation)
  const buzz = audioCtx.createOscillator();
  const buzzGain = audioCtx.createGain();
  buzz.type = "square";
  buzz.frequency.value = 180;
  buzzGain.gain.value = 0.15;
  buzz.connect(buzzGain).connect(masterGain);
  buzz.start();

  // 3. Higher pitch whine (X-ray tube sound)
  const whine = audioCtx.createOscillator();
  const whineGain = audioCtx.createGain();
  whine.type = "sine";
  whine.frequency.value = 420;
  whineGain.gain.value = 0.08;
  whine.connect(whineGain).connect(masterGain);
  whine.start();

  // 4. Rhythmic clicking (mechanical relay clicks) using white noise bursts
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;

  // Shape the noise into rhythmic clicks using an LFO on its gain
  const clickGain = audioCtx.createGain();
  clickGain.gain.value = 0;

  const clickLFO = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  clickLFO.type = "square";
  clickLFO.frequency.value = 3; // 3 clicks per second
  lfoGain.gain.value = 0.12;
  clickLFO.connect(lfoGain).connect(clickGain.gain);
  clickLFO.start();

  noise.connect(clickGain).connect(masterGain);
  noise.start();

  return masterGain;
}

interface ScannerSoundScreenProps {
  locale: Locale;
}

export default function ScannerSoundScreen({ locale }: ScannerSoundScreenProps) {
  const t = useTranslations("scannerSound");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleSound = useCallback(() => {
    if (isPlaying) {
      // Stop: close the audio context
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start: create a new audio context and wire everything up
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const masterNode = createScannerSound(ctx);
      masterNode.connect(ctx.destination);
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return (
    <AppShell locale={locale} className="flex h-screen flex-col overflow-hidden bg-surface-base">
      <PatientHeader
        locale={locale}
        title={t("title")}
        subtitle={t("subtitle")}
        showBack={true}
        backHref={`/${locale}/modules`}
      />

      <TabNavigation locale={locale} activeTab="scanner" />

      <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-col h-full px-6 py-8 sm:px-12 md:px-20 lg:max-w-4xl lg:mx-auto">
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
      </div>
    </AppShell>
  );
}
