"use client";

import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { WorldContext, type HeroBinding, type WorldRuntime } from "./world-context";
import { EntranceContext } from "./entrance-context";
import { EntranceFallback } from "./entrance-fallback";
import { EntranceBreakStore } from "./entrance-break";
import styles from "./entrance.module.css";

const EntranceScene = dynamic(() => import("./entrance-scene").then(m => m.EntranceScene), { ssr: false });
const SESSION_KEY = "aditya-surface-entered-v2";

class SurfaceBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** The threshold occupies real scroll distance. It never captures wheel/touch input. */
export function EntranceGate({ children }: { children: ReactNode }) {
  const runtime = useRef<WorldRuntime>({ hero: null, invalidate: null, passage: 0, unfolding: true });
  const [active, setActive] = useState(true);
  const [loadScene, setLoadScene] = useState(false);
  const [ready, setReady] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(true);
  // The pristine snapshot remains compatible with the authored SVG fallback.
  // Impact machinery is archived; no pressure targets are mounted.
  const [breakStore] = useState(() => new EntranceBreakStore());
  const surfaceRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const span = useRef(0);
  const finishRequested = useRef(false);
  const pendingFocus = useRef(false);
  const settleTween = useRef<gsap.core.Tween | null>(null);
  const startTween = useRef<gsap.core.Tween | null>(null);

  const bindHero = useCallback((binding: HeroBinding | null) => {
    runtime.current.hero = binding;
    runtime.current.invalidate?.();
  }, []);
  const wake = useCallback(() => runtime.current.invalidate?.(), []);
  const bindInvalidate = useCallback((fn: (() => void) | null) => { runtime.current.invalidate = fn; }, []);
  const complete = useCallback((focus = true) => {
    if (finishRequested.current) return;
    finishRequested.current = true;
    settleTween.current?.kill();
    startTween.current?.kill();
    runtime.current.passage = 1;
    pendingFocus.current = focus;
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* Storage is optional. */ }
    setActive(false);
  }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onLost = useCallback(() => { setFailed(true); setReady(false); setHeroReady(false); }, []);
  const onHeroReady = useCallback(() => setHeroReady(true), []);
  const worldValue = useMemo(() => ({ runtime, ready: (active ? ready : heroReady) && !failed && motionAllowed, bindHero, wake }),
    [active, ready, heroReady, failed, motionAllowed, bindHero, wake]);

  useLayoutEffect(() => {
    const track = spacerRef.current;
    if (!track) return;
    if (!active) {
      const removedHeight = track.getBoundingClientRect().height;
      const scroll = Math.max(0, window.scrollY - removedHeight);
      track.style.height = "0px";
      // Compensate the removed leading space in the same layout commit.
      // No jump is visible and native fling momentum can continue into the page.
      window.scrollTo({ top: scroll, behavior: "instant" });
      portfolioRef.current?.removeAttribute("inert");
      if (removedHeight > 0 && location.hash && location.hash !== "#top") {
        // Removing the leading track can race the browser's initial fragment
        // scroll. Resolve its real destination after the layout compensation.
        let targetId = location.hash.slice(1);
        try { targetId = decodeURIComponent(targetId); } catch { /* Literal ID. */ }
        document.getElementById(targetId)?.scrollIntoView({ behavior: "instant", block: "start" });
      }
      if (pendingFocus.current) {
        pendingFocus.current = false;
        document.getElementById("hero-title")?.focus({ preventScroll: true });
      }
      return;
    }
    const direct = !!location.hash && location.hash !== "#top";
    let returning = false;
    try { returning = sessionStorage.getItem(SESSION_KEY) === "1"; } catch { /* Optional. */ }
    const replay = new URLSearchParams(location.search).get("entrance") === "1";
    if (direct || (returning && !replay) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Bypasses never insert a track: the browser owns its initial fragment
      // positioning and does not have to race an inserted/removed spacer.
      complete(false);
      return;
    }
    span.current = Math.round(window.innerHeight * (window.innerWidth < 768 ? .95 : 1.1));
    track.style.height = `${span.current}px`;
    if (portfolioRef.current) portfolioRef.current.inert = true;
  }, [active, complete]);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setMotionAllowed(!preference.matches);
      if (preference.matches) { setReady(false); setHeroReady(false); }
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (active || !motionAllowed) return;
    const root = portfolioRef.current;
    if (!root) return;
    // The hero arrives on the same clock as the passage. CSS animation clocks
    // can remain paused while content is inert; all content defaults to visible.
    const context = gsap.context(() => {
      gsap.fromTo(".hero-title-stack", { y: 26, clipPath: "inset(0 0 48% 0)" },
        { y: 0, clipPath: "inset(0)", duration: .85, ease: "power3.out", clearProps: "transform,clipPath" });
      gsap.fromTo(".hero .eyebrow, .hero .intro-copy, .hero .hero-footer",
        { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .55, stagger: .10, delay: .12, ease: "power2.out", clearProps: "transform,opacity" });
    }, root);
    return () => context.revert();
  }, [active, motionAllowed]);

  useEffect(() => {
    if (!active) return;
    gsap.ticker.lagSmoothing(0);
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const paint = () => {
      const p = runtime.current.passage;
      const value = p.toFixed(5);
      surfaceRef.current?.style.setProperty("--passage", value);
      worldRef.current?.style.setProperty("--passage", value);
      if (surfaceRef.current) surfaceRef.current.dataset.opening = p > .12 ? "true" : "false";
      if (worldRef.current) worldRef.current.dataset.opening = p > .12 ? "true" : "false";
      runtime.current.invalidate?.();
      if (p > .999 && window.scrollY >= span.current - 1) complete();
    };
    const follow = gsap.quickTo(runtime.current, "passage", {
      duration: .38, ease: "power3.out", onUpdate: paint,
    });
    settleTween.current = follow.tween;
    const sample = () => follow(Math.max(0, Math.min(1, window.scrollY / Math.max(1, span.current))));
    const resize = () => {
      const previous = span.current;
      span.current = Math.round(window.innerHeight * (window.innerWidth < 768 ? .95 : 1.1));
      if (spacerRef.current) spacerRef.current.style.height = `${span.current}px`;
      if (previous && window.scrollY > 0) window.scrollTo({ top: window.scrollY / previous * span.current, behavior: "instant" });
      sample();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") complete();
      if (event.key === "Tab") {
        const controls = Array.from(surfaceRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
        if (!controls.length) return;
        const current = controls.indexOf(document.activeElement as HTMLButtonElement);
        if (current < 0 || (!event.shiftKey && current === controls.length - 1) || (event.shiftKey && current === 0)) {
          event.preventDefault();
          controls[event.shiftKey ? controls.length - 1 : 0].focus();
        }
      }
    };
    const interrupt = () => { startTween.current?.kill(); };
    const hash = () => { if (location.hash && location.hash !== "#top") complete(false); };
    const motion = () => { if (preference.matches) complete(); };
    const visible = () => { if (document.hidden) follow.tween.pause(); else sample(); };
    window.addEventListener("scroll", sample, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("hashchange", hash);
    document.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", visible);
    preference.addEventListener("change", motion);
    sample();
    return () => {
      follow.tween.kill(); startTween.current?.kill();
      window.removeEventListener("scroll", sample); window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", interrupt); window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("hashchange", hash); document.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", visible); preference.removeEventListener("change", motion);
    };
  }, [active, complete]);

  useEffect(() => {
    if (loadScene) return;
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) setLoadScene(true);
    }, { rootMargin: "100px" });
    if (active) {
      const timer = setTimeout(() => setLoadScene(true), 100);
      return () => clearTimeout(timer);
    }
    observer.observe(hero);
    return () => observer.disconnect();
  }, [active, loadScene]);

  const open = () => {
    if (startTween.current?.isActive()) return;
    const position = { y: window.scrollY };
    startTween.current = gsap.to(position, {
      y: span.current, duration: 1.8, ease: "power2.inOut",
      onUpdate: () => window.scrollTo({ top: position.y, behavior: "instant" }),
    });
  };

  return (
    <EntranceContext value={active}>
      <WorldContext value={worldValue}>
        <div ref={spacerRef} className={styles.thresholdTrack} aria-hidden="true" />
        {active && (
          <section ref={surfaceRef} className={`${styles.entrance} ${styles.unfoldEntrance}`} id="entrance-surface"
            role="dialog" aria-modal="true" aria-labelledby="entrance-title" aria-describedby="entrance-description">
            <h1 id="entrance-title" className="sr-only">Aditya Gayal. Strange questions. Useful systems.</h1>
            <p id="entrance-description" className="sr-only">
              Scroll or swipe to unfold the surface and enter my portfolio. Open the surface plays the same passage.
              Skip entrance and Escape give immediate access. No clicking or destruction is required.
            </p>
            <div className={styles.artwork} aria-hidden="true" data-renderer={ready && !failed ? "webgl" : "svg"}>
              <div className={styles.fallback} data-hidden={ready && !failed}>
                <EntranceFallback state={breakStore.getSnapshot()} unfolding />
              </div>
            </div>
            <header className={styles.masthead}>
              <p className={styles.name}>ADITYA<br />GAYAL<span>DEVELOPER / BUILDER</span></p>
              <button className={styles.skip} type="button" onClick={() => complete()}>Skip entrance <span aria-hidden="true">↗</span></button>
            </header>
            <div className={styles.interiorWords} aria-hidden="true">
              <span className={styles.interiorLabel}>THERE’S ALWAYS MORE</span>
              <p>UNDER<br /><i>THE SURFACE.</i></p>
              <span className={styles.interiorThought}>a question. a wrong turn. another way in.</span>
            </div>
            <footer className={styles.caption}>
              <p>Curiosity gets me started.<br />I stay until it makes sense.</p>
              <button className={styles.unfoldCue} type="button" onClick={open}>
                <span>SCROLL TO UNFOLD</span><span className={styles.cueArrow} aria-hidden="true">↓</span>
                <span className="sr-only">Open the surface automatically</span>
              </button>
            </footer>
          </section>
        )}
        {(active || loadScene) && motionAllowed && (
          <div id="portfolio-world" ref={worldRef} className={`${styles.world} ${styles.unfoldWorld}`} data-active={active}
            data-visible={active || heroReady} aria-hidden="true">
            {loadScene && !failed && <SurfaceBoundary onFail={onLost}>
              <EntranceScene onReady={onReady} onHeroReady={onHeroReady} onLost={onLost}
                breakStore={breakStore} runtime={runtime} onInvalidate={bindInvalidate}
                active={active} passing={active} />
            </SurfaceBoundary>}
          </div>
        )}
        <div id="portfolio-content" ref={portfolioRef} data-entrance-active={active} className={styles.portfolio}>{children}</div>
        <noscript><style>{`#entrance-surface,#portfolio-world{display:none!important} #portfolio-content *{animation:none!important}`}</style></noscript>
      </WorldContext>
    </EntranceContext>
  );
}
