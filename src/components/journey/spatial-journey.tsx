"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { CatmullRomCurve3, Group, Mesh, MeshStandardMaterial, PMREMGenerator, Vector3, TubeGeometry, PlaneGeometry, CanvasTexture, PerspectiveCamera, SRGBColorSpace, ACESFilmicToneMapping, PCFSoftShadowMap, type DirectionalLight } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { JourneyRuntime } from "./journey-motion";
import styles from "./journey.module.css";

const modelURL = "/models/question-relay.glb";
const clamp = (v:number) => Math.max(0,Math.min(1,v));
const ease = (a:number,b:number,p:number) => {const v=clamp((p-a)/(b-a));return v*v*(3-2*v);};

function World({ runtime, onReady, onLost, onInvalidate }: {runtime:MutableRefObject<JourneyRuntime>;onReady:()=>void;onLost:()=>void;onInvalidate:(fn:(()=>void)|null)=>void}) {
  const {gl,get,invalidate,size,setDpr} = useThree();
  const gltf = useLoader(GLTFLoader,modelURL);
  const stations = useRef<(Group|null)[]>([]);
  const keyLight = useRef<DirectionalLight>(null);
  const mobile = size.width < 768;
  useEffect(()=>{
    setDpr(mobile?1:Math.min(window.devicePixelRatio,1.5));
    const camera=get().camera;
    if(camera instanceof PerspectiveCamera){camera.fov=mobile?44:38;camera.updateProjectionMatrix();}
    invalidate();
  },[mobile,setDpr,get,invalidate]);
  const frameCount = useRef(0);
  const sample = useRef(new Vector3());
  const parts = useMemo(()=>["QuestionShell","CounterQuestion","ConnectionRail"].map(name=>{
    const mesh=gltf.scene.getObjectByName(name);
    if (!(mesh instanceof Mesh)) throw new Error(`Missing relay part: ${name}`);
    return mesh;
  }),[gltf]);
  const path = useMemo(()=>new CatmullRomCurve3([
    new Vector3(0,0,13),new Vector3(0,.35,6),new Vector3(.4,.8,-5),
    new Vector3(-.9,.35,-17),new Vector3(.6,.2,-29),new Vector3(0,0,-33),
  ]),[]);
  const traces = useMemo(()=>{
    const spine = new CatmullRomCurve3([new Vector3(2,-2,2),new Vector3(-1,-1,-5),new Vector3(2,1,-12),new Vector3(-1,1,-20),new Vector3(1,-1,-27),new Vector3(-.5,.5,-38)]);
    return [new TubeGeometry(spine,140,.022,6,false),new TubeGeometry(new CatmullRomCurve3([new Vector3(-3,-1,0),new Vector3(-1,2,0),new Vector3(2,1,0),new Vector3(3,-.6,0)]),64,.018,6,false)];
  },[]);
  const alternative = useMemo(()=>new MeshStandardMaterial({color:"#26c5c9",roughness:.38,metalness:.12}),[]);
  const printed = useMemo(()=>{
    const canvas=document.createElement("canvas");canvas.width=2048;canvas.height=128;
    const context=canvas.getContext("2d")!;
    context.fillStyle="#f2ebdd";context.fillRect(0,0,2048,128);
    context.fillStyle="#262723";context.font="600 64px monospace";context.textBaseline="middle";
    ["WHAT IF?","LOOK AGAIN.","TRY IT.","WHY?"].forEach((word,i)=>context.fillText(word,30+i*512,68));
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.anisotropy=4;
    const material=new MeshStandardMaterial({map:texture,roughness:.4,metalness:.035});
    return {texture,material};
  },[]);
  const spatialType = useMemo(()=>{
    const canvas=document.createElement("canvas");canvas.width=2048;canvas.height=768;
    const context=canvas.getContext("2d")!;
    context.font="600 205px sans-serif";context.textAlign="center";context.textBaseline="middle";context.fillStyle="#b9c8ee";
    ["WHY?","WHAT CHANGED?","TRY AGAIN."].forEach((word,i)=>context.fillText(word,1024,128+i*256,1980));
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
    const geometries=[0,1,2].map(i=>{const geometry=new PlaneGeometry(15,1.9);const uv=geometry.getAttribute("uv");for(let v=0;v<uv.count;v++)uv.setY(v,uv.getY(v)/3+(2-i)/3);return geometry;});
    return {texture,geometries};
  },[]);
  useEffect(()=>{
    onInvalidate(invalidate);
    const {scene,camera}=get();
    const pmrem=new PMREMGenerator(gl);
    const room=new RoomEnvironment();
    const environment=pmrem.fromScene(room,.035);
    room.dispose();pmrem.dispose();
    scene.environment=environment.texture;scene.environmentIntensity=.5;
    let disposed=false;
    gl.compileAsync(scene,camera).then(()=>{if(!disposed){invalidate();onReady();}}).catch(()=>{if(!disposed)onLost();});
    const lost=(e:Event)=>{e.preventDefault();onLost();};
    gl.domElement.addEventListener("webglcontextlost",lost);
    return ()=>{
      disposed=true;onInvalidate(null);gl.domElement.removeEventListener("webglcontextlost",lost);
      scene.environment=null;environment.dispose();
    };
  },[gl,get,invalidate,onInvalidate,onReady,onLost]);
  useEffect(()=>()=>{traces.forEach(g=>g.dispose());alternative.dispose();printed.material.dispose();printed.texture.dispose();spatialType.texture.dispose();spatialType.geometries.forEach(g=>g.dispose());},[traces,alternative,printed,spatialType]);
  useFrame(({camera})=>{
    const pose=runtime.current;
    if(!pose.visible || document.hidden)return;
    const p=pose.progress;
    path.getPoint(p,sample.current);
    const intro=(1-pose.intro);
    camera.position.set(sample.current.x+pose.pointerX*.22+intro*.7,sample.current.y-pose.pointerY*.12,sample.current.z);
    // Separate foreground passes, a clear middle subject, and another destination.
    camera.lookAt(sample.current.x*.35,sample.current.y*.25-.12,sample.current.z-14);
    stations.current.forEach((station,i)=>{
      if(!station)return;
      const distance=station.position.z-camera.position.z;
      station.visible=distance<4 && distance>-27;
      station.position.x=i===0 ? (mobile?.55:3.15)*(1-ease(.04,.22,p)) : mobile?.35:i===1?2.4:i===2?2.8:2.4;
      station.position.y=mobile ? -1.3 : -.2;
      const scale=mobile? .8 : i===0?1.22:i===1?.95:i===2?.93:1.05;
      station.scale.setScalar(scale);
      station.rotation.set(.13+pose.pointerY*.025,-.2+pose.pointerX*.04+intro*.48, i===0?-.18:i===1?.25:i===2?-.12:.16);
      station.children.forEach((part,j)=>{
        if(!(part instanceof Mesh))return;
        const spread=i===0?ease(.05,.25,p):i===1?1-ease(.46,.62,p):i===2?1-ease(.58,.75,p):1-ease(.81,.98,p);
        const direction=j===0?-1:j===1?1:0;
        part.position.set(direction*spread*(i===0?2.6:i===1?2:1.65),spread*(j===2?1.6:j===0?.35:-.55),spread*(j===0?-.8:j===1?.9:.2));
        part.rotation.set((j===0?.25:j===1?-.6:.8)+spread*(j===0?.32:-.32)+(i===1?j*.6:i===2?.75:0),(j===0?-.22:j===1?.25:-.35)+spread*direction*.7+(i===2?.8:0), spread*direction*.42 + (i===3&&j===1?-.75*(1-spread):0));
        part.scale.set(i===1?1.2:1,i===1?.65:i===2?.85:1,1);
      });
    });
    if(keyLight.current){
      keyLight.current.position.set(-4,7,camera.position.z+3);
      keyLight.current.target.position.set(0,-.5,camera.position.z-10);
      keyLight.current.target.updateMatrixWorld();
    }
    frameCount.current++;
    const root=gl.domElement.closest<HTMLElement>("[data-identity-journey]");
    if(root){root.dataset.drawFrames=String(frameCount.current);if(frameCount.current%8===0){root.dataset.cameraZ=camera.position.z.toFixed(2);root.dataset.drawCalls=String(gl.info.render.calls);root.dataset.triangles=String(gl.info.render.triangles);root.dataset.dpr=String(gl.getPixelRatio());}}
    // Never invalidate here. GSAP/input wake frames; a settled scene sleeps.
  });
  return <>
    <ambientLight intensity={.35} />
    <directionalLight ref={keyLight} position={[-4,7,15]} intensity={2.7} color="#fff4df" castShadow
      shadow-mapSize={mobile?[512,512]:[1024,1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-camera-near={.5} shadow-camera-far={40} shadow-bias={-.0003} shadow-normalBias={.025}/>
    <directionalLight position={[8,3,0]} intensity={1.8} color="#9aafff" />
    <directionalLight position={[-5,-2,-24]} intensity={1.2} color="#a5dbef" />
    {[0,-13,-26,-38].map((z,i)=><group key={z} dispose={null} position={[0,0,z]} ref={node=>{stations.current[i]=node;}}>
      {parts.map((part,j)=><mesh key={part.name} geometry={part.geometry} material={j===0?printed.material:i===3&&j===1?alternative:part.material} castShadow receiveShadow />)}
    </group>)}
    <mesh geometry={traces[0]}><meshBasicMaterial color="#f5cd50" toneMapped={false}/></mesh>
    {spatialType.geometries.map((geometry,i)=><mesh key={i} geometry={geometry} position={[2.8,1.8,-7-i*13]} rotation={[.08,-.22,-.06]}>
      <meshBasicMaterial map={spatialType.texture} transparent opacity={.28} depthWrite={false} toneMapped={false}/>
    </mesh>)}
    {[-13,-26,-38].map((z,i)=><group key={z} position={[0,-.4,z]}>
      <mesh geometry={traces[1]} rotation={[i*.4,.3,-.1]}><meshBasicMaterial color={i===2?"#29cbce":"#d9d5c5"} toneMapped={false}/></mesh>
      {/* These rigid rails ground the curved parts in a constructed spatial system. */}
      <mesh position={[0,-2.7,0]} rotation={[0,0,.12]} castShadow><boxGeometry args={[5.6,.09,.18]}/><meshStandardMaterial color="#858b9b" roughness={.4} metalness={.65}/></mesh>
      <mesh position={[-2.1,-2.4,-.5]} castShadow><boxGeometry args={[.1,.7,.5]}/><meshStandardMaterial color="#282d3b" roughness={.85}/></mesh>
    </group>)}
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-3.8,-14]} receiveShadow><planeGeometry args={[80,130]}/><meshStandardMaterial color="#02040b" roughness={.94} metalness={0} envMapIntensity={.05}/></mesh>
  </>;
}

export function SpatialJourney(props:{runtime:MutableRefObject<JourneyRuntime>;onReady:()=>void;onLost:()=>void;onInvalidate:(fn:(()=>void)|null)=>void}) {
  return <div className={styles.canvas}><Canvas frameloop="demand" dpr={typeof window!=="undefined"&&window.innerWidth<768?1:[1,1.5]} camera={{position:[0,0,13],fov:38,near:.1,far:90}} shadows
    gl={{alpha:true,antialias:true,powerPreference:"high-performance"}} onCreated={({gl})=>{gl.toneMapping=ACESFilmicToneMapping;gl.toneMappingExposure=1.1;gl.shadowMap.type=PCFSoftShadowMap;}}>
    <Suspense fallback={null}><World {...props}/></Suspense>
  </Canvas></div>;
}
