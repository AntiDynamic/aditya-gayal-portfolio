"use client";

import { useEffect, useRef } from "react";
import { useEntranceActive } from "../entrance/entrance-context";
import styles from "./editorial.module.css";
import interactionStyles from "./interactions.module.css";
import { MediaViewer } from "./media-viewer";
import { PortfolioMusic } from "./music";

export function EditorialStage() {
  const host = useRef<HTMLDivElement>(null);
  const entrance = useEntranceActive();
  useEffect(() => {
    if (entrance || !host.current) return;
    const element = host.current;
    const root = element.closest<HTMLElement>("[data-editorial]")!;
    let cancelled = false;
    let director: { dispose: () => void } | undefined;
    void import("../motion/director").then(({ MotionDirector }) => {
      if (!cancelled) director = new MotionDirector(root, element);
    }).catch(() => { root.dataset.ready = "true"; root.dataset.fallback = "true"; });
    return () => { cancelled = true; director?.dispose(); };
  }, [entrance]);
  return <><div className={styles.backgroundField} data-background-field aria-hidden="true" /><div ref={host} className={styles.canvas} data-editorial-canvas aria-hidden="true" /><div className={interactionStyles.cursor} data-editorial-cursor aria-hidden="true"><span>Open</span></div><MediaViewer /><PortfolioMusic /></>;
}
