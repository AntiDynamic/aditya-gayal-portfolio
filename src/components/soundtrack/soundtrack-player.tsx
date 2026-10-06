"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./soundtrack-player.module.css";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
};

type SoundtrackState = { enabled: boolean; unavailable: boolean; toggle: () => void };
const SoundtrackContext = createContext<SoundtrackState | null>(null);

export function SoundtrackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const spaceRef = useRef<HTMLAudioElement>(null);
  const portfolioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const optedIn = useRef(false);

  const startTracks = useCallback(() => {
    const tracks = [spaceRef.current, portfolioRef.current].filter(
      (track): track is HTMLAudioElement => track !== null,
    );
    tracks.forEach((track) => {
      if (track.paused) track.volume = 0;
      void track.play().catch(() => setUnavailable(true));
    });
  }, []);

  const toggle = () => {
    if (enabled) {
      optedIn.current = false;
      setEnabled(false);
      return;
    }

    setUnavailable(false);
    optedIn.current = true;
    startTracks();
    setEnabled(true);
  };

  useEffect(() => {
    const space = spaceRef.current;
    const portfolio = portfolioRef.current;
    if (!space || !portfolio) return;

    if (!enabled) {
      space.pause();
      portfolio.pause();
      space.volume = 0;
      portfolio.volume = 0;
      return;
    }

    let spaceVolume = space.volume;
    let portfolioVolume = portfolio.volume;
    let lastTime = performance.now();

    const update = () => {
      if (document.visibilityState === "hidden") return;

      const progressRoot = document.querySelector<HTMLElement>("[data-event-horizon]");
      const isPlunge = pathname === "/lab/event-horizon" && progressRoot !== null;
      const progress = isPlunge ? Number(progressRoot.dataset.progress ?? 0) : 0;

      const gravity = 1 - smooth(0.70, 0.845, progress);
      const spaceTarget = isPlunge
        ? 0.22 * (0.22 + 0.78 * smooth(0.025, 0.32, progress)) * gravity
        : 0;
      const portfolioTarget = isPlunge
        ? 0.13 * smooth(0.865, 0.95, progress)
        : 0.13;

      const now = performance.now();
      const dt = clamp(now - lastTime, 0, 200);
      lastTime = now;
      const blend = 1 - Math.exp(-dt / 640);
      spaceVolume += (spaceTarget - spaceVolume) * blend;
      portfolioVolume += (portfolioTarget - portfolioVolume) * blend;
      space.volume = clamp(spaceVolume, 0, 0.24);
      portfolio.volume = clamp(portfolioVolume, 0, 0.15);
    };

    const visibility = () => {
      if (document.visibilityState === "hidden") {
        space.pause();
        portfolio.pause();
      } else if (optedIn.current) {
        startTracks();
      }
    };
    const timer = window.setInterval(update, 40);
    document.addEventListener("visibilitychange", visibility);
    update();

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled, pathname, startTracks]);

  const value = { enabled, unavailable, toggle };
  return (
    <SoundtrackContext.Provider value={value}>
      {children}
      <audio ref={spaceRef} src="/audio/event-horizon-score.mp3" preload="none" loop />
      <audio ref={portfolioRef} src="/audio/portfolio-ambience.mp3" preload="none" loop />
    </SoundtrackContext.Provider>
  );
}

export function SoundtrackControl({
  variant,
  className = "",
}: {
  variant: "site" | "threshold";
  className?: string;
}) {
  const soundtrack = useContext(SoundtrackContext);
  if (!soundtrack) throw new Error("SoundtrackControl must be inside SoundtrackProvider");

  const { enabled, unavailable, toggle } = soundtrack;
  return (
    <button
      className={`${styles.button} ${variant === "site" ? styles.siteButton : styles.thresholdButton} ${className}`}
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={unavailable && !enabled ? "Retry optional background music" : `${enabled ? "Turn off" : "Turn on"} optional background music`}
    >
      <span className={styles.mark} aria-hidden="true"><i /><i /><i /></span>
      <span className={styles.label}>SOUND</span>
      <span className={styles.state}>{unavailable ? "RETRY" : enabled ? "ON" : "OFF"}</span>
    </button>
  );
}
