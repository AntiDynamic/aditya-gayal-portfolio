"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { EntranceContext } from "../entrance/entrance-context";
import { RoomPrologue } from "./room-prologue";
import { ReplayIntroLink } from "./replay-intro-link";
import styles from "./room.module.css";

const completionKey = "aditya-room-complete-v1";
type Phase = "portfolio" | "black-hole" | "room";

export function ExperienceGate({ children, blackHole }: { children: ReactNode; blackHole: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("portfolio");
  const [handoff, setHandoff] = useState(false);
  const website = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("portfolio");

  const complete = useCallback(() => {
    try { sessionStorage.setItem(completionKey, "true"); } catch {}
    document.exitPointerLock?.();
    delete document.documentElement.dataset.prologuePending;
    delete document.documentElement.dataset.prologue;
    dispatchEvent(new CustomEvent("prologue-stage", { detail: "portfolio" }));
    document.body.style.removeProperty("overflow");
    phaseRef.current = "portfolio"; setPhase("portfolio"); setHandoff(false);
    requestAnimationFrame(() => {
      const target = location.hash ? document.getElementById(location.hash.slice(1)) : document.getElementById("hero-title");
      if (location.hash && target) target.scrollIntoView(); else scrollTo({ top: 0, behavior: "instant" });
      target?.focus({ preventScroll: true });
      dispatchEvent(new Event("resize"));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const activate = (next: Phase) => {
      phaseRef.current = next; setPhase(next);
      document.documentElement.dataset.prologue = next;
      dispatchEvent(new CustomEvent("prologue-stage", { detail: next }));
      delete document.documentElement.dataset.prologuePending;
      if (next === "room") { document.body.style.overflow = "hidden"; scrollTo({ top: 0, behavior: "instant" }); }
    };
    const query = new URLSearchParams(location.search);
    let completed = false;
    try { completed = sessionStorage.getItem(completionKey) === "true"; } catch { completed = true; }
    const bypass = Boolean(location.hash) || query.has("portfolio");
    if (!bypass && (!completed || query.has("replay") || query.has("room"))) {
      queueMicrotask(() => { if (!cancelled) activate(query.has("room") || matchMedia("(prefers-reduced-motion: reduce)").matches && query.get("motion") !== "full" ? "room" : "black-hole"); });
      void import("./room-renderer").then(module => module.preloadRoomAssets()).catch(() => {});
      void import("../motion/director").catch(() => {});
    } else delete document.documentElement.dataset.prologuePending;
    const whiteout = () => { if (phaseRef.current === "black-hole") activate("room"); };
    const directLink = () => { if (location.hash && phaseRef.current !== "portfolio") complete(); };
    addEventListener("event-horizon-whiteout", whiteout);
    addEventListener("event-horizon-skip", complete);
    addEventListener("hashchange", directLink);
    return () => { cancelled = true; removeEventListener("event-horizon-whiteout", whiteout); removeEventListener("event-horizon-skip", complete); removeEventListener("hashchange", directLink); document.body.style.removeProperty("overflow"); delete document.documentElement.dataset.prologue; };
  }, [complete]);

  const active = phase !== "portfolio";
  return <EntranceContext value={active && !handoff}>
    <script dangerouslySetInnerHTML={{ __html: `try{if(!location.hash&&!new URLSearchParams(location.search).has('portfolio')&&(sessionStorage.getItem('${completionKey}')!=='true'||/[?&](replay|room)(=|&|$)/.test(location.search)))document.documentElement.dataset.prologuePending='true'}catch{}` }} />
    <div className={styles.website} inert={active} aria-hidden={active || undefined}><div ref={website} inert={active} aria-hidden={active || undefined}>{children}</div></div>
    {phase === "black-hole" && <div data-prologue-black-hole>{blackHole}<button className={styles.blackHoleSkip} onClick={complete}>Skip prologue ↗</button></div>}
    {phase === "room" && <RoomPrologue complete={complete} website={() => { setHandoff(true); return website.current; }} />}
    {!active && <ReplayIntroLink className={styles.replay}>Replay prologue ↗</ReplayIntroLink>}
  </EntranceContext>;
}
