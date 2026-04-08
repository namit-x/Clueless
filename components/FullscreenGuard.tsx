"use client";

import { useEffect, useState, useCallback } from "react";

interface FullscreenGuardProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export default function FullscreenGuard({
  children,
  enabled = true,
}: FullscreenGuardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen)
        await (el as any).webkitRequestFullscreen();
    } catch (err) {
      console.warn("Fullscreen request failed:", err);
    }
  }, []);

  const syncFullscreen = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Fullscreen change listeners
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);

    // Tab switch listener
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        setIsFullscreen(false);
      } else {
        syncFullscreen();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Sync initial state
    syncFullscreen();

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, syncFullscreen]);

  if (!enabled) return <>{children}</>;

  return (
    <div className="relative w-full h-full">
      {children}

      {!isFullscreen && (
        <div
          onClick={enterFullscreen}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-6 select-none cursor-pointer"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)",
            }}
          />
          <div className="relative flex flex-col items-center gap-6 text-center px-8">
            <div className="w-16 h-16 rounded-full border border-red-500/40 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-red-400 text-xs font-mono tracking-widest uppercase">
                Session Paused
              </p>
              <h1 className="text-white text-2xl font-bold tracking-tight">
                Fullscreen required
              </h1>
              <p className="text-zinc-500 text-sm max-w-xs">
                Do not use F11. Click anywhere to enter fullscreen.
              </p>
            </div>
            <div className="px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg">
              Enter GameArena
            </div>
          </div>
        </div>
      )}
    </div>
  );
}