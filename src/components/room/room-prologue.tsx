"use client";

import { useEffect, useRef, useState } from "react";
import { discoveries, viewpointOrder, viewpointDiscovery, type Viewpoint } from "./room-content";
import type { RoomRenderer, RoomStatus } from "./room-renderer";
import styles from "./room.module.css";
import { RoomAudio } from "./room-audio";

const initialStatus: RoomStatus = { phase: "wake", target: null, inspection: null, locked: false, recovered: false, viewpoint: "desk" };

export function RoomPrologue({ complete, website }: { complete: () => void; website: () => HTMLElement | null }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<RoomRenderer | null>(null);
  const completion = useRef(complete);
  const reveal = useRef(website);
  const [status, setStatus] = useState(initialStatus);
  const [touch, setTouch] = useState(false);
  const [guided, setGuided] = useState(false);
  const audio = useRef<RoomAudio | null>(null);
  const [showEscape, setShowEscape] = useState(false);
  const showedEscape = useRef(false);
  const inspectionBack = useRef<HTMLButtonElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const lastInspection = useRef(false);
  useEffect(() => { completion.current = complete; reveal.current = website; }, [complete, website]);
  useEffect(() => {
    if (!status.locked || showedEscape.current) return;
    showedEscape.current = true;
    const show = window.setTimeout(() => setShowEscape(true), 0);
    const hide = window.setTimeout(() => setShowEscape(false), 4000);
    return () => { clearTimeout(show); clearTimeout(hide); setShowEscape(false); };
  }, [status.locked]);
  useEffect(() => {
    if (status.inspection) inspectionBack.current?.focus();
    else if (status.phase === "ready") enterButton.current?.focus();
    else if (lastInspection.current && status.phase === "explore") host.current?.querySelector<HTMLButtonElement>('[aria-current="location"], [data-resume-room]')?.focus();
    lastInspection.current = Boolean(status.inspection);
  }, [status.inspection, status.phase]);

  useEffect(() => {
    const node = host.current; const target = canvas.current;
    if (!node || !target) return;
    let disposed = false;
    let loadTimeout = 0;
    const roomAudio = new RoomAudio(); audio.current = roomAudio;
    const activateAudio = () => { void roomAudio.start().then(() => { if (!disposed) node.dataset.audio = "running"; }).catch(() => { if (!disposed) node.dataset.audio = "blocked"; }); };
    node.addEventListener("pointerdown", activateAudio); node.addEventListener("keydown", activateAudio);
    activateAudio();
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const choice = new URLSearchParams(location.search).get("motion");
    const reduced = choice === "reduced" || choice !== "full" && preference.matches;
    const useTouch = matchMedia("(pointer: coarse)").matches && !matchMedia("(any-pointer: fine)").matches;
    node.dataset.touch = String(useTouch); node.dataset.guided = String(useTouch || reduced); node.dataset.reduced = String(reduced);
    void import("./room-renderer").then(async module => {
      if (disposed) return;
      setTouch(useTouch);
      setGuided(useTouch || reduced);
      try {
        const instance = new module.RoomRenderer(target, node, useTouch, reduced, { status: setStatus, complete: () => completion.current(), failed: () => completion.current(), revealWebsite: () => reveal.current(), sound: kind => { if (kind === "power") roomAudio.powered(); else roomAudio.effect(kind); }, audioFrame: (position, forward, up, wake, handoff) => roomAudio.frame(position, forward, up, wake, handoff) });
        renderer.current = instance;
        loadTimeout = window.setTimeout(() => { if (!disposed) completion.current(); }, 15000);
        await instance.initialize();
        clearTimeout(loadTimeout);
      } catch (error) { console.error("Room unavailable; opening portfolio", error); completion.current(); }
    }).catch(() => completion.current());
    const changePreference = () => completion.current();
    preference.addEventListener("change", changePreference);
    const audioVisibility = () => roomAudio.visibility();
    document.addEventListener("visibilitychange", audioVisibility);
    return () => { disposed = true; clearTimeout(loadTimeout); preference.removeEventListener("change", changePreference); document.removeEventListener("visibilitychange", audioVisibility); node.removeEventListener("pointerdown", activateAudio); node.removeEventListener("keydown", activateAudio); renderer.current?.dispose(); renderer.current = null; roomAudio.dispose(); audio.current = null; };
  }, []);

  return <section className={styles.room} ref={host} data-room data-lenis-prevent aria-label="Aditya's work room">
    <canvas className={styles.canvas} ref={canvas} aria-label="First-person view of a quiet work room" />
    <div className={styles.white} aria-hidden="true" />
    <nav className={styles.utility} aria-label="Prologue options">
      <button type="button" onClick={() => renderer.current ? renderer.current.exit() : complete()}>Skip prologue ↗</button>
    </nav>
    {showEscape && <p className={styles.escapeHint}>Esc — release mouse</p>}
    {status.phase === "ready" && <div className={styles.entry}>
      <button ref={enterButton} type="button" onClick={() => { renderer.current?.enter(); if (guided) renderer.current?.guide("desk"); }}>Enter room <span aria-hidden="true">↗</span></button>
      <p>{guided ? "Choose a view · tap an object to look closer" : "WASD to move · mouse to look · E to inspect · Esc to release"}</p>
    </div>}
    {status.phase === "explore" && !guided && !status.locked && <div className={styles.resume}>
      <button type="button" data-resume-room aria-label="Resume mouse look" onClick={() => renderer.current?.enter()}>Mouse look ↗</button>
    </div>}
    {status.phase === "explore" && <div className={styles.reticle} aria-hidden="true"><span>·</span>{status.target && !touch && <span className={styles.target}>E</span>}</div>}
    {guided && status.phase === "explore" && <nav className={styles.viewpoints} aria-label="Room viewpoints">
      {viewpointOrder.map((viewpoint: Viewpoint) => <button key={viewpoint} type="button" aria-current={status.viewpoint === viewpoint ? "location" : undefined} onClick={() => renderer.current?.guide(viewpoint)}>{viewpoint === "wall" ? "Drawing" : viewpoint[0].toUpperCase() + viewpoint.slice(1)}</button>)}
      <button className={styles.inspectButton} type="button" disabled={!viewpointDiscovery[status.viewpoint]} onClick={() => renderer.current?.inspect(viewpointDiscovery[status.viewpoint])}>Look closer</button>
    </nav>}
    {status.phase === "inspect" && status.inspection && <div className={styles.inspection} role="dialog" aria-modal="false" aria-label={discoveries[status.inspection].label} onKeyDown={event => { if (event.key === "Escape" || event.code === "KeyE") { event.preventDefault(); renderer.current?.closeInspection(); } }}>
      <p className={styles.srOnly}>{discoveries[status.inspection].transcript}</p>
      {status.inspection === "notebook" && <button type="button" onClick={() => renderer.current?.turnNotebookPage()}>Other page</button>}
      {status.inspection === "computer" && <button type="button" disabled={status.recovering} onClick={() => status.recovered ? renderer.current?.openPortfolio() : renderer.current?.recover()}>{status.recovered ? "Open portfolio ↗" : status.recovering ? "Reading files…" : "Recover files"}</button>}
      <button ref={inspectionBack} type="button" onClick={() => renderer.current?.closeInspection()}>Back <span aria-hidden="true">/ Esc</span></button>
    </div>}
    <p className={styles.srOnly} aria-live="polite">{status.recovering ? "Reading local archive." : status.recovered && status.inspection === "computer" ? "Five project folders recovered. Open portfolio is available at the computer." : status.inspection ? discoveries[status.inspection].label : status.phase === "ready" ? "The fluorescent light has settled. You are standing in a small work room. Enter the room or skip to the portfolio." : ""}</p>
  </section>;
}
