"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { type Group, type OrthographicCamera } from "three";
import { getBreakAssembly, type EntranceBreakStore } from "./entrance-break";
import type { EntranceComposition } from "./entrance-manifest";

const clamp = (t:number) => Math.max(0,Math.min(1,t));
const smooth = (t:number) => { t=clamp(t); return t*t*(3-2*t); };
const out = (t:number) => 1-Math.pow(1-clamp(t),3);

export const BREAK_TIMING = { load:120, hesitation:70, failure:120, separation:180, flight:360, followThrough:300, settled:1250 } as const;

export function useEntranceBreakMotion(store: EntranceBreakStore, composition: EntranceComposition) {
  const fragment=useRef<Group>(null), intact=useRef<Group>(null), body=useRef<Group>(null), paper=useRef<Group>(null), metal=useRef<Group>(null), rubber=useRef<Group>(null), debris=useRef<Group>(null), trace=useRef<Group>(null);
  const { invalidate, get, size }=useThree();
  const reduced=useRef(false);
  const mobile=composition.width<768;
  const assembly=useMemo(()=>getBreakAssembly(mobile),[mobile]);
  useEffect(()=>{
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>{ reduced.current=preference.matches; invalidate(); };
    const visibility=()=>{ if (!document.hidden) invalidate(); };
    update(); const unsubscribe=store.subscribe(invalidate);
    preference.addEventListener("change",update); document.addEventListener("visibilitychange",visibility);
    return ()=>{ unsubscribe(); preference.removeEventListener("change",update); document.removeEventListener("visibilitychange",visibility); };
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
    // The front face remains legible for 180ms before gravity takes over.
    const load=failure && kinetic ? smooth(age/.12) : charge;
    const snap=failure ? (kinetic ? out((age-.19)/.12) : 1) : 0;
    const separate=failure ? (kinetic ? smooth((age-.31)/.18) : 1) : 0;
    const flight=failure ? (kinetic ? clamp((age-.49)/.36) : 1) : 0;
    const follow=failure ? (kinetic ? out((age-.70)/.30) : 1) : 0;
    const departure=failure ? (kinetic ? clamp((age-.85)/.30) : 1) : 0;
    const compromised=state.damage>=3 ? 1 : state.damage===2 ? .22 : 0;
    const separation=compromised*.065 + snap*.085 + separate*(mobile ? .22 : .32);
    const x=separate*(mobile ? .06 : .10)+flight*flight*(mobile ? .22 : .52)+departure*(mobile ? .32 : .65);
    const y=separate*.10+flight*flight*(mobile ? 1.15 : 1.3)+departure*departure*(mobile ? 5.6 : 5.1);
    object.visible=state.damage>=2 && (!failure || departure<1);
    object.position.set(px+x,py-y,separation-load*.025+impulse*-.025+flight*.20);
    object.rotation.set(compromised*.025+snap*.07+separate*(mobile ? .32 : .24)+flight*.52+departure*.48,
      -compromised*.03-separate*.12-flight*.10,-compromised*.009-separate*.035-flight*.10-departure*.08);
    if (intact.current) intact.current.position.z=-charge*.025-impulse*.028;
    if (body.current) { body.current.position.x=follow*.018; body.current.rotation.z=follow*.002; }
    if (paper.current) {
      // Light paper follows release, with a soft overshoot and a separate damping rate.
      const t=Math.max(0,age-.27);
      const sag=failure ? (kinetic ? out(t/.36)+Math.sin(t*18)*Math.exp(-t*7)*.12 : 1) : 0;
      paper.current.position.y=-sag*(mobile ? .07 : .10);
      paper.current.rotation.z=-sag*.004+impulse*.0008;
    }
    if (metal.current) {
      const ring=kinetic && failure && age>.19 ? Math.sin((age-.19)*75)*Math.exp(-(age-.19)*16)*.025 : 0;
      metal.current.position.set((assembly.focus[0]-composition.width/2)/100,(composition.height/2-assembly.focus[1])/100,0);
      metal.current.rotation.set(snap*.19-charge*.045+ring,0,snap*-.10);
    }
    if (rubber.current) {
      const recoil=kinetic && failure && age>.19 ? Math.sin((age-.19)*31)*Math.exp(-(age-.19)*9)*.12 : 0;
      rubber.current.position.set((assembly.focus[0]-composition.width/2)/100,(composition.height/2-assembly.focus[1])/100,0);
      rubber.current.rotation.z=-snap*.13+recoil*.15;
      rubber.current.scale.set(1+load*.035-snap*.26+recoil,1-load*.045+snap*.05,1);
    }
    if (trace.current) {
      trace.current.visible=failure;
      trace.current.scale.x=failure ? (kinetic ? smooth((age-.38)/.4) : 1) : 0;
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
    const releaseImpulse=kinetic && failure && age>.19 && age<.55 ? Math.sin((age-.19)*65)*Math.exp(-(age-.19)*16)*(mobile ? 1.4 : 3) : 0;
    camera.position.x=(impulse*(mobile ? .35 : .65)+releaseImpulse)*pixels;
    camera.position.y=-releaseImpulse*.45*pixels;
    const zoom=1+(failure && kinetic ? out((age-.8)/.4)*.012 : 0);
    if (Math.abs(ortho.zoom-zoom)>.000001) { ortho.zoom=zoom; ortho.updateProjectionMatrix(); }
    const moving=kinetic && ((state.charging && charge<1) || age<(failure ? 1.25 : .6));
    if (moving && !document.hidden) invalidate();
  });
  return { fragment,intact,body,paper,metal,rubber,debris,trace };
}
