"use client";
import { useEffect, useRef } from "react";
import type { BlackHoleRenderer } from "./black-hole-renderer";
import styles from "./event-horizon.module.css";

const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function EventHorizonScroll(){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const node=host.current;const root=node?.closest<HTMLElement>("[data-event-horizon]");if(!node||!root)return;
    const canvas=node.querySelector("canvas")!;
    const fallbackPoint=node.querySelector<SVGCircleElement>("circle")!;
    const identity=root.querySelector<HTMLElement>("[data-identity]")!;
    const prelude=root.querySelector<HTMLElement>("[data-prelude]")!;
    const invitation=root.querySelector<HTMLElement>("[data-invitation]")!;
    const reform=Array.from(root.querySelectorAll<HTMLElement>("[data-reform]"));
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    const motionButton=root.querySelector<HTMLButtonElement>("[data-motion-choice]")!;
    let override:boolean|null=null;
    const isReduced=()=>override??preference.matches;
    let renderer:BlackHoleRenderer|undefined,disposed=false,failed=false,raf=0,last=0,current=0,target=0,visible=true,whiteRendered=false;
    let start=0,range=1,height=innerHeight;
    root.dataset.enhanced="true";
    const resize=()=>{
      root.dataset.reduced=String(isReduced());
      motionButton.hidden=false;motionButton.textContent=isReduced()?"Enable full motion":"Reduce motion";
      height=innerHeight;start=root.getBoundingClientRect().top+scrollY;range=Math.max(1,root.offsetHeight-height);
      renderer?.resize(innerWidth,height);whiteRendered=false;onScroll();
    };
    const paint=()=>{
      root.dataset.progress=current.toFixed(4);
      prelude.style.opacity=String(1-smooth(.04,.14,current));
      invitation.style.opacity=String(1-smooth(.10,.21,current));
      const clarity=smooth(.945,.952,current);
      identity.style.opacity=String(clarity);
      identity.style.pointerEvents=current>.99?"auto":"none";
      identity.querySelector("a")!.tabIndex=current>.99?0:-1;
      reform.forEach((el)=>{
        const i=Number(el.dataset.reform);
        const t=smooth(.95+i*.006,.966+i*.006,current);
        el.style.opacity=String(t);el.style.transform=`translate3d(0,${(1-t)*(isReduced()?0:24)}px,0)`;
        el.style.filter=isReduced()?"none":`blur(${(1-t)*8}px)`;
        el.style.clipPath=`inset(0 0 ${(1-t)*100}% 0)`;
      });
      root.style.setProperty("--control-ink",current>.945?"#171819":"#eeeae4");
      root.dataset.quiet=String(current>.78&&current<.95);
      if(failed){
        node.style.background=current>.945?"#f8f6f1":"#030406";
        node.style.setProperty("--still-opacity",String((1-smooth(.66,.80,current))*smooth(.02,.18,current)));
        fallbackPoint.setAttribute("r",String(current<.865?0:Math.min(150, .08*Math.exp(8.9*smooth(.89,.95,current)))));
      }
    };
    const frame=(time:number)=>{
      raf=0;if(disposed||!visible||document.hidden)return;
      const dt=last?Math.min(64,time-last):16.7;last=time;
      current=isReduced()?target:current+(target-current)*(1-Math.exp(-dt/85));
      if(Math.abs(target-current)<.000015)current=target;
      paint();
      if(!failed && (!whiteRendered || current<.95)) renderer?.draw(current,isReduced(),dt);
      whiteRendered=Boolean(renderer)&&current>=.95;
      if(current!==target)raf=requestAnimationFrame(frame);else last=0;
    };
    const wake=()=>{if(!raf&&!document.hidden&&visible&&!disposed)raf=requestAnimationFrame(frame);};
    function onScroll(){target=Math.max(0,Math.min(1,(scrollY-start)/range));wake();}
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else wake();};
    const fail=()=>{if(disposed)return;failed=true;root.dataset.fallback="true";canvas.style.visibility="hidden";queueMicrotask(()=>{renderer?.dispose();renderer=undefined;});wake();};
    const skip=(event:Event)=>{event.preventDefault();current=target=1;scrollTo({top:start+range,behavior:"instant"});history.replaceState(null,"","#identity");wake();root.querySelector<HTMLElement>("h1")?.focus({preventScroll:true});};
    const hash=()=>{if(location.hash==="#identity"){current=target=1;scrollTo({top:start+range,behavior:"instant"});wake();}};
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")skip(event);};
    const link=root.querySelector("[data-skip-intro]")!;link.addEventListener("click",skip);
    const changeMotion=()=>{const p=current;override=!isReduced();resize();scrollTo({top:start+range*p,behavior:"instant"});current=target=p;wake();};
    motionButton.addEventListener("click",changeMotion);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;last=0;}},{threshold:0});observer.observe(root);
    addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",resize);addEventListener("hashchange",hash);addEventListener("keydown",escape);
    document.addEventListener("visibilitychange",visibility);preference.addEventListener("change",resize);
    resize();hash();
    void Promise.all([import("./black-hole-renderer"),document.fonts.ready]).then(([module])=>{
      if(disposed)return;
      try{renderer=new module.BlackHoleRenderer(canvas,root,fail);renderer.resize(innerWidth,height);wake();}catch{fail();}
    }).catch(fail);
    return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();renderer?.dispose();motionButton.removeEventListener("click",changeMotion);motionButton.hidden=true;link.removeEventListener("click",skip);removeEventListener("scroll",onScroll);removeEventListener("resize",resize);removeEventListener("hashchange",hash);removeEventListener("keydown",escape);document.removeEventListener("visibilitychange",visibility);preference.removeEventListener("change",resize);root.removeAttribute("data-enhanced");};
  },[]);
  return <div className={styles.canvasHost} ref={host}><div className={styles.still}/><svg className={styles.fallbackPoint} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><circle cx="50" cy="50" r="0" fill="#f8f6f1"/></svg><canvas className={styles.canvas}/></div>;
}
