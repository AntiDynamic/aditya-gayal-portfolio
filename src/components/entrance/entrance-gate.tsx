"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  WorldContext,
  type HeroBinding,
  type WorldRuntime,
} from "./world-context";
import { EntranceContext } from "./entrance-context";
import { EntranceFallback } from "./entrance-fallback";
import styles from "./entrance.module.css";
import { EntranceBreakStore, BREAK_DESCRIPTIONS } from "./entrance-break";
import { EntranceBreakControls } from "./entrance-break-controls";

const EntranceScene = dynamic(
  () => import("./entrance-scene").then((module) => module.EntranceScene),
  {
    ssr: false,
    loading: () => null,
  },
);

class SurfaceBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function EntranceGate({ children }: { children: ReactNode }) {
  const runtime = useRef<WorldRuntime>({
    hero: null,
    invalidate: null,
    passage: 0,
  });
  const bindHero = useCallback((binding: HeroBinding | null) => {
    runtime.current.hero = binding;
    runtime.current.invalidate?.();
  }, []);
  const wake = useCallback(() => runtime.current.invalidate?.(), []);
  const bindInvalidate = useCallback((fn: (() => void) | null) => {
    runtime.current.invalidate = fn;
  }, []);
  const [passing, setPassing] = useState(false);
  const pendingFocus = useRef(false);
  const passageFrame = useRef<number | null>(null);
  const [active, setActive] = useState(true);
  const [loadScene, setLoadScene] = useState(false);
  const [ready, setReady] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [breakStore] = useState(() => new EntranceBreakStore());
  const breakState = useSyncExternalStore(
    breakStore.subscribe,
    breakStore.getSnapshot,
    breakStore.getServerSnapshot,
  );
  const skipRef = useRef<HTMLAnchorElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const complete = useCallback(() => {
    if (passageFrame.current !== null)
      cancelAnimationFrame(passageFrame.current);
    runtime.current.passage = 1;
    pendingFocus.current = true;
    setPassing(false);
    setActive(false);
  }, []);
  const enter = () => {
    if (passing) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      failed ||
      !ready
    ) {
      complete();
      return;
    }
    setPassing(true);
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1100);
      runtime.current.passage = p * p * (3 - 2 * p);
      runtime.current.invalidate?.();
      if (p < 1) passageFrame.current = requestAnimationFrame(tick);
      else complete();
    };
    passageFrame.current = requestAnimationFrame(tick);
  };
  useEffect(
    () => () => {
      if (passageFrame.current !== null)
        cancelAnimationFrame(passageFrame.current);
    },
    [],
  );
  const onReady = useCallback(() => setReady(true), []);
  const onLost = useCallback(() => {
    setFailed(true);
    setReady(false);
    setHeroReady(false);
  }, []);
  const onHeroReady = useCallback(() => setHeroReady(true), []);
  const worldValue = useMemo(
    () => ({
      runtime,
      ready: (active ? ready : heroReady) && !failed,
      bindHero,
      wake,
    }),
    [active, ready, heroReady, failed, bindHero, wake],
  );

  useEffect(() => {
    if (portfolioRef.current) portfolioRef.current.inert = active;
    if (!active && pendingFocus.current) {
      pendingFocus.current = false;
      document.getElementById("hero-title")?.focus({ preventScroll: true });
    }
  }, [active]);

  useEffect(() => {
    const isDirectLink = () =>
      window.location.hash && window.location.hash !== "#top";
    const onHashChange = () => {
      if (isDirectLink()) setActive(false);
    };
    window.addEventListener("hashchange", onHashChange);
    let assetHint: HTMLLinkElement | null = null;
    const timer = window.setTimeout(() => {
      if (isDirectLink()) {
        setActive(false);
      } else {
        assetHint = document.createElement("link");
        assetHint.rel = "preload";
        assetHint.as = "fetch";
        assetHint.crossOrigin = "anonymous";
        assetHint.href = `/entrance/models/entrance-break-${window.innerWidth < 768 ? "mobile" : "desktop"}.glb`;
        document.head.append(assetHint);
        setLoadScene(true);
      }
    }, 80);
    return () => {
      window.clearTimeout(timer);
      assetHint?.remove();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  useEffect(() => {
    if (active || loadScene) return;
    const hero = document.getElementById("top");
    if (!hero) return;
    let settled = !window.location.hash || window.location.hash === "#top";
    const sample = () => {
      if (!settled) return;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) setLoadScene(true);
    };
    const intent = () => {
      settled = true;
      sample();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => !e.isIntersecting)) settled = true;
        sample();
      },
      { rootMargin: "150px" },
    );
    observer.observe(hero);
    window.addEventListener("scroll", sample, { passive: true });
    window.addEventListener("wheel", intent, { passive: true });
    window.addEventListener("touchstart", intent, { passive: true });
    window.addEventListener("keydown", intent);
    window.addEventListener("hashchange", intent);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sample);
      window.removeEventListener("wheel", intent);
      window.removeEventListener("touchstart", intent);
      window.removeEventListener("keydown", intent);
      window.removeEventListener("hashchange", intent);
    };
  }, [active, loadScene]);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") complete();
      if (event.key === "Tab") {
        event.preventDefault();
        const buttons = Array.from(
          document.querySelectorAll<HTMLElement>("#entrance-surface button"),
        ).filter(
          (control) =>
            control.getClientRects().length &&
            !control.hasAttribute("disabled"),
        );
        const controls = skipRef.current
          ? [skipRef.current, ...buttons]
          : buttons;
        const current = controls.indexOf(document.activeElement as HTMLElement);
        controls[
          (current + (event.shiftKey ? -1 : 1) + controls.length) %
            controls.length
        ]?.focus();
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
      <WorldContext value={worldValue}>
        {active && (
          <section
            className={styles.entrance}
            id="entrance-surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="entrance-title"
            aria-describedby="entrance-description"
            data-break-phase={breakState.phase}
            data-passing={passing}
          >
            <h1 id="entrance-title" className="sr-only">
              Aditya Gayal. Strange questions. Useful systems.
            </h1>
            <p id="entrance-description" className="sr-only">
              A sculptural entrance to my portfolio. One enamel corner can be
              opened. Tab to Apply pressure, then Enter for a normal hit or hold
              and release Space for a stronger hit. Arrow keys preview surface
              tension. Skip is always available. Escape also skips.
            </p>
            <div
              className={styles.artwork}
              aria-hidden="true"
              data-renderer={ready && !failed ? "webgl" : "svg"}
            >
              <div className={styles.fallback} data-hidden={ready && !failed}>
                <EntranceFallback state={breakState} />
              </div>
            </div>
            {!passing && <EntranceBreakControls store={breakStore} />}
            <p id="break-instructions" className="sr-only">
              Press the enamel corner. Enter applies pressure. Hold and release
              Space or a pointer for a stronger impact. Skip or Escape enters
              the portfolio immediately.
            </p>
            <header className={styles.masthead}>
              <p className={styles.name}>
                ADITYA
                <br />
                GAYAL<span>DEVELOPER / BUILDER</span>
              </p>
              <a
                ref={skipRef}
                className={styles.skip}
                href="#top"
                onClick={complete}
              >
                Skip entrance <span aria-hidden="true">↗</span>
              </a>
            </header>
            <footer className={styles.caption}>
              <p>
                Strange questions are where I start.
                <br />
                Making something real is why I stay.
              </p>
              <div className={styles.breakNotes}>
                <p className="sr-only" aria-live="polite" aria-atomic="true">
                  {breakState.note || BREAK_DESCRIPTIONS[breakState.phase]}
                </p>
                {breakState.damage === 0 && (
                  <span className={styles.discovery}>Break through.</span>
                )}
                {breakState.note && (
                  <span className={styles.marginNote}>{breakState.note}</span>
                )}
                {breakState.phase === "detached" && (
                  <button
                    className={styles.enter}
                    type="button"
                    onClick={enter}
                    disabled={passing}
                  >
                    Come through <span aria-hidden="true">↗</span>
                  </button>
                )}
                {breakState.damage > 0 && !passing && (
                  <button
                    type="button"
                    className={styles.reset}
                    aria-label="Restore the entrance surface"
                    title="Restore surface"
                    onClick={() => {
                      breakStore.reset();
                      skipRef.current?.focus();
                    }}
                  >
                    <span aria-hidden="true">↺</span>
                  </button>
                )}
              </div>
            </footer>
          </section>
        )}
        {loadScene && !failed && (
          <div
            className={styles.world}
            data-active={active}
            data-passing={passing}
            data-visible={active || heroReady}
            aria-hidden="true"
          >
            <SurfaceBoundary onFail={onLost}>
              <EntranceScene
                onReady={onReady}
                onHeroReady={onHeroReady}
                onLost={onLost}
                breakStore={breakStore}
                runtime={runtime}
                onInvalidate={bindInvalidate}
                active={active}
                passing={passing}
              />
            </SurfaceBoundary>
          </div>
        )}
        <div
          id="portfolio-content"
          ref={portfolioRef}
          data-entrance-active={active}
          className={styles.portfolio}
        >
          {children}
        </div>
        <noscript>
          <style>{`#entrance-surface{display:none!important} #portfolio-content *{animation:none!important}`}</style>
          <p className={styles.noScript}>
            JavaScript is off. <a href="#top">Read Aditya’s portfolio →</a>
          </p>
        </noscript>
      </WorldContext>
    </EntranceContext>
  );
}
