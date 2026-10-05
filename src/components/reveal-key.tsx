"use client";

import dynamic from "next/dynamic";
import {
  Component,
  type ErrorInfo,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { thoughtStates } from "./thought-states";

type MotionState = { progress: number; velocity: number };

const RevealScene = dynamic(() => import("./reveal-scene").then((module) => module.RevealScene), {
  ssr: false,
  loading: () => null,
});

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Reveal Key WebGL scene failed; keeping the SVG version active.", error, info.componentStack);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const anchors = thoughtStates.map((_, index) => index / (thoughtStates.length - 1));
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function RevealKey() {
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const apertureRef = useRef<SVGPathElement>(null);
  const mapRef = useRef<SVGGElement>(null);
  const fallbackRef = useRef<SVGSVGElement>(null);
  const motionRef = useRef<MotionState>({ progress: 0, velocity: 0 });
  const selectedRef = useRef(0);
  const visibleRef = useRef(true);
  const targetRef = useRef(0);
  const springVelocityRef = useRef(0);
  const velocityRef = useRef({ x: 0, time: 0 });
  const frameRef = useRef<number | null>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const pointerDownRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const introTimerRef = useRef<number | null>(null);
  const interactionStartedRef = useRef(false);
  const [selected, setSelected] = useState(0);
  const [webgl, setWebgl] = useState(false);
  const [loadScene, setLoadScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [dpr, setDpr] = useState(1.2);

  const updateDOM = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const progress = motionRef.current.progress;
    const mobile = stage.getBoundingClientRect().width < 640;
    const x = mobile ? 24 + progress * 48 : 14 + progress * 68;
    const y = 51 - Math.sin(progress * Math.PI) * 30;
    const velocity = motionRef.current.velocity;
    const layerShift = clamp(velocity * 28, -24, 24);
    const typePull = mobile
      ? clamp(velocity * 15 + progress * 16, -16, 16)
      : clamp(velocity * 44 + progress * 62, -44, 44);
    const color = thoughtStates[selectedRef.current].color;

    stage.style.setProperty("--reveal-progress", `${progress}`);
    stage.style.setProperty("--key-x", `${x}%`);
    stage.style.setProperty("--key-y", `${y}%`);
    stage.style.setProperty("--key-rotation", `${-13 + progress * 24 + clamp(velocity * 8, -12, 12)}deg`);
    stage.style.setProperty("--layer-shift", `${layerShift}px`);
    stage.style.setProperty("--thought-color", color);
    mapRef.current?.setAttribute("transform", mobile ? "translate(180 0) scale(.6 1)" : "translate(55 0) scale(.85 1)");
    if (heroRef.current) {
      heroRef.current.style.setProperty("--reveal-progress", `${progress}`);
      heroRef.current.style.setProperty("--thought-color", color);
      heroRef.current.style.setProperty("--type-pull", `${typePull}px`);
      heroRef.current.style.setProperty("--type-lift", `${clamp(Math.abs(velocity) * -9, -9, 0)}px`);
    }
    if (apertureRef.current) {
      apertureRef.current.setAttribute("transform", `translate(${x * 10} ${y * 4.2}) rotate(${-13 + progress * 26}) scale(${mobile ? 1.2 : 1.7})`);
    }
    if (fallbackRef.current) fallbackRef.current.style.setProperty("--key-color", color);
    if (visibleRef.current) invalidateRef.current?.();
  }, []);

  const animateTo = useCallback((next: number, settle = false) => {
    targetRef.current = clamp(next, 0, 1);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (reducedMotionRef.current) {
      motionRef.current.progress = targetRef.current;
      motionRef.current.velocity = 0;
      updateDOM();
      return;
    }
    springVelocityRef.current = 0;
    let previous = performance.now();
    const tick = (time: number) => {
      const delta = Math.min((time - previous) / 1000, .04);
      previous = time;
      const current = motionRef.current.progress;
      const destination = targetRef.current;
      const stiffness = settle ? 190 : 145;
      const damping = settle ? 25 : 22;
      const acceleration = (destination - current) * stiffness - springVelocityRef.current * damping;
      springVelocityRef.current += acceleration * delta;
      const nextProgress = current + springVelocityRef.current * delta;
      motionRef.current.velocity = springVelocityRef.current;
      motionRef.current.progress = nextProgress;
      updateDOM();

      if (Math.abs(destination - nextProgress) > .001 || Math.abs(springVelocityRef.current) > .008) frameRef.current = requestAnimationFrame(tick);
      else {
        motionRef.current.progress = destination;
        motionRef.current.velocity = 0;
        springVelocityRef.current = 0;
        updateDOM();
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [updateDOM]);

  const chooseThought = useCallback((index: number) => {
    const safeIndex = clamp(index, 0, thoughtStates.length - 1);
    selectedRef.current = safeIndex;
    setSelected(safeIndex);
    animateTo(anchors[safeIndex], true);
  }, [animateTo]);

  const markInteraction = useCallback(() => {
    interactionStartedRef.current = true;
    if (introTimerRef.current !== null) {
      window.clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = reduced.matches;
    const supportsWebgl = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("webgl2");
        if (!context) return false;
        context.getExtension("WEBGL_lose_context")?.loseContext();
        return true;
      } catch {
        return false;
      }
    };
    const idle = window.setTimeout(() => {
      const available = supportsWebgl() && !reduced.matches;
      setWebgl(available);
      setLoadScene(available);
    }, 650);
    const onMotionChange = () => {
      reducedMotionRef.current = reduced.matches;
      if (reduced.matches) {
        setWebgl(false);
        setLoadScene(false);
        setSceneReady(false);
        motionRef.current.velocity = 0;
        updateDOM();
      } else {
        const available = supportsWebgl();
        setWebgl(available);
        setLoadScene(available);
      }
    };
    reduced.addEventListener("change", onMotionChange);
    const setRatio = () => setDpr(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.2 : 1.5));
    setRatio();
    window.addEventListener("resize", setRatio, { passive: true });
    const stage = stageRef.current;
    const observer = typeof IntersectionObserver === "undefined" || !stage
      ? null
      : new IntersectionObserver(([entry]) => {
          visibleRef.current = entry.isIntersecting && document.visibilityState === "visible";
          if (visibleRef.current) invalidateRef.current?.();
        }, { threshold: 0.01 });
    if (stage) observer?.observe(stage);
    const onVisibility = () => {
      const bounds = stage?.getBoundingClientRect();
      visibleRef.current = document.visibilityState === "visible" && (!bounds || (bounds.bottom > 0 && bounds.top < window.innerHeight));
      if (visibleRef.current) invalidateRef.current?.();
    };
    document.addEventListener("visibilitychange", onVisibility);
    heroRef.current = stageRef.current?.closest(".hero") ?? null;
    updateDOM();
    if (!reduced.matches) {
      introTimerRef.current = window.setTimeout(() => {
        introTimerRef.current = null;
        if (!interactionStartedRef.current && visibleRef.current && !reducedMotionRef.current) {
          // One authored sweep makes the hero demonstrate its reveal before asking the visitor to interact.
          chooseThought(2);
        }
      }, 1050);
    }
    return () => {
      window.clearTimeout(idle);
      if (introTimerRef.current !== null) window.clearTimeout(introTimerRef.current);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", setRatio);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, [chooseThought, updateDOM]);

  const progressFromPointer = useCallback((clientX: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    const position = clamp((clientX - bounds.left) / bounds.width, 0, 1);
    const mobile = bounds.width < 640;
    const railStart = mobile ? .24 : .14;
    const railSpan = mobile ? .48 : .68;
    const next = clamp((position - railStart) / railSpan, 0, 1);
    const now = performance.now();
    const elapsed = Math.max(12, now - velocityRef.current.time);
    motionRef.current.velocity = clamp((clientX - velocityRef.current.x) / elapsed, -1, 1);
    velocityRef.current = { x: clientX, time: now };
    springVelocityRef.current = 0;
    targetRef.current = next;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (reducedMotionRef.current) {
      motionRef.current.progress = next;
      updateDOM();
      return;
    }
    const start = motionRef.current.progress;
    const startTime = now;
    const tick = (time: number) => {
      const amount = Math.min(1, (time - startTime) / 145);
      const eased = 1 - Math.pow(1 - amount, 3);
      motionRef.current.progress = start + (next - start) * eased;
      updateDOM();
      if (amount < 1) frameRef.current = requestAnimationFrame(tick);
      else frameRef.current = null;
    };
    frameRef.current = requestAnimationFrame(tick);

    if (!pointerDownRef.current) {
      const nearest = anchors.reduce((best, anchor, index) => Math.abs(anchor - next) < Math.abs(anchors[best] - next) ? index : best, 0);
      if (Math.abs(anchors[nearest] - next) < .055 && selectedRef.current !== nearest) {
        selectedRef.current = nearest;
        setSelected(nearest);
      }
    }
  }, [updateDOM]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    markInteraction();
    pointerDownRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    progressFromPointer(event.clientX);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    if (event.pointerType !== "mouse" && !pointerDownRef.current) return;
    markInteraction();
    progressFromPointer(event.clientX);
  };

  const onPointerUp = () => {
    const wasDragging = pointerDownRef.current;
    pointerDownRef.current = false;
    if (!wasDragging) return;
    const progress = targetRef.current;
    const nearest = anchors.reduce((best, anchor, index) => Math.abs(anchor - progress) < Math.abs(anchors[best] - progress) ? index : best, 0);
    chooseThought(nearest);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End", "Enter", "Escape"].includes(event.key)) event.preventDefault();
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End", "Enter", "Escape"].includes(event.key)) markInteraction();
    if (event.key === "Escape") chooseThought(0);
    else if (event.key === "Home") chooseThought(0);
    else if (event.key === "End") chooseThought(thoughtStates.length - 1);
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") chooseThought(Math.min(thoughtStates.length - 1, selectedRef.current + 1));
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") chooseThought(Math.max(0, selectedRef.current - 1));
  };

  const thought = thoughtStates[selected];

  return (
    <div className="reveal-system" style={{ "--thought-color": thought.color } as CSSProperties}>
      <div
        className="reveal-key"
        ref={stageRef}
        role="slider"
        tabIndex={0}
        aria-label="Reveal Key — explore how I think"
        aria-valuemin={1}
        aria-valuemax={thoughtStates.length}
        aria-valuenow={selected + 1}
        aria-valuetext={`${thought.title}. ${thought.note}`}
        aria-describedby="key-help"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointerDownRef.current = false; }}
        onKeyDown={onKeyDown}
      >
        <span className="sr-only" id="key-help">Move the pointer or drag the Reveal Key. Use the arrow keys, Home, or End to explore five thoughts. The buttons below provide a direct alternative.</span>
        <svg className="signal-overlay" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <mask id="reveal-window" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="420">
              <rect width="1000" height="420" fill="black" />
              <path
                ref={apertureRef}
                className="aperture-mask-path"
                d="M0 -42 C32 -61 68 -35 76 -7 L53 46 C37 61 10 54 -2 34 L-28 3 C-39 -13 -25 -36 0 -42Z"
                fill="white"
                transform="translate(100 214) scale(1.7)"
              />
            </mask>
          </defs>
          <g ref={mapRef} className="thought-map" transform="translate(55 0) scale(.85 1)">
          <path className="thought-rail" d="M100 214 C174 197 224 139 300 125 S425 92 500 88 S625 96 700 125 S826 198 900 214" />
          <path className="thought-rail-echo" d="M100 222 C174 205 224 147 300 133 S425 100 500 96 S625 104 700 133 S826 206 900 222" />
          <g className="thought-branches">
            <path d="M205 187 L168 148 L132 148" />
            <path d="M300 125 L324 82 L370 70" />
            <path d="M500 88 L516 43 L568 33" />
            <path d="M700 125 L726 82 L774 70" />
            <path d="M900 214 L861 253 L824 253" />
          </g>
          <g className="thought-stations">
            <path className={selected === 0 ? "is-active" : undefined} d="M92 214 L100 210 L108 214 L100 218 Z" />
            <path className={selected === 1 ? "is-active" : undefined} d="M292 125 L300 121 L308 125 L300 129 Z" />
            <path className={selected === 2 ? "is-active" : undefined} d="M492 88 L500 84 L508 88 L500 92 Z" />
            <path className={selected === 3 ? "is-active" : undefined} d="M692 125 L700 121 L708 125 L700 129 Z" />
            <path className={selected === 4 ? "is-active" : undefined} d="M892 214 L900 210 L908 214 L900 218 Z" />
          </g>
          <g className="revealed-fragments" mask="url(#reveal-window)">
            <path d="M100 214 C174 197 224 139 300 125 S425 92 500 88 S625 96 700 125 S826 198 900 214" />
            <text x="122" y="128">WHAT IF?</text>
            <text x="430" y="282">TRY A VERSION</text>
            <text x="703" y="320">LOOK AGAIN</text>
          </g>
          <path className="registration-mark" d="M85 304h34m-17-17v34M880 304h34m-17-17v34" />
          </g>
        </svg>

        {!sceneReady && (
          <svg ref={fallbackRef} className="fallback-key" viewBox="0 0 180 144" aria-hidden="true">
            <path className="fallback-shadow" d="M25 108 C54 120 105 122 151 105" />
            <path className="key-shell" d="M19 74 C23 44 46 23 72 24 C93 24 106 38 111 54 C97 51 86 56 79 68 C72 80 76 94 88 103 C65 117 35 106 23 88 C20 83 18 78 19 74Z" />
            <path className="key-color" d="M68 41 C86 33 108 45 116 63 C121 76 114 91 102 99 C88 98 76 88 71 76 C67 66 67 53 68 41Z" />
            <path className="key-aperture" d="M69 62 C79 53 94 55 101 65 L84 83 C75 80 69 72 69 62Z" />
            <path className="key-blade" d="M83 57 C103 48 122 40 147 37 C136 56 122 74 101 88 L88 91 L99 70Z" />
            <circle className="key-pivot" cx="91" cy="70" r="8" />
            <path className="key-thread" d="M98 76 C120 80 136 93 151 96" />
          </svg>
        )}

        {webgl && loadScene && (
          <div className="scene-host" aria-hidden="true">
            <SceneBoundary>
              <RevealScene
                motionRef={motionRef}
                visibleRef={visibleRef}
                selected={selected}
                dpr={dpr}
                onInvalidate={(invalidate) => { invalidateRef.current = invalidate; }}
                onReady={() => setSceneReady(true)}
                onLost={() => {
                  setSceneReady(false);
                  setWebgl(false);
                  setLoadScene(false);
                }}
              />
            </SceneBoundary>
          </div>
        )}
        <span className="key-focus-ring" aria-hidden="true" />
      </div>

      <div className="thought-readout">
        <span className="thought-number">{thought.number} / A THOUGHT I RETURN TO</span>
        <p className="thought-title">{thought.title}</p>
        <p className="thought-note">{thought.note}</p>
      </div>

      <nav className="thought-controls" aria-label="Explore five thoughts">
        {thoughtStates.map((item, index) => (
          <button
            className="thought-control"
            type="button"
            key={item.number}
            aria-pressed={selected === index}
            aria-label={`Thought ${index + 1}: ${item.title}`}
            onClick={() => { markInteraction(); chooseThought(index); }}
          >
            <span>{item.number}</span>
            <span>{item.control}</span>
          </button>
        ))}
      </nav>
      <p className="key-instruction">Drag the shape, use ← →, or pick a thought.</p>
    </div>
  );
}
