"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import type { EntranceComposition } from "./entrance-manifest";

function inside(x: number, y: number, points: [number, number][]) {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[j];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) hit = !hit;
  }
  return hit;
}

/** Transient physical state stays outside React. Idle scenes stop requesting frames. */
export function useEntrancePresence(composition: EntranceComposition) {
  const root = useRef<Group>(null);
  const { size, invalidate } = useThree();
  const motion = useRef({ x: 0, y: 0, pressure: 0, targetX: 0, targetY: 0, targetPressure: 0, updatedAt: 0, enabled: true });
  const mobile = composition.width < 768;

  useEffect(() => {
    const surface = document.getElementById("entrance-surface");
    if (!surface) return;
    const state = motion.current;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const scale = Math.min(size.width / composition.width, size.height / composition.height);
    const offsetX = (size.width - composition.width * scale) / 2;
    const offsetY = (size.height - composition.height * scale) / 2;
    const focus = mobile ? [260, 325] : [868, 409];
    let lastX = 0, lastY = 0, lastTime = 0;
    let keyboardX = focus[0], keyboardY = focus[1];

    const reset = () => {
      state.targetX = state.targetY = state.targetPressure = 0;
      state.updatedAt = performance.now();
      lastTime = 0;
      invalidate();
    };
    const updatePreference = () => {
      state.enabled = !preference.matches && !document.hidden;
      reset();
    };
    const aim = (x: number, y: number, speed = 0) => {
      if (!state.enabled) return;
      const distance = Math.hypot((x - focus[0]) / (mobile ? 100 : 210), (y - focus[1]) / (mobile ? 140 : 240));
      if (distance > .25 && !composition.pieces.some(piece => piece.role === "primary" && inside(x, y, piece.points))) { reset(); return; }
      state.targetX = Math.max(-1, Math.min(1, (x / composition.width - .5) * 2));
      state.targetY = Math.max(-1, Math.min(1, (y / composition.height - .5) * 2));
      // Motion signals proximity, not damage. Fast approaches meet slightly more resistance.
      state.targetPressure = Math.max(0, 1 - distance) * (1 - Math.min(.3, speed * .06));
      state.updatedAt = performance.now();
      invalidate();
    };
    const pointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("a, button") && !target.closest("[data-break-target]")) { reset(); return; }
      const x = (event.clientX - offsetX) / scale;
      const y = (event.clientY - offsetY) / scale;
      const elapsed = event.timeStamp - lastTime;
      const speed = lastTime && elapsed > 0 ? Math.hypot(x - lastX, y - lastY) / elapsed : 0;
      lastX = x; lastY = y; lastTime = event.timeStamp;
      aim(x, y, speed);
    };
    const release = (event: PointerEvent) => { if (event.pointerType !== "mouse") reset(); };
    const keyboard = (event: KeyboardEvent) => {
      if (!state.enabled || event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      keyboardX = Math.max(20, Math.min(composition.width - 20, keyboardX + (event.key === "ArrowLeft" ? -24 : event.key === "ArrowRight" ? 24 : 0)));
      keyboardY = Math.max(100, Math.min(composition.height - 100, keyboardY + (event.key === "ArrowUp" ? -24 : event.key === "ArrowDown" ? 24 : 0)));
      aim(keyboardX, keyboardY);
    };
    const focusControl = () => reset();
    updatePreference();
    surface.addEventListener("pointermove", pointer, { passive: true });
    surface.addEventListener("pointerdown", pointer, { passive: true });
    surface.addEventListener("pointerleave", reset);
    surface.addEventListener("pointerup", release);
    surface.addEventListener("pointercancel", reset);
    surface.addEventListener("focusin", focusControl);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", updatePreference);
    window.addEventListener("blur", reset);
    preference.addEventListener("change", updatePreference);
    return () => {
      surface.removeEventListener("pointermove", pointer);
      surface.removeEventListener("pointerdown", pointer);
      surface.removeEventListener("pointerleave", reset);
      surface.removeEventListener("pointerup", release);
      surface.removeEventListener("pointercancel", reset);
      surface.removeEventListener("focusin", focusControl);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", updatePreference);
      window.removeEventListener("blur", reset);
      preference.removeEventListener("change", updatePreference);
    };
  }, [composition, invalidate, mobile, size.width, size.height]);

  useFrame((_, delta) => {
    const object = root.current;
    if (!object) return;
    const state = motion.current;
    // Bound the settling tail in real time too: slow GPUs must not turn a small
    // response into seconds of extra shadow rendering after input has stopped.
    const alpha = state.enabled && performance.now() - state.updatedAt < 800
      ? 1 - Math.exp(-Math.min(delta, .05) / .12) : 1;
    let remaining = 0;
    for (const [key, target] of [["x", "targetX"], ["y", "targetY"], ["pressure", "targetPressure"]] as const) {
      const difference = state[target] - state[key];
      state[key] = Math.abs(difference) < .001 ? state[target] : state[key] + difference * alpha;
      remaining += Math.abs(state[target] - state[key]);
    }
    const limit = mobile ? .024 : .048;
    object.rotation.set(-state.y * limit, state.x * limit, 0);
    for (const piece of object.children) {
      // Authored construction hierarchy: pliable paper, resistant enamel, tense join.
      const lift = piece.name === "sweep" ? .19 : piece.name === "lower-shell" ? .10 : piece.name === "fold-under" ? .035 : 0;
      piece.position.z = state.pressure * lift;
    }
    if (remaining > .001 && state.enabled && !document.hidden) invalidate();
  });
  return root;
}
