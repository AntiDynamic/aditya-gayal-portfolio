"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { useFrame, useThree } from "@react-three/fiber";
import { type Group, type OrthographicCamera } from "three";
import { getBreakAssembly, type EntranceBreakStore } from "./entrance-break";
import type { EntranceComposition } from "./entrance-manifest";

const clamp = (t:number) => Math.max(0,Math.min(1,t));
const out = (t:number) => 1-Math.pow(1-clamp(t),3);
const channels = ["load", "release", "separate", "flight", "follow", "departure", "sag", "trace"] as const;

export const BREAK_TIMING = { load:140, hesitation:80, failure:130, separation:280, flight:520, followThrough:380, settled:1740 } as const;

export function useEntranceBreakMotion(store: EntranceBreakStore, composition: EntranceComposition) {
  const fragment=useRef<Group>(null), intact=useRef<Group>(null), body=useRef<Group>(null), paper=useRef<Group>(null), metal=useRef<Group>(null), rubber=useRef<Group>(null), debris=useRef<Group>(null), trace=useRef<Group>(null);
  const { invalidate, get, size }=useThree();
  const reduced=useRef(false);
  const choreography = useRef({ load: 0, release: 0, separate: 0, flight: 0, follow: 0, departure: 0, sag: 0, trace: 0 });
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const lastImpact = useRef(0);
  const mobile=composition.width<768;
  const assembly=useMemo(()=>getBreakAssembly(mobile),[mobile]);
  useEffect(()=>{
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    const synchronize = () => {
      const state = store.getSnapshot();
      const stamp = state.impact?.timestamp ?? 0;
      if (!stamp || stamp !== lastImpact.current || reduced.current) {
        timeline.current?.kill();
        timeline.current = null;
        channels.forEach(key => {
          choreography.current[key] = 0;
        });
        lastImpact.current = stamp;
        if (state.phase === "detached") {
          const pose = choreography.current;
          if (reduced.current) {
            channels.forEach(key => { pose[key] = 1; });
          } else {
            // One timeline owns structural consequence. The front face gets a
            // deliberate readable interval before it accelerates out of frame.
            timeline.current = gsap.timeline({ onUpdate: invalidate, onComplete: invalidate })
              .to(pose, { load: 1, duration: .14, ease: "power2.out" }, 0)
              .to(pose, { release: 1, duration: .13, ease: "power3.in" }, .22)
              .to(pose, { separate: 1, duration: .28, ease: "power2.out" }, .35)
              .to(pose, { flight: 1, duration: .52, ease: "power2.in" }, .63)
              .to(pose, { departure: 1, duration: .38, ease: "power2.in" }, 1.15)
              .to(pose, { follow: 1, duration: .38, ease: "power3.out" }, .34)
              .to(pose, { sag: 1, duration: .65, ease: "back.out(1.35)" }, .36)
              .to(pose, { trace: 1, duration: .45, ease: "power2.out" }, .58);
          }
        }
      }
      invalidate();
    };
    const update = () => {
      reduced.current = preference.matches;
      lastImpact.current = -1;
      synchronize();
    };
    const visibility = () => {
      if (document.hidden) timeline.current?.pause();
      else { timeline.current?.resume(); invalidate(); }
    };
    update(); const unsubscribe=store.subscribe(synchronize);
    preference.addEventListener("change",update); document.addEventListener("visibilitychange",visibility);
    return ()=>{ timeline.current?.kill(); unsubscribe(); preference.removeEventListener("change",update); document.removeEventListener("visibilitychange",visibility); };
  },[invalidate,store]);

  useFrame(()=>{
    const object=fragment.current;
    if (!object) return;
    const state=store.getSnapshot(), failure=state.phase==="detached", kinetic=!reduced.current;
    const age=state.impact ? Math.max(0,(performance.now()-state.impact.timestamp)/1000) : 10;
    const charge=kinetic ? store.charge() : 0;
    const force=state.impact?.force??0;
    const impulse=kinetic && age<.4 ? Math.exp(-age*17)*Math.cos(age*65)*force : 0;
    const px=(assembly.pivot[0]-composition.width/2)/100, py=(composition.height/2-assembly.pivot[1])/100;
    const { release: snap, separate, flight, follow, departure } = choreography.current;
    const load = failure ? choreography.current.load : charge;
    const compromised=state.damage>=3 ? 1 : state.damage===2 ? .22 : 0;
    const separation=compromised*.095 + snap*.10 + separate*(mobile ? .42 : .72);
    const x=separate*(mobile ? -.08 : -.28)+flight*(mobile ? -.16 : -.75)+departure*(mobile ? .4 : .7);
    const y=separate*.035+flight*(mobile ? .95 : 1.1)+departure*(mobile ? 5.6 : 5.1);
    object.visible=state.damage>=2 && (!failure || departure<1);
    object.position.set(px+x,py-y,separation-load*.025+impulse*-.025+flight*.35);
    object.rotation.set(compromised*.025+snap*.07+separate*(mobile ? .42 : .38)+flight*.48+departure*.28,
      -compromised*.03-separate*.25-flight*.08,-compromised*.009-separate*.075-flight*.13-departure*.10);
    if (intact.current) intact.current.position.z=-charge*.025-impulse*.028;
    if (body.current) { body.current.position.x=follow*(mobile ? .04 : .08); body.current.rotation.z=follow*.009; }
    if (paper.current) {
      // Light paper follows release, with a soft overshoot and a separate damping rate.
      const sag=failure ? choreography.current.sag : 0;
      paper.current.position.y=-sag*(mobile ? .16 : .28);
      paper.current.rotation.z=-sag*.014+impulse*.0008;
    }
    if (metal.current) {
      const ring=kinetic && failure && age>.19 ? Math.sin((age-.19)*75)*Math.exp(-(age-.19)*16)*.025 : 0;
      metal.current.position.set((assembly.focus[0]-composition.width/2)/100,(composition.height/2-assembly.focus[1])/100,0);
      metal.current.rotation.set(snap*.30-charge*.07+ring,0,snap*-.17);
    }
    if (rubber.current) {
      const recoil=kinetic && failure && age>.19 ? Math.sin((age-.19)*31)*Math.exp(-(age-.19)*9)*.12 : 0;
      rubber.current.position.set((assembly.focus[0]-composition.width/2)/100,(composition.height/2-assembly.focus[1])/100,0);
      rubber.current.rotation.z=-snap*.13+recoil*.15;
      rubber.current.scale.set(1+load*.035-snap*.26+recoil,1-load*.045+snap*.05,1);
    }
    if (trace.current) {
      trace.current.visible=failure;
      trace.current.scale.x=choreography.current.trace;
    }
    if (debris.current) {
      // A pristine tap does not throw debris: chips emerge with fracture/failure.
      const chipAge=age-(failure ? .19 : 0);
      debris.current.visible=kinetic && state.damage>=2 && chipAge>=0 && chipAge<.55;
      const hit=state.impact?.world??[px,py,.5];
      for (let i=0;i<debris.current.children.length;i++) {
        const chip=debris.current.children[i], direction=i%2?-1:1;
        chip.visible=!mobile || i<2;
        chip.position.set(hit[0]+direction*chipAge*(.3+i*.11),hit[1]+chipAge*.32-chipAge*chipAge*3.1,.53+Math.sin(chipAge*4)*.14);
        chip.rotation.set(chipAge*(3+i),chipAge*2,chipAge*direction*4);
      }
    }
    const camera=get().camera;
    const ortho=camera as OrthographicCamera;
    const pixels=Math.max(composition.width/size.width,composition.height/size.height)/100;
    const releaseImpulse=kinetic && failure && age>.19 && age<.58 ? Math.sin((age-.19)*65)*Math.exp(-(age-.19)*16)*(mobile ? 1.4 : 3) : 0;
    if (camera.type === "OrthographicCamera") {
    camera.position.x=(impulse*(mobile ? .35 : .65)+releaseImpulse)*pixels;
    camera.position.y=-releaseImpulse*.45*pixels;
    const zoom=1+(failure && kinetic ? out((age-.8)/.4)*.012 : 0);
    if (Math.abs(ortho.zoom-zoom)>.000001) { ortho.zoom=zoom; ortho.updateProjectionMatrix(); }
    }
    const moving=kinetic && ((state.charging && charge<1) || age<(failure ? 1.74 : .6));
    if (moving && !document.hidden) invalidate();
  });
  return { fragment,intact,body,paper,metal,rubber,debris,trace };
}
