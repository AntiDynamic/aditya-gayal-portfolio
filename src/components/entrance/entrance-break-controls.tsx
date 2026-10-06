"use client";

import { useEffect, useRef, useSyncExternalStore, type PointerEvent, type KeyboardEvent } from "react";
import { getBreakAssembly, inPolygon, type EntranceBreakStore, type Point } from "./entrance-break";
import styles from "./entrance.module.css";

export function EntranceBreakControls({ store }: { store: EntranceBreakStore }) {
  const plane = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ pointer: number; point: Point; time: number; speed: number } | null>(null);
  const sample = useRef<{ point: Point; time: number; speed: number } | null>(null);
  const state=useSyncExternalStore(store.subscribe,store.getSnapshot,store.getServerSnapshot);
  useEffect(() => {
    const cancel = () => { gesture.current = null; store.cancel(); };
    const visibility = () => { if (document.hidden) cancel(); };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", visibility);
    return () => { window.removeEventListener("blur", cancel); document.removeEventListener("visibilitychange", visibility); };
  }, [store]);

  const locate = (event: PointerEvent<HTMLButtonElement>, mobile: boolean): Point => {
    const rect = plane.current!.getBoundingClientRect();
    return [(event.clientX - rect.left) / rect.width * (mobile ? 390 : 1440), (event.clientY - rect.top) / rect.height * (mobile ? 844 : 1000)];
  };
  const down = (event: PointerEvent<HTMLButtonElement>, mobile: boolean) => {
    if (event.button !== 0 || gesture.current) return;
    const point = locate(event, mobile);
    if (store.begin(point, mobile, sample.current?.speed ?? 0, event.timeStamp)) {
      gesture.current = { pointer:event.pointerId, point, time:event.timeStamp, speed:0 };
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };
  const up = (event: PointerEvent<HTMLButtonElement>) => {
    if (gesture.current?.pointer !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const validRelease = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (validRelease) store.release(event.timeStamp); else store.cancel();
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>, mobile: boolean) => {
    if (event.key === " ") {
      event.preventDefault(); if (!event.repeat) store.begin(getBreakAssembly(mobile).hit, mobile, 0, event.timeStamp);
    }
  };
  const keyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " ") { event.preventDefault(); store.release(event.timeStamp); }
  };

  return <div ref={plane} className={styles.interactionPlane}>
    {[false, true].map(mobile => <button key={String(mobile)} type="button" className={`${styles.hitArea} ${mobile ? styles.mobileHit : styles.desktopHit}`}
      aria-label="Apply pressure to the enamel corner" aria-describedby="break-instructions"
      data-break-target={mobile ? "mobile" : "desktop"}
      data-charging={state.charging} data-open={state.phase==="detached"}
      onPointerDown={event => down(event, mobile)} onPointerUp={up}
      onPointerMove={event => {
        const point=locate(event,mobile), previous=sample.current, assembly=getBreakAssembly(mobile);
        sample.current={point,time:event.timeStamp,speed:previous && event.timeStamp>previous.time ? Math.hypot(point[0]-previous.point[0],point[1]-previous.point[1])/(event.timeStamp-previous.time) : 0};
        const bounds=event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--contact-x",`${event.clientX-bounds.left}px`);
        event.currentTarget.style.setProperty("--contact-y",`${event.clientY-bounds.top}px`);
        event.currentTarget.dataset.valid=String(inPolygon(...point,assembly.fragment.points) || Math.hypot(point[0]-assembly.focus[0],point[1]-assembly.focus[1])<(mobile?32:45));
      }}
      onPointerCancel={() => { gesture.current = null; store.cancel(); }}
      onLostPointerCapture={() => { gesture.current = null; store.cancel(); }}
      onKeyDown={event => keyDown(event, mobile)} onKeyUp={keyUp}
      onBlur={() => { gesture.current = null; store.cancel(); }}
      onClick={event => { if (event.detail === 0) { store.begin(getBreakAssembly(mobile).hit, mobile); store.release(); } }}>
      <span className={styles.contactFocus} aria-hidden="true" />
    </button>)}
  </div>;
}
