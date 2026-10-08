"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./interactions.module.css";

export function PortfolioMusic() {
  const player = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const selection = useRef(false);
  useEffect(() => {
    const element = player.current;
    if (!element) return;
    element.volume = 0;
    let starting = false;
    const timer = setInterval(() => {
      if (!selection.current && element.paused) return;
      const active = selection.current && !document.hidden && !document.querySelector("[data-room],[data-event-horizon]");
      const target = active ? .35 : 0;
      element.volume += (target - element.volume) * .15;
      if (active && element.paused && !starting) {
        starting = true;
        void element.play().catch(() => { selection.current = false; setEnabled(false); }).finally(() => { starting = false; });
      }
      if (!active && element.volume < .002) element.pause();
    }, 80);
    return () => { clearInterval(timer); element.pause(); };
  }, []);
  const toggle = () => {
    setUnavailable(false);
    if (!enabled && player.current) {
      if (player.current.error) player.current.load();
      player.current.volume = 0;
      void player.current.play().catch(() => { selection.current = false; setEnabled(false); });
    }
    selection.current = !enabled;
    setEnabled(!enabled);
  };
  return <>
    <button type="button" className={styles.music} aria-pressed={enabled} onClick={toggle} aria-label={enabled ? "Mute portfolio music" : "Play portfolio music"}>
      <span className={styles.wave} aria-hidden="true" data-playing={enabled}>{[0, 1, 2, 3].map(index => <i key={index} style={{ animationDelay: `${index * -.17}s` }} />)}</span>
      Music {enabled ? "on" : "off"}
    </button>
    <span className="sr-only" role="status">{unavailable ? "Music could not load. The website still works without sound." : ""}</span>
    <audio ref={player} src="/audio/work-in-progress.mp3" preload="none" loop data-portfolio-music onError={() => { selection.current = false; setEnabled(false); setUnavailable(true); }} />
  </>;
}
