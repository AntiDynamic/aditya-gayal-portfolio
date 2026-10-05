"use client";

import dynamic from "next/dynamic";
import {
  Component,
  type ErrorInfo,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PROJECT_RESET_EVENT, PROJECT_SELECT_EVENT, resetProject, selectProject } from "./project-events";
import { projects } from "./projects";

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

const anchors = projects.map((project) => project.index / (projects.length - 1));

export function RevealKey() {
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const apertureRef = useRef<SVGPathElement>(null);
  const fallbackRef = useRef<SVGSVGElement>(null);
  const motionRef = useRef<MotionState>({ progress: 0, velocity: 0 });
  const selectedRef = useRef<number | null>(null);
  const visibleRef = useRef(true);
  const targetRef = useRef(0);
  const velocityRef = useRef({ x: 0, time: 0 });
  const frameRef = useRef<number | null>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const pointerDownRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [webgl, setWebgl] = useState(false);
  const [loadScene, setLoadScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [dpr, setDpr] = useState(1.2);

  const updateDOM = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const progress = motionRef.current.progress;
    const mobile = stage.getBoundingClientRect().width < 640;
    const x = mobile ? 24 + progress * 52 : 13 + progress * 74;
    const y = 56 - Math.sin(progress * Math.PI) * (mobile ? 15 : 23);
    const layerShift = Math.max(-12, Math.min(12, motionRef.current.velocity * 10));
    stage.style.setProperty("--reveal-progress", `${progress}`);
    stage.style.setProperty("--key-x", `${x}%`);
    stage.style.setProperty("--key-y", `${y}%`);
    stage.style.setProperty("--key-rotation", `${-10 + progress * 20 + layerShift * .12}deg`);
    stage.style.setProperty("--layer-shift", `${layerShift}px`);
    if (heroRef.current) heroRef.current.style.setProperty("--type-pull", `${Math.max(-7, Math.min(7, layerShift * .5))}px`);

    if (apertureRef.current) {
      apertureRef.current.setAttribute("transform", `translate(${x * 10} ${y * 4.2}) scale(${mobile ? 1.05 : 1.5})`);
    }
    if (fallbackRef.current) {
      fallbackRef.current.style.setProperty("--key-color", selectedRef.current === null ? "#173fb8" : projects[selectedRef.current].color);
    }
    if (visibleRef.current) invalidateRef.current?.();
  }, []);

  const animateTo = useCallback((next: number, settle = false) => {
    targetRef.current = Math.max(0, Math.min(1, next));
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (reducedMotionRef.current) {
      motionRef.current.progress = targetRef.current;
      motionRef.current.velocity = 0;
      updateDOM();
      return;
    }
    let previous = performance.now();
    const tick = (time: number) => {
      const delta = Math.min((time - previous) / 1000, .04);
      previous = time;
      const current = motionRef.current.progress;
      const destination = targetRef.current;
      const stiffness = settle ? 15 : 11;
      const nextProgress = current + (destination - current) * (1 - Math.exp(-stiffness * delta));
      motionRef.current.velocity = delta > 0 ? (nextProgress - current) / delta : 0;
      motionRef.current.progress = nextProgress;
      updateDOM();

      if (Math.abs(destination - nextProgress) > .001) frameRef.current = requestAnimationFrame(tick);
      else {
        motionRef.current.progress = destination;
        motionRef.current.velocity = 0;
        updateDOM();
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [updateDOM]);

  const chooseProject = useCallback((index: number) => {
    selectedRef.current = index;
    setSelected(index);
    animateTo(anchors[index], true);
  }, [animateTo]);

  useEffect(() => {
    const onSelect = (event: Event) => {
      const index = (event as CustomEvent<{ index: number }>).detail?.index;
      if (Number.isInteger(index) && index >= 0 && index < projects.length) chooseProject(index);
    };
    const onReset = () => {
      selectedRef.current = null;
      setSelected(null);
      animateTo(0, true);
    };
    window.addEventListener(PROJECT_SELECT_EVENT, onSelect);
    window.addEventListener(PROJECT_RESET_EVENT, onReset);

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
    }, 900);
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
      visibleRef.current = document.visibilityState === "visible" && (!stage || stage.getBoundingClientRect().bottom > 0 && stage.getBoundingClientRect().top < window.innerHeight);
      if (visibleRef.current) invalidateRef.current?.();
    };
    document.addEventListener("visibilitychange", onVisibility);
    heroRef.current = stageRef.current?.closest(".hero") ?? null;
    updateDOM();
    return () => {
      window.clearTimeout(idle);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      window.removeEventListener(PROJECT_SELECT_EVENT, onSelect);
      window.removeEventListener(PROJECT_RESET_EVENT, onReset);
      window.removeEventListener("resize", setRatio);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, [animateTo, chooseProject, updateDOM]);

  const progressFromPointer = useCallback((clientX: number, pointerType: string) => {
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
    const mobile = bounds.width < 640;
    const railStart = mobile ? .24 : .13;
    const railSpan = mobile ? .52 : .74;
    const next = Math.max(0, Math.min(1, (position - railStart) / railSpan));
    const now = performance.now();
    const elapsed = Math.max(12, now - velocityRef.current.time);
    motionRef.current.velocity = Math.max(-1, Math.min(1, (clientX - velocityRef.current.x) / elapsed));
    velocityRef.current = { x: clientX, time: now };
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
      const amount = Math.min(1, (time - startTime) / 95);
      const eased = 1 - Math.pow(1 - amount, 3);
      motionRef.current.progress = start + (next - start) * eased;
      updateDOM();
      if (amount < 1) frameRef.current = requestAnimationFrame(tick);
      else frameRef.current = null;
    };
    frameRef.current = requestAnimationFrame(tick);

    if (pointerType === "mouse" && !pointerDownRef.current) {
      const nearest = anchors.reduce((best, anchor, index) => Math.abs(anchor - next) < Math.abs(anchors[best] - next) ? index : best, 0);
      if (Math.abs(anchors[nearest] - next) < .055 && selectedRef.current !== nearest) selectProject(nearest);
    }
  }, [updateDOM]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    progressFromPointer(event.clientX, event.pointerType);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    if (event.pointerType !== "mouse" && !pointerDownRef.current) return;
    progressFromPointer(event.clientX, event.pointerType);
  };

  const onPointerUp = () => {
    const wasDragging = pointerDownRef.current;
    pointerDownRef.current = false;
    if (!wasDragging) return;
    const progress = targetRef.current;
    const nearest = anchors.reduce((best, anchor, index) => Math.abs(anchor - progress) < Math.abs(anchors[best] - progress) ? index : best, 0);
    selectedRef.current = nearest;
    setSelected(nearest);
    animateTo(anchors[nearest], true);
    selectProject(nearest);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End", "Enter", "Escape"].includes(event.key)) event.preventDefault();
    if (event.key === "Escape") {
      selectedRef.current = null;
      setSelected(null);
      resetProject();
    } else if (event.key === "Home") selectProject(0);
    else if (event.key === "End") selectProject(projects.length - 1);
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") selectProject(Math.min(projects.length - 1, (selectedRef.current ?? -1) + 1));
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") selectProject(Math.max(0, (selectedRef.current ?? 1) - 1));
    else if (event.key === "Enter" && selected !== null) window.open(projects[selected].href, "_blank", "noopener,noreferrer");
  };

  const label = selected === null ? "Searching for a signal" : `${projects[selected].name} selected`;

  return (
    <div
      className="reveal-key"
      ref={stageRef}
      role="slider"
      tabIndex={0}
      aria-label="Reveal Key — choose a project signal"
      aria-valuemin={1}
      aria-valuemax={projects.length}
      aria-valuenow={(selected ?? 0) + 1}
      aria-valuetext={label}
      aria-describedby="key-help"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { pointerDownRef.current = false; }}
      onKeyDown={onKeyDown}
    >
      <span className="sr-only" id="key-help">Move the pointer across this area or use the arrow keys to reveal project signals. Press Enter to open the selected project or Escape to reset.</span>
      <svg className="signal-overlay" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <mask id="reveal-window" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="420">
            <rect width="1000" height="420" fill="black" />
            <path
              ref={apertureRef}
              className="aperture-mask-path"
              d="M0 -42 C32 -61 68 -35 76 -7 L53 46 C37 61 10 54 -2 34 L-28 3 C-39 -13 -25 -36 0 -42Z"
              fill="white"
              transform="translate(130 235) scale(1.5)"
            />
          </mask>
        </defs>
        <path className="guide-path" d="M130 235 C287 147 380 168 500 235 S721 306 870 139" fill="none" />
        <g className="signal-underlay">
          <path className="continuum" pathLength="1" d="M145 271 C263 105 373 137 483 219 S694 324 846 187" />
          <path className="tracepilot" pathLength="1" d="M148 285 L292 173 L374 190 M425 218 L539 267 L630 223 M685 201 L800 128 L852 163" />
          <path className="netranagar" pathLength="1" d="M160 220 L262 220 L301 190 L353 190 M463 258 L522 258 L558 222 L628 222 M721 154 L802 154 L830 183 L863 183" />
          <path className="video" pathLength="1" d="M138 329 H267 V293 H342 V268 H430 V297 H557 V251 H644 V218 H761 V240 H860" />
          <path className="browser" pathLength="1" d="M138 191 H264 V221 H363 V181 H470 V202 H595 V153 H708 V176 H807 V132 H858" />
        </g>
        <g className="revealed-fragments" mask="url(#reveal-window)">
            <path d="M145 269 C266 105 378 125 486 218 S700 323 852 166" fill="none" stroke="#173fb8" strokeWidth="4" />
          <text className="fragment-label" x="294" y="104">SIGNAL FOUND / 03</text>
          <text className="fragment-word" x="536" y="316">MAKE</text>
        </g>
      </svg>

      {!sceneReady && (
        <svg ref={fallbackRef} className="fallback-key" viewBox="0 0 180 144" aria-hidden="true">
          <path className="key-thread" d="M96 73 C131 81 137 100 165 105" />
          <path className="key-shell" d="M17 79 C24 47 47 25 75 25 C92 25 103 33 111 45 L88 61 C77 53 66 57 60 67 C53 79 59 90 73 92 L86 103 C66 115 39 108 25 94 C20 89 18 84 17 79Z" />
          <path className="key-color" d="M78 43 C94 42 112 52 120 68 L104 96 C90 100 77 92 71 81 C68 70 72 56 78 43Z" />
          <path className="key-aperture" d="M68 65 C78 59 91 60 98 67 L82 85 C74 83 68 75 68 65Z" />
          <path className="key-blade" d="M83 56 L151 40 L115 82 L87 92 L98 73Z" />
          <path className="key-rubber" d="M118 82 L138 56 L151 52 L136 86Z" />
          <circle className="key-pivot" cx="93" cy="74" r="8" />
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
      <span className="key-instruction" aria-hidden="true">Move the key to find a signal</span>
    </div>
  );
}
