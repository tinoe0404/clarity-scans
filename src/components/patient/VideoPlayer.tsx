/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  blobUrl: string;
  thumbnailUrl: string | null;
  accentColor: string;
  onVideoEnd: () => void;
  onError: (error: string) => void;
}

export default function VideoPlayer({
  blobUrl,
  thumbnailUrl,
  accentColor,
  onVideoEnd,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Buffering States
  const [isWaiting, setIsWaiting] = useState(false);

  // Throttling vars for timeupdate
  const lastTimeUpdateRef = useRef<number>(0);

  // Auto-hide controls mechanism
  const resetHideTimer = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    setShowControls(true);

    // Only auto-hide if actually playing and not in fullscreen natively demanding access
    if (isPlaying && !isFullscreen) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, isFullscreen]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [resetHideTimer]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch((err) => {
        console.error("Autoplay/Play prevented", err);
        onError("Playback could not be started.");
      });
    } else {
      videoRef.current.pause();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
    resetHideTimer();
  };

  const toggleFullscreen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen error:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    }
  };

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (document.fullscreenElement) {
        setShowControls(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  const handleTimeUpdate = () => {
    const now = Date.now();
    // Throttle to roughly ~250ms paints
    if (now - lastTimeUpdateRef.current > 250) {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
      lastTimeUpdateRef.current = now;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetHideTimer();
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleError = () => {
    const error = videoRef.current?.error;
    let msg = "Video could not be played — please ask the radiographer";

    if (error) {
      switch (error.code) {
        case 1:
          msg = "Playback aborted";
          break;
        case 2:
          msg = "Poor connection — check your Wi-Fi and try again";
          break; // MEDIA_ERR_NETWORK
        case 3:
          msg = "This video format is not supported on your device";
          break; // MEDIA_ERR_DECODE
        case 4:
          msg = "Video not found — please ask the radiographer";
          break; // MEDIA_ERR_SRC_NOT_FOUND
      }
    }
    onError(msg);
    setIsWaiting(false);
  };

  // Formatting utilities
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const seekFillPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-video w-full select-none overflow-hidden bg-black",
        isFullscreen && "h-screen"
      )}
      onClick={resetHideTimer}
      onMouseMove={resetHideTimer}
    >
      <video
        ref={videoRef}
        src={blobUrl}
        poster={thumbnailUrl || undefined}
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        onClick={togglePlay}
        onLoadedMetadata={() => {
          setDuration(videoRef.current?.duration || 0);
          setIsWaiting(false);
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onVideoEnd}
        onError={handleError}
        onWaiting={() => setIsWaiting(true)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsWaiting(false);
          // Kickstart the hide timer when play actually confirms executing
          if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
          hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowControls(true); // Always show when paused
        }}
        onStalled={() => {
          // Provide 2 seconds grace period before asserting stalled loading overlay
          setTimeout(() => {
            if (videoRef.current && videoRef.current.readyState < 3) {
              setIsWaiting(true);
            }
          }, 2000);
        }}
        aria-label="Educational video"
      />

      {/* Buffering Spinner Overlay */}
      {isWaiting && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"
          role="status"
          aria-label="Video loading"
        >
          <Spinner size="lg" className="text-white" />
        </div>
      )}

      {/* Custom Controls UI Layer */}
      <div
        className={cn(
          "absolute inset-0 z-30 flex flex-col justify-between p-4 transition-opacity duration-300",
          !showControls
            ? "pointer-events-none opacity-0"
            : "bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-100"
        )}
      >
        {/* Top Space Reservation */}
        <div className="min-h-6 flex-shrink-0" />

        {/* Center Big Play/Pause */}
        <div className="-mt-6 flex flex-1 items-center justify-center">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="h-10 w-10 fill-white text-white" />
            ) : (
              <Play className="ml-2 h-10 w-10 fill-white text-white" />
            )}
          </button>
        </div>

        {/* Bottom Bar: Timeline & Controls */}
        <div
          className="flex w-full flex-shrink-0 items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="w-10 shrink-0 text-right font-mono text-xs text-white/80">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onInput={handleSeek}
            aria-label="Video progress"
            aria-valuenow={currentTime}
            aria-valuemin={0}
            aria-valuemax={duration}
            className="h-3 flex-1 cursor-pointer appearance-none rounded-full bg-white/20"
            style={{
              background: `linear-gradient(to right, ${accentColor} ${seekFillPercentage}%, rgba(255,255,255,0.2) ${seekFillPercentage}%)`,
            }}
          />

          <span className="w-10 shrink-0 font-mono text-xs text-white/60">
            {formatTime(duration)}
          </span>

          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="-mr-2 p-2 text-white/80 transition-colors hover:text-white"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="-mr-2 p-2 text-white/80 transition-colors hover:text-white"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
