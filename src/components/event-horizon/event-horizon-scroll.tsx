"use client";
import { useEffect, useRef } from "react";
import type { BlackHoleRenderer } from "./black-hole-renderer";
import styles from "./event-horizon.module.css";

const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function EventHorizonScroll({bridge=false}:{bridge?:boolean}){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const node=host.current;const root=node?.closest<HTMLElement>("[data-event-horizon]");if(!node||!root)return;
    const canvas=node.querySelector("canvas")!;
    const fallbackPoint=node.querySelector<SVGCircleElement>("circle")!;
    const identity=root.querySelector<HTMLElement>("[data-identity]")!;
    const identityLink=identity.querySelector("a")!;
    const scrollCue=root.querySelector<HTMLElement>("[data-black-hole-cue]");
    const reform=Array.from(root.querySelectorAll<HTMLElement>("[data-reform]"));
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    const queryChoice=new URLSearchParams(location.search).get("motion");
    const motionChoice:string|null=queryChoice==="full"||queryChoice==="reduced"?queryChoice:null;
    const isReduced=()=>motionChoice?motionChoice==="reduced":preference.matches;
    let renderer:BlackHoleRenderer|undefined,disposed=false,failed=false,raf=0,last=0,current=0,target=0,visible=true,whiteRendered=false;
    let start=0,range=1,height=innerHeight,simulationTime=0,measured=false,handedOff=false;
    let paintedProgress=-1;
    root.dataset.enhanced="true";
    const measure=(preserveProgress=false)=>{
      const progress=current;
      root.dataset.reduced=String(isReduced());
      root.dataset.motionChoice=motionChoice??"system";
      paintedProgress=-1;
      height=innerHeight;start=root.getBoundingClientRect().top+scrollY;range=Math.max(1,root.offsetHeight-height);
      if(preserveProgress){
        scrollTo({top:start+range*progress,behavior:"instant"});
        target=progress;
      }else target=Math.max(0,Math.min(1,(scrollY-start)/range));
    };
    const resize=()=>{
      measure(measured);measured=true;
      renderer?.resize(innerWidth,height);whiteRendered=false;wake();
    };
    const paint=()=>{
      if(current===paintedProgress)return;
      paintedProgress=current;
      root.dataset.progress=current.toFixed(4);
      if(scrollCue)scrollCue.style.opacity=String(1-smooth(.015,.075,current));
      const clarity=smooth(.979,.986,current);
      identity.style.opacity=String(clarity);
      identity.style.pointerEvents=current>.99?"auto":"none";
      identityLink.tabIndex=current>.99?0:-1;
      reform.forEach((el)=>{
        const i=Number(el.dataset.reform);
        const t=smooth(.981+i*.0015,.990+i*.0015,current);
        el.style.opacity=String(t);el.style.transform=`translate3d(0,${(1-t)*(isReduced()?0:24)}px,0)`;
        el.style.filter=isReduced()?"none":`blur(${(1-t)*8}px)`;
        el.style.clipPath=`inset(0 0 ${(1-t)*100}% 0)`;
      });
      root.style.setProperty("--control-ink",current>.945?"#171819":"#eeeae4");
      if(failed){
        node.style.background=current>.945?"#f8f6f1":"#030406";
        node.style.setProperty("--still-opacity",String((1-smooth(.66,.80,current))*smooth(.02,.18,current)));
        fallbackPoint.setAttribute("r",String(current<.861?0:Math.min(150, .08*Math.exp(8.9*smooth(.882,.95,current)))));
      }
    };
    const frame=(time:number)=>{
      raf=0;if(disposed||!visible||document.hidden)return;
      const frameMs=last?time-last:0;
      const dt=frameMs?Math.min(64,frameMs):16.7;last=time;
      if(root.dataset.reduced!==String(isReduced()))measure(true);
      const damping=125+75*smooth(.38,.62,current);
      const eased=current+(target-current)*(1-Math.exp(-dt/damping));
      if(isReduced())current=target;
      else{
        const speed=.26-.11*smooth(.32,.575,current)-.105*smooth(.78,.855,current)+.025*smooth(.94,.955,current);
        const step=speed*dt/1000;
        let next=current+Math.max(-step,Math.min(step,eased-current));
        if(next>current){
          for(const boundary of [.575,.855,.955]){if(current<boundary&&next>boundary){next=boundary;break;}}
        }else{
          for(const boundary of [.955,.855,.575]){if(current>boundary&&next<boundary){next=boundary;break;}}
        }
        current=next;
      }
      if(Math.abs(target-current)<.000015)current=target;
      if(bridge&&current>=.95){
        renderer?.draw(.95,isReduced(),frameMs,simulationTime);
        if(!handedOff){handedOff=true;dispatchEvent(new Event("event-horizon-whiteout"));}
        return;
      }
      paint();
      const animateDisk=Boolean(renderer)&&!failed&&current<.655;
      if(animateDisk)simulationTime+=Math.min(100,frameMs)/1000*(isReduced()?.12:1);
      if(!failed && (!whiteRendered || current<.986)) renderer?.draw(current,isReduced(),frameMs,simulationTime);
      whiteRendered=Boolean(renderer)&&current>=.986;
      if(current!==target||animateDisk)raf=requestAnimationFrame(frame);else last=0;
    };
    const wake=()=>{if(!raf&&!document.hidden&&visible&&!disposed)raf=requestAnimationFrame(frame);};
    function onScroll(){target=Math.max(0,Math.min(1,(scrollY-start)/range));wake();}
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else wake();};
    const fail=()=>{if(disposed)return;failed=true;paintedProgress=-1;root.dataset.fallback="true";canvas.style.visibility="hidden";queueMicrotask(()=>{renderer?.dispose();renderer=undefined;});if(bridge){dispatchEvent(new Event("event-horizon-skip"));return;}wake();};
    const skip=(event:Event)=>{event.preventDefault();if(bridge){dispatchEvent(new Event("event-horizon-skip"));return;}current=target=1;scrollTo({top:start+range,behavior:"instant"});history.replaceState(null,"","#identity");wake();root.querySelector<HTMLElement>("h1")?.focus({preventScroll:true});};
    const hash=()=>{if(location.hash==="#identity"){current=target=1;scrollTo({top:start+range,behavior:"instant"});wake();}};
    const escape=(event:KeyboardEvent)=>{
      if(event.key!=="Escape"||event.repeat||event.defaultPrevented)return;
      const browserFullscreen=innerWidth>=screen.width-2&&innerHeight>=screen.height-2;
      if(document.fullscreenElement||browserFullscreen)return;
      if(event.target instanceof Element&&event.target.closest("input,textarea,select,[role=dialog]"))return;
      skip(event);
    };
    const link=root.querySelector<HTMLElement>("[data-skip-intro]");link?.addEventListener("click",skip);
    const roomLink=root.querySelector<HTMLElement>("[data-room-shortcut]");
    const websiteLink=root.querySelector<HTMLElement>("[data-website-shortcut]");
    const openRoom=(event:Event)=>{event.preventDefault();dispatchEvent(new Event("event-horizon-room"));};
    const openWebsite=(event:Event)=>{event.preventDefault();dispatchEvent(new Event("event-horizon-skip"));};
    roomLink?.addEventListener("click",openRoom);websiteLink?.addEventListener("click",openWebsite);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;last=0;}},{threshold:0});observer.observe(root);
    let layoutObserved=false;
    const layoutObserver=new ResizeObserver(()=>{if(layoutObserved)resize();else layoutObserved=true;});
    layoutObserver.observe(root);
    addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",resize);addEventListener("hashchange",hash);addEventListener("keydown",escape);
    document.addEventListener("visibilitychange",visibility);preference.addEventListener("change",resize);
    resize();hash();
    void Promise.all([import("./black-hole-renderer"),document.fonts.ready]).then(([module])=>{
      if(disposed)return;
      try{renderer=new module.BlackHoleRenderer(canvas,root,fail);renderer.resize(innerWidth,height);wake();}catch{fail();}
    }).catch(fail);
    return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();layoutObserver.disconnect();renderer?.dispose();link?.removeEventListener("click",skip);roomLink?.removeEventListener("click",openRoom);websiteLink?.removeEventListener("click",openWebsite);removeEventListener("scroll",onScroll);removeEventListener("resize",resize);removeEventListener("hashchange",hash);removeEventListener("keydown",escape);document.removeEventListener("visibilitychange",visibility);preference.removeEventListener("change",resize);root.removeAttribute("data-enhanced");};
  },[bridge]);
  return <div className={styles.canvasHost} ref={host}><div className={styles.still}/><svg className={styles.fallbackPoint} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><circle cx="50" cy="50" r="0" fill="#f8f6f1"/></svg><canvas className={styles.canvas}/></div>;
}
