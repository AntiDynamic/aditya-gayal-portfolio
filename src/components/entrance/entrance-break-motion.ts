"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { type Group } from "three";
import { getBreakAssembly, type EntranceBreakStore } from "./entrance-break";
import type { EntranceComposition } from "./entrance-manifest";

const ease = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1,t)),3);

export function useEntranceBreakMotion(store: EntranceBreakStore, composition: EntranceComposition) {
  const fragment = useRef<Group>(null), intact = useRef<Group>(null), paper = useRef<Group>(null), metal = useRef<Group>(null), rubber = useRef<Group>(null), debris = useRef<Group>(null);
  const { invalidate } = useThree();
  const reduced = useRef(false);
  const mobile = composition.width < 768;
  const assembly = useMemo(() => getBreakAssembly(mobile), [mobile]);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reduced.current = preference.matches; invalidate(); };
    const visibility = () => { if (!document.hidden) invalidate(); };
    update();
    const unsubscribe = store.subscribe(invalidate);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => { unsubscribe(); preference.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, [invalidate, store]);

  useFrame(() => {
    const object = fragment.current;
    if (!object) return;
    const state = store.getSnapshot();
    const pivot = assembly.pivot;
    const px = (pivot[0] - composition.width/2)/100, py = (composition.height/2 - pivot[1])/100;
    const age = state.impact ? Math.max(0,(performance.now() - state.impact.timestamp)/1000) : 10;
    const kinetic = !reduced.current;
    const charge = kinetic ? store.charge() : 0;
    const impulse = kinetic && age < .5 ? Math.sin(age * 78) * Math.exp(-age * 12) * (state.impact?.force ?? 0) : 0;
    const failure = state.phase === "detached";
    const released = failure ? (kinetic ? ease((age - .12)/.20) : 1) : 0;
    // A 120ms loaded pause, then a rotating release and gravity-like exit.
    const travel = failure ? (kinetic ? Math.max(0,Math.min(1,(age - .18)/1.1)) : 1) : 0;
    const loosen = state.phase === "fractured" ? 1 : state.phase === "hairline" ? .28 : 0;
    object.visible = state.damage > 0 && (!failure || travel < 1);
    if (intact.current) intact.current.position.z = -charge * .055;
    object.position.set(px + travel * (mobile ? .52 : 2.15), py - travel * travel * (mobile ? 5.7 : 6.4), -charge * .055 + impulse * -.025 + loosen * .09 + Math.sin(travel * Math.PI) * .95);
    object.rotation.set(travel * 1.35 + charge * -.025, travel * -.62, travel * -.34 + loosen * -.018 + impulse * .003);
    if (paper.current) {
      paper.current.position.y = -released * (mobile ? .09 : .16);
      paper.current.rotation.z = -released * .007 + impulse * .001;
    }
    if (metal.current) {
      metal.current.rotation.x = released * .8 - charge * .06 + impulse * .012;
      metal.current.position.x = released * .10;
      metal.current.position.y = -released * .10;
    }
    if (rubber.current) {
      rubber.current.rotation.z = released * -.16;
      rubber.current.scale.x = 1 - released * .28;
      rubber.current.position.y = released * -.08;
    }
    if (debris.current) {
      debris.current.visible = kinetic && !!state.impact && age < .7;
      const hit = state.impact?.world ?? [px,py,.5];
      for (let i=0;i<debris.current.children.length;i++) {
        const chip = debris.current.children[i];
        chip.visible = !mobile || i < 2;
        const direction = i % 2 ? -1 : 1;
        chip.position.set(hit[0] + direction * age * (.5 + i*.16), hit[1] + age * (.6 + i*.2) - age*age * 3.3, .53 + Math.sin(age*4)*.3);
        chip.rotation.set(age*(3+i), age*2, age*direction*4);
      }
    }
    const moving = kinetic && ((state.charging && charge < 1) || age < (failure ? 1.35 : .72));
    if (moving && !document.hidden) invalidate();
  });
  return { fragment, intact, paper, metal, rubber, debris };
}
