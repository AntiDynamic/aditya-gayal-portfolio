"use client";

import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./journey.module.css";

const SpatialJourney = dynamic(() => import("./spatial-journey").then(m => m.SpatialJourney), { ssr: false });
export type JourneyRuntime = { progress: number; intro: number; pointerX: number; pointerY: number; visible: boolean; invalidate: (() => void) | null };
class SceneBoundary extends Component<{ children: ReactNode; failed: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.failed(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function JourneyMotion() {
  const host = useRef<HTMLDivElement>(null);
  const runtime = useRef<JourneyRuntime>({ progress: 0, intro: 0, pointerX: 0, pointerY: 0, visible: true, invalidate: null });
  const [load, setLoad] = useState(false);
  const [failed, setFailed] = useState(false);
  const bindInvalidate = useCallback((fn: (()=>void)|null)=>{runtime.current.invalidate=fn;},[]);
  useEffect(() => {
    const root = host.current?.closest<HTMLElement>("[data-identity-journey]");
    if (!root) return;
      const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup: (() => void) | undefined;
    let timer = 0;
    const configure = () => {
      cleanup?.();
      clearTimeout(timer);
      if (preference.matches) { setLoad(false); root.removeAttribute("data-ready"); return; }
      gsap.registerPlugin(ScrollTrigger);
      root.setAttribute("data-enhanced", "true");
      const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-journey-chapter]"));
      const word = root.querySelector<HTMLElement>(`.${styles.underType}`);
      const field = root.querySelector<HTMLElement>(`.${styles.colorField}`);
      const cue = root.querySelector<HTMLElement>(`.${styles.scrollCue}`);
      const index = root.querySelector<HTMLElement>("[data-journey-index]");
      const pose = runtime.current;
      const setters = chapters.map(chapter => ({ opacity: gsap.quickSetter(chapter,"opacity"), x: gsap.quickSetter(chapter,"xPercent"), y: gsap.quickSetter(chapter,"y","px"), scale: gsap.quickSetter(chapter,"scale") }));
      const smooth = (a: number, b: number, value: number) => { const t = Math.max(0,Math.min(1,(value-a)/(b-a))); return t*t*(3-2*t); };
      let lastIndex = -1;
      const paint = () => {
        const p = pose.progress;
        setters.forEach((set,i) => {
          const enter = i === 0 ? 1 : smooth(i*.2-.025,i*.2+.015,p);
          const leave = i === 4 ? 0 : smooth(i*.2+.135,i*.2+.175,p);
          const presence = enter*(1-leave);
          set.opacity(presence);
          set.x((1-enter)*10-leave*18);
          set.y((1-enter)*65-leave*100);
          set.scale(1+leave*.08);
          // Semantic text remains in reading order, with no content trapped in WebGL.
        });
        if (word) { word.style.transform = `translate3d(${-p*35}%,${-p*100}px,0) scale(${1+p*.35})`; word.style.opacity = String(.17*(1-smooth(.6,.85,p))); }
        if (field) field.style.clipPath = `inset(${100*(1-smooth(.27,.42,p))}% 0 ${100*smooth(.64,.81,p)}% 0)`;
        if (cue) cue.style.opacity = String(1-smooth(0,.1,p));
        const active = Math.min(4, Math.round(p*5));
        if (index && active !== lastIndex) { index.textContent = `0${active} / 04`; lastIndex=active; }
        root.dataset.progress = p.toFixed(3);
        if (pose.visible && !document.hidden) pose.invalidate?.();
      };
      const follow = gsap.quickTo(pose,"progress",{duration:.38,ease:"power3.out",onUpdate:paint});
      const pointerX = gsap.quickTo(pose,"pointerX",{duration:.7,ease:"power3.out",onUpdate:()=>pose.visible && pose.invalidate?.()});
      const pointerY = gsap.quickTo(pose,"pointerY",{duration:.7,ease:"power3.out",onUpdate:()=>pose.visible && pose.invalidate?.()});
      const trigger = ScrollTrigger.create({trigger:root,start:"top top",end:"bottom bottom",onUpdate:self=>follow(self.progress),onRefresh:self=>{pose.progress=self.progress;paint();}});
      const intro = gsap.fromTo(pose,{intro:0},{intro:1,duration:1.8,ease:"power3.out",onUpdate:()=>pose.visible && pose.invalidate?.()});
      const titleLines = root.querySelectorAll(`.${styles.first} .${styles.typeLine} > span`);
      const headingEnter = gsap.fromTo(titleLines,{yPercent:105,rotation:1.5},{yPercent:0,rotation:0,duration:.95,stagger:.085,delay:.08,ease:"power4.out"});
      const move = (e:PointerEvent) => {
        if (e.pointerType !== "mouse" || !pose.visible) return;
        pointerX((e.clientX/window.innerWidth-.5)*2); pointerY((e.clientY/window.innerHeight-.5)*2);
      };
      const leave = () => { pointerX(0); pointerY(0); };
      const visibility = () => {
        if (document.hidden) { intro.pause(); headingEnter.pause(); follow.tween.pause(); pointerX.tween.pause(); pointerY.tween.pause(); }
        else { intro.resume(); headingEnter.resume(); follow.tween.resume(); pointerX.tween.resume(); pointerY.tween.resume(); paint(); }
      };
      let requested = false;
      const requestScene = () => {if(requested)return;requested=true;timer=window.setTimeout(()=>setLoad(true),120);};
      const observer = new IntersectionObserver(([entry])=>{pose.visible=entry.isIntersecting; if(pose.visible){paint();requestScene();}},{threshold:0});
      observer.observe(root);
      root.addEventListener("pointermove",move,{passive:true}); root.addEventListener("pointerleave",leave);
      document.addEventListener("visibilitychange",visibility);
      // Critical HTML is already present; the heavy scene arrives separately.
      const bounds=root.getBoundingClientRect();
      if(bounds.bottom>0 && bounds.top<innerHeight)requestScene();
      paint();
      cleanup=()=>{
        trigger.kill(); intro.kill(); headingEnter.kill(); follow.tween.kill(); pointerX.tween.kill(); pointerY.tween.kill(); observer.disconnect();
        root.removeEventListener("pointermove",move); root.removeEventListener("pointerleave",leave); document.removeEventListener("visibilitychange",visibility);
        root.removeAttribute("data-enhanced"); root.removeAttribute("data-ready");
        chapters.forEach(chapter=>gsap.set(chapter,{clearProps:"all"}));
        gsap.set(titleLines,{clearProps:"all"});
        word?.removeAttribute("style");field?.removeAttribute("style");cue?.removeAttribute("style");
      };
    };
    configure(); preference.addEventListener("change",configure);
    return ()=>{preference.removeEventListener("change",configure); clearTimeout(timer); cleanup?.();};
  }, []);
  const markFailed = () => { setFailed(true); host.current?.closest("[data-identity-journey]")?.removeAttribute("data-ready"); };
  return <div ref={host} className={styles.motionLayer} aria-hidden="true">
    {load && !failed && <SceneBoundary failed={markFailed}><SpatialJourney runtime={runtime} onInvalidate={bindInvalidate} onReady={()=>host.current?.closest("[data-identity-journey]")?.setAttribute("data-ready","true")} onLost={markFailed}/></SceneBoundary>}
  </div>;
}
