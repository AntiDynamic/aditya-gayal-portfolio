"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { audioSystem, blackHoleSoundLevel, closeAudioSystem, CosmicAudio } from "./audio-system";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
};


export function SoundtrackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const spaceRef = useRef<HTMLAudioElement>(null);
  const lightRef = useRef<HTMLAudioElement>(null);
  const [prologueActive, setPrologueActive] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const gains = useRef(new Map<HTMLAudioElement, GainNode>());
  const disposeTimer = useRef<number | undefined>(undefined);
  const cosmic = useRef<CosmicAudio | null>(null);

  useEffect(() => {
    clearTimeout(disposeTimer.current);
    const activeGains = gains.current;
    const visibility = () => { if (document.hidden) void audioContext.current?.suspend(); else void audioContext.current?.resume().catch(() => {}); };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      disposeTimer.current = window.setTimeout(() => { cosmic.current?.dispose(); cosmic.current = null; closeAudioSystem(); audioContext.current = null; activeGains.clear(); }, 0);
    };
  }, []);

  useEffect(() => {
    const stage = (event: Event) => setPrologueActive((event as CustomEvent<string>).detail === "room");
    addEventListener("prologue-stage", stage);
    return () => removeEventListener("prologue-stage", stage);
  }, []);

  const startTracks = useCallback(() => {
    const tracks = [spaceRef.current, lightRef.current].filter(
      (track): track is HTMLAudioElement => track !== null,
    );
    if (prologueActive) {
      tracks.forEach(track => { track.pause(); const gain = gains.current.get(track); if (gain) gain.gain.value = 0; });
      return;
    }
    if (!audioContext.current) audioContext.current = audioSystem().context;
    const context = audioContext.current;
    void context.resume().catch(() => {});
    const root = document.querySelector<HTMLElement>("[data-event-horizon]");
    const progress = Number(root?.dataset.progress ?? 0);
    const selected = root ? progress < 0.575 ? 0 : progress >= 0.943 ? 1 : -1 : -1;
    tracks.forEach((track, index) => {
      if (!gains.current.has(track)) {
        const gain = context.createGain(); gain.gain.value = 0;
        context.createMediaElementSource(track).connect(gain).connect(audioSystem().output);
        gains.current.set(track, gain);
      }
      delete track.dataset.blocked;
      if (index === selected && track.paused) void track.play().catch(() => { track.dataset.blocked = "true"; });
    });
  }, [prologueActive]);

  useEffect(() => {
    const activate = () => {
      if (!document.querySelector("[data-event-horizon],[data-room]")) return;
      if (!audioContext.current) audioContext.current = audioSystem().context;
      void audioContext.current.resume().catch(() => {});
      startTracks();
    };
    addEventListener("pointerdown", activate);
    addEventListener("keydown", activate);
    return () => { removeEventListener("pointerdown", activate); removeEventListener("keydown", activate); };
  }, [startTracks]);

  useEffect(() => {
    let fadeTimer: number | undefined;
    const update = () => {
      if (document.hidden || audioContext.current?.state !== "running") return;
      const root = document.querySelector<HTMLElement>("[data-event-horizon]");
      const active = !prologueActive && root !== null;
      if (active && !cosmic.current) cosmic.current = new CosmicAudio();
      cosmic.current?.update(Number(root?.dataset.progress ?? 0), active);
      if (!active && cosmic.current && fadeTimer === undefined) {
        fadeTimer = window.setTimeout(() => { cosmic.current?.dispose(); cosmic.current = null; fadeTimer = undefined; }, 900);
      } else if (active && fadeTimer !== undefined) { clearTimeout(fadeTimer); fadeTimer = undefined; }
    };
    const timer = window.setInterval(update, 40);
    update();
    return () => { clearInterval(timer); clearTimeout(fadeTimer); };
  }, [prologueActive]);


  useEffect(() => {
    const space = spaceRef.current;
    const light = lightRef.current;
    if (!space || !light) return;
    const tracks = [space, light];

    if (prologueActive) {
      tracks.forEach(track => { track.pause(); const gain = gains.current.get(track); if (gain) gain.gain.value = 0; });
      return;
    }

    let lastTime = performance.now();
    if (!document.hidden && audioContext.current?.state === "running") startTracks();

    const update = () => {
      if (document.visibilityState === "hidden") return;
      const root = document.querySelector<HTMLElement>("[data-event-horizon]");
      const isPlunge = root !== null;
      const p = isPlunge ? Number(root.dataset.progress ?? 0) : 0;
      const silence = isPlunge && blackHoleSoundLevel(p) === 0;
      const targets = [
        isPlunge && p < .575 ? .07 * (.25 + .75 * smooth(.03,.36,p)) * blackHoleSoundLevel(p) : 0,
        isPlunge ? .035 * smooth(.943,.985,p) : 0,
      ];
      const now = performance.now();
      const blend = 1-Math.exp(-clamp(now-lastTime,0,200)/450);
      lastTime = now;
      tracks.forEach((track,i) => {
        const gain = gains.current.get(track);
        if (gain) gain.gain.value = silence ? 0 : clamp(gain.gain.value+(targets[i]-gain.gain.value)*blend,0,.22);
        if (targets[i] > 0.001 && track.paused && gain && !track.dataset.blocked) void track.play().catch(() => { track.dataset.blocked = "true"; });
        if (targets[i] < 0.001 && (!gain || gain.gain.value < 0.001) && !track.paused) track.pause();
      });
    };

    const visibility = () => {
      if (document.visibilityState === "hidden") {
        tracks.forEach(track => track.pause());
      } else {
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
  }, [pathname, startTracks, prologueActive]);

  return (
    <>
      {children}
      <audio ref={spaceRef} src="/audio/threshold-airy.mp3" preload="none" loop />
      <audio ref={lightRef} src="/audio/threshold-light.mp3" preload="none" loop />
    </>
  );
}
