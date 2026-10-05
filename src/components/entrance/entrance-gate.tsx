"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { EntranceContext } from "./entrance-context";
import { EntranceFallback } from "./entrance-fallback";
import styles from "./entrance.module.css";

const EntranceScene = dynamic(() => import("./entrance-scene").then((module) => module.EntranceScene), {
  ssr: false,
  loading: () => null,
});

class SurfaceBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function EntranceGate({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(true);
  const [loadScene, setLoadScene] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const skipRef = useRef<HTMLAnchorElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const complete = useCallback(() => {
    setActive(false);
    requestAnimationFrame(() => {
      document.getElementById("hero-title")?.focus({ preventScroll: true });
    });
  }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onLost = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    if (portfolioRef.current) portfolioRef.current.inert = active;
  }, [active]);

  useEffect(() => {
    const isDirectLink = () => window.location.hash && window.location.hash !== "#top";
    const onHashChange = () => { if (isDirectLink()) setActive(false); };
    window.addEventListener("hashchange", onHashChange);
    const timer = window.setTimeout(() => {
      if (isDirectLink()) setActive(false);
      else setLoadScene(true);
    }, 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") complete();
      // There is only one actionable entrance control in the static stage.
      if (event.key === "Tab") {
        event.preventDefault();
        skipRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [active, complete]);

  return (
    <EntranceContext value={active}>
      {active && (
        <section className={styles.entrance} id="entrance-surface" role="dialog" aria-modal="true" aria-labelledby="entrance-title" aria-describedby="entrance-description">
          <h1 id="entrance-title" className="sr-only">Aditya Gayal. Strange questions. Useful systems.</h1>
          <p id="entrance-description" className="sr-only">A sculptural entrance to my portfolio. This is a static visual study. Skip the entrance to read about me, my interests, and my work. Escape also skips.</p>
          <div className={styles.artwork} aria-hidden="true" data-renderer={ready && !failed ? "webgl" : "svg"}>
            <div className={styles.fallback} data-hidden={ready && !failed}><EntranceFallback /></div>
            {loadScene && !failed && <div className={styles.scene}><SurfaceBoundary onFail={onLost}><EntranceScene onReady={onReady} onLost={onLost} /></SurfaceBoundary></div>}
          </div>
          <header className={styles.masthead}>
            <p className={styles.name}>ADITYA<br />GAYAL<span>DEVELOPER / BUILDER</span></p>
            <a ref={skipRef} className={styles.skip} href="#top" onClick={complete}>Skip entrance <span aria-hidden="true">↗</span></a>
          </header>
          <div className={styles.marginNote} aria-hidden="true"><span>THERE’S MORE</span><span>BENEATH THE SURFACE.</span></div>
          <footer className={styles.caption}>
            <p>Strange questions are where I start.<br />Making something real is why I stay.</p>
            <span className={styles.stageNote}>01 / THE SURFACE<span>STATIC STUDY</span></span>
          </footer>
        </section>
      )}
      <div id="portfolio-content" ref={portfolioRef} data-entrance-active={active} className={styles.portfolio}>{children}</div>
      <noscript><style>{`#entrance-surface{display:none!important} #portfolio-content *{animation:none!important}`}</style><p className={styles.noScript}>JavaScript is off. <a href="#top">Read Aditya’s portfolio →</a></p></noscript>
    </EntranceContext>
  );
}
