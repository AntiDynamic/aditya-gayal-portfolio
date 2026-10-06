"use client";

import { useEffect, useRef } from "react";
import type { WavesEffect } from "vanta/dist/vanta.waves.min.js";
import type { gsap } from "gsap";
import { useEntranceActive } from "./entrance/entrance-context";
import styles from "./curiosity-surface.module.css";

const palettes: Record<string, { color: string; height: number }> = {
  blue: { color: "#12367c", height: 105 },
  acid: { color: "#334f28", height: 145 },
  cyan: { color: "#174953", height: 90 },
  sun: { color: "#685126", height: 120 },
};

/** A bounded field of folded material, not a page-wide background effect. */
export function CuriositySurface({ tone }: { tone: string }) {
  const host = useRef<HTMLDivElement>(null);
  const effect = useRef<WavesEffect | null>(null);
  const animate = useRef<(() => void) | null>(null);
  const toneRef = useRef(tone);
  const entranceActive = useEntranceActive();

  useEffect(() => {
    const el = host.current;
    if (!el || entranceActive) return;
    const field = el.parentElement!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, visible = false, pending = false, blocked = false, revision = 0;
    let stopTimer = 0;
    let tween: gsap.core.Tween | undefined;
    let motion: typeof gsap | undefined;

    // Vanta 0.5.24 has no pause API. This adapter stops its documented source's
    // RAF handle; destroy() also removes global listeners and Three resources.
    // Keep the dependency pinned and recheck these fields when upgrading.
    const freeze = () => {
      if (effect.current) cancelAnimationFrame(effect.current.req);
      el.dataset.motion = "settled";
    };
    const wake = () => {
      const current = effect.current;
      if (!current || !visible || document.hidden || reduced.matches) return;
      clearTimeout(stopTimer);
      if (el.dataset.motion !== "moving") {
        current.prevNow = performance.now();
        current.animationLoop();
        el.dataset.motion = "moving";
      }
      stopTimer = window.setTimeout(freeze, 3400);
    };
    const applyTone = () => {
      const current = effect.current;
      if (!current || !motion) return;
      const palette = palettes[toneRef.current] ?? { color: "#243453", height: 65 };
      tween?.kill();
      wake();
      tween = motion.to(current.options, {
        color: palette.color,
        waveHeight: palette.height,
        waveSpeed: toneRef.current === "none" ? 0.22 : 0.48,
        duration: 0.85,
        ease: "power2.inOut",
        onUpdate: wake,
      });
    };
    const resize = () => {
      const current = effect.current;
      if (!current) return;
      const dpr = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1 : 1.25);
      current.options.scale = current.options.scaleMobile = (devicePixelRatio || 1) / dpr;
      current.resize();
      wake();
    };
    animate.current = applyTone;
    const lostContext = (event: Event) => {
      event.preventDefault();
      blocked = true;
      destroy();
    };
    const destroy = () => {
      revision++;
      clearTimeout(stopTimer);
      tween?.kill();
      const current = effect.current;
      effect.current = null;
      if (current) {
        // Upstream destroys scene geometry but does not dispose the renderer.
        const renderer = current.renderer;
        renderer?.domElement.removeEventListener("webglcontextlost", lostContext);
        current.destroy();
        renderer?.dispose();
        renderer?.forceContextLoss();
      }
      el.dataset.motion = "fallback";
    };
    const configure = async () => {
      if (disposed || !visible || document.hidden || reduced.matches) {
        destroy();
        return;
      }
      if (effect.current || pending || blocked) return;
      pending = true;
      const generation = revision;
      try {
        const [THREE, { default: WAVES }, { gsap }] = await Promise.all([
          import("three"), import("vanta/dist/vanta.waves.min.js"), import("gsap"),
        ]);
        if (disposed || generation !== revision || !visible || document.hidden || reduced.matches) return;
        motion = gsap;
        const dpr = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1 : 1.25);
        const current = WAVES({
          el, THREE, mouseControls: true, touchControls: false, gyroControls: false,
          backgroundColor: 0x24231f, backgroundAlpha: 0,
          color: "#243453", shininess: 12, waveHeight: 65, waveSpeed: 0.22,
          zoom: innerWidth < 768 ? 0.85 : 0.72,
          minWidth: 100, minHeight: 100,
          scale: (devicePixelRatio || 1) / dpr,
          scaleMobile: (devicePixelRatio || 1) / dpr,
        });
        effect.current = current;
        if (!current.renderer || !current.scene) {
          blocked = true;
          destroy();
          return;
        }
        current.renderer.domElement.addEventListener("webglcontextlost", lostContext);
        // The stock 100×80 grid updates 8,181 vertices on the CPU each frame.
        // Preserve its dimensions/camera, with a bounded 40×32 / 28×22 surface.
        const geometry = new THREE.PlaneGeometry(1800, 1440,
          innerWidth < 768 ? 28 : 40, innerWidth < 768 ? 22 : 32);
        geometry.rotateX(-Math.PI / 2);
        geometry.translate(0, -10, 0);
        current.plane.geometry.dispose();
        current.plane.geometry = geometry;
        // Vanta's old point-light units are nearly dark with modern Three's
        // physical attenuation. Broad explicit lights make the folds legible.
        current.scene.traverse(node => {
          if (node instanceof THREE.AmbientLight) node.intensity = .48;
          if (node instanceof THREE.PointLight) node.intensity = 0;
        });
        const key = new THREE.DirectionalLight(0xdbe9ff, 2.3);
        key.position.set(-280, 500, 160);
        current.scene.add(key);
        const fill = new THREE.DirectionalLight(0xfff2dc, .4);
        fill.position.set(380, 200, -180);
        current.scene.add(fill);
        // User content remains in HTML. This canvas is strictly decorative.
        current.renderer.domElement.setAttribute("aria-hidden", "true");
        el.dataset.motion = "moving";
        applyTone();
      } catch {
        blocked = true;
        // Static folded SVG stays present if WebGL or the effect fails.
        destroy();
      } finally {
        pending = false;
        if (!blocked && !disposed && visible && !document.hidden && !reduced.matches && generation !== revision) void configure();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      void configure();
    }, { threshold: 0.06 });
    observer.observe(el);
    const boundsObserver = new ResizeObserver(resize);
    boundsObserver.observe(el);
    field.addEventListener("pointermove", wake, { passive: true });
    field.addEventListener("pointerdown", wake, { passive: true });
    field.addEventListener("focusin", wake);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", configure);
    reduced.addEventListener("change", configure);
    return () => {
      disposed = true;
      animate.current = null;
      observer.disconnect();
      boundsObserver.disconnect();
      field.removeEventListener("pointermove", wake);
      field.removeEventListener("pointerdown", wake);
      field.removeEventListener("focusin", wake);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", configure);
      reduced.removeEventListener("change", configure);
      destroy();
    };
  }, [entranceActive]);

  useEffect(() => {
    toneRef.current = tone;
    animate.current?.();
  }, [tone]);

  return (
    <div ref={host} className={styles.surface} aria-hidden="true" data-motion="fallback">
      <svg viewBox="0 0 1000 600" preserveAspectRatio="none">
        <path d="M0 500 160 320 300 410 490 190 620 320 810 120 1000 230V600H0Z" fill="#192846" />
        <path d="M160 320 300 410 490 190 420 470Z" fill="#243858" />
        <path d="M490 190 620 320 810 120 730 480Z" fill="#2a405e" />
      </svg>
    </div>
  );
}
