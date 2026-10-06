"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CanvasTexture, ExtrudeGeometry, Float32BufferAttribute, OrthographicCamera, VSMShadowMap, SRGBColorSpace, TubeGeometry, CatmullRomCurve3, Vector3, DoubleSide, Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { getEntranceComposition, getEntranceInterior, type EntranceComposition, type EntrancePiece } from "./entrance-manifest";
import { MATERIAL_FINISH, useSurfaceTextures } from "./entrance-materials";
import { useEntrancePresence } from "./entrance-presence";
import { getBreakAssembly, type EntranceBreakStore, type Point } from "./entrance-break";
import { useEntranceBreakMotion } from "./entrance-break-motion";
import { surfaceOutline as outline, cavityWall } from "./entrance-geometry";

export type EntranceSceneProps = {
  onReady: () => void;
  onLost: () => void;
  reducedMotion?: boolean;
  breakStore: EntranceBreakStore;
};

function Surface({ piece, composition, atlas, textures }: { piece: EntrancePiece; composition: EntranceComposition; atlas: CanvasTexture | null; textures: ReturnType<typeof useSurfaceTextures> }) {
  const geometry = useMemo(() => {
    const geometry = new ExtrudeGeometry(outline(piece.points, composition), {
      depth: piece.depth / 100, bevelEnabled: true, bevelSegments: piece.material === "paper" ? 1 : 4,
      steps: 1, bevelSize: piece.material === "paper" ? 0.004 : piece.material === "enamel" ? 0.008 : 0.018,
      bevelThickness: piece.material === "paper" ? 0.003 : 0.018,
      curveSegments: 1,
    });
    // One common planar UV field: print crosses joins without restarting on each sheet.
    const positions = geometry.getAttribute("position");
    const uv = new Float32Array(positions.count * 2);
    for (let index = 0; index < positions.count; index++) {
      // A slight physical lean exposes the cut edges to the straight-on camera.
      const rise = Math.max(0, positions.getZ(index));
      positions.setX(index, positions.getX(index) - rise * 0.24);
      positions.setY(index, positions.getY(index) + rise * 0.35);
      // One deliberate paper lift, not a uniform slab edge. UVs remain registered
      // in the common editorial plane while the printed face changes depth.
      if (piece.material === "paper" && piece.role === "primary") {
        const across = (positions.getX(index) * 100 + composition.width / 2) / composition.width;
        const lift = Math.max(0, across - .42) * (piece.id === "sweep" ? .34 : .2);
        positions.setZ(index, positions.getZ(index) + lift);
      }
      uv[index * 2] = (positions.getX(index) * 100 + composition.width / 2) / composition.width;
      uv[index * 2 + 1] = (positions.getY(index) * 100 + composition.height / 2) / composition.height;
    }
    geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    geometry.computeVertexNormals();
    if (piece.material === "enamel") return toCreasedNormals(geometry,Math.PI/3);
    return geometry;
  }, [piece, composition]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const printed = piece.role === "primary";
  const metal = piece.material === "aluminum";
  const acrylic = piece.material === "acrylic";
  return (
    <>
    {piece.material === "paper" && piece.role === "primary" && <mesh geometry={geometry} position={[.004, -.013, piece.z / 100 - .035]}><meshStandardMaterial color="#e2d6c3" roughness={1} /></mesh>}
    <mesh geometry={geometry} position={[0, 0, piece.z / 100]} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" {...MATERIAL_FINISH[piece.material]} color={piece.color} map={printed ? atlas : null} normalMap={piece.material === "paper" ? textures.paperNormal : piece.material === "enamel" ? textures.enamelNormal : metal ? textures.metalNormal : null} onUpdate={(material) => { material.needsUpdate = true; }} />
      <meshStandardMaterial attach="material-1" color={piece.material === "paper" ? "#ded2bf" : piece.material === "enamel" ? "#e0e0d8" : piece.color} roughness={metal ? 0.56 : piece.material === "paper" ? 1 : 0.6} metalness={metal ? 0.65 : 0} transparent={acrylic} opacity={acrylic ? 0.52 : 1} />
    </mesh>
    </>
  );
}

function SignatureSurface({ root, name, atlas, textures }: { root: import("three").Group; name:string; atlas:CanvasTexture|null; textures:ReturnType<typeof useSurfaceTextures> }) {
  const object=useMemo(()=>{
    const source=root.getObjectByName(name);
    if (!source) throw new Error(`Missing signature node: ${name}`);
    const clone=source.clone(true);
    clone.traverse(node=>{
      if (!(node instanceof Mesh)) return;
      node.castShadow=true; node.receiveShadow=true;
      const materials=Array.isArray(node.material) ? node.material : [node.material];
      const mapped=materials.map(source=>{
        const material=(source as MeshStandardMaterial).clone();
        if (material.name==="PrintFace") {
          material.map=atlas; material.normalMap=textures.enamelNormal;
          // glTF stores V downward. Restore our shared atlas's upward UV field.
          node.geometry=node.geometry.clone();
          const uv=node.geometry.getAttribute("uv");
          for (let index=0;index<uv.count;index++) uv.setY(index,1-uv.getY(index));
          uv.needsUpdate=true;
        }
        if (material.name==="BrushedMetal") {
          material.normalMap=textures.metalNormal;
          material.normalScale.set(.08,.16);
        }
        material.needsUpdate=true;
        return material;
      });
      node.material=Array.isArray(node.material) ? mapped : mapped[0];
    });
    return clone;
  },[root,name,atlas,textures]);
  useEffect(()=>()=>object.traverse(node=>{
    if (node instanceof Mesh) {
      const materials=Array.isArray(node.material) ? node.material : [node.material];
      if (materials.some(material=>material.name==="PrintFace")) node.geometry.dispose();
      materials.forEach(material=>material.dispose());
    }
  }),[object]);
  return <primitive object={object} />;
}

function Stroke({ points, composition, color, radius = .006 }: { points: Point[]; composition: EntranceComposition; color: string; radius?: number }) {
  const geometry = useMemo(() => new TubeGeometry(new CatmullRomCurve3(points.map(([x,y]) => new Vector3((x-composition.width/2)/100-.096,(composition.height/2-y)/100+.14,.485)), false, "catmullrom", 0), Math.max(1,points.length-1),radius,3,false), [points, composition, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial color={color} roughness={1} /></mesh>;
}

function Field({ onReady, onLost, breakStore }: EntranceSceneProps) {
  const { size, get, gl, invalidate } = useThree();
  const mobile = size.width < 768;
  const composition = useMemo(() => getEntranceComposition(mobile), [mobile]);
  const sculpture = useEntrancePresence(composition);
  const { fragment: fragmentRef, intact: intactRef, body: bodyRef, paper: paperRef, metal: metalRef, rubber: rubberRef, debris: debrisRef, trace: traceRef } = useEntranceBreakMotion(breakStore, composition);
  const breakState = useSyncExternalStore(breakStore.subscribe, breakStore.getSnapshot, breakStore.getServerSnapshot);
  const assembly = useMemo(() => getBreakAssembly(mobile), [mobile]);
  const textures = useSurfaceTextures(composition.width, composition.height);
  const modelUrl=`/entrance/models/entrance-break-${mobile ? "mobile" : "desktop"}.glb`;
  const model=useLoader(GLTFLoader,modelUrl);
  useEffect(()=>()=>{
    model.scene.traverse(node=>{
      if (node instanceof Mesh) {
        node.geometry.dispose();
        (Array.isArray(node.material) ? node.material : [node.material]).forEach(material=>material.dispose());
      }
    });
    useLoader.clear(GLTFLoader,modelUrl);
  },[model,modelUrl]);
  const [atlas, setAtlas] = useState<CanvasTexture | null>(null);
  const notified = useRef(false);
  const warmed = useRef(false);
  const readyFrameRef = useRef<number | null>(null);
  const metricFrameRef = useRef<number | null>(null);
  const measuredPose = useRef("");
  const callbacks = useRef({ onReady, onLost });
  useEffect(() => { callbacks.current = { onReady, onLost }; }, [onReady, onLost]);

  useEffect(() => {
    // Camera frustum is imperative Three state, not React render state.
    const ortho = get().camera as OrthographicCamera;
    const unitsPerPixel = Math.max(composition.width / size.width, composition.height / size.height) / 100;
    ortho.left = -size.width * unitsPerPixel / 2;
    ortho.right = size.width * unitsPerPixel / 2;
    ortho.top = size.height * unitsPerPixel / 2;
    ortho.bottom = -size.height * unitsPerPixel / 2;
    ortho.updateProjectionMatrix();
    gl.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5));
    invalidate();
  }, [get, composition, size.width, size.height, gl, invalidate, mobile]);

  useEffect(() => {
    let cancelled = false;
    let texture: CanvasTexture | undefined;
    notified.current = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const resolution = Math.min(mobile ? 2 : 1.5, 2048 / composition.width);
      canvas.width = Math.ceil(composition.width * resolution);
      canvas.height = Math.ceil(composition.height * resolution);
      const context = canvas.getContext("2d");
      if (!context) { callbacks.current.onLost(); return; }
      context.scale(resolution, resolution);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, composition.width, composition.height);
      context.fillStyle = "#22211f";
      const font = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || '"Bricolage Grotesque", Arial, sans-serif';
      context.textBaseline = "alphabetic";
      for (const line of composition.titleLines) {
        context.font = `800 ${line.size}px ${font}`;
        context.letterSpacing = `${line.size * -0.045}px`;
        context.fillText(line.text, line.x, line.y);
      }
      texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
      setAtlas(texture);
      invalidate();
    }).catch(() => callbacks.current.onLost());
    return () => {
      cancelled = true;
      if (readyFrameRef.current !== null) cancelAnimationFrame(readyFrameRef.current);
      if (metricFrameRef.current !== null) cancelAnimationFrame(metricFrameRef.current);
      texture?.dispose();
    };
  }, [composition, gl, invalidate, mobile]);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); callbacks.current.onLost(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl]);

  useEffect(()=>{
    if (!atlas) return;
    // compile() traverses hidden meshes too: the fragment must be ready before a hit.
    gl.initTexture(atlas);
    gl.compile(get().scene,get().camera);
    warmed.current=true;
    invalidate();
    return ()=>{ warmed.current=false; };
  },[atlas,gl,get,invalidate]);

  // Demand rendering remains idle after the completed, font-ready frame.
  useFrame(() => {
    const pose = `${breakState.phase}/${breakState.charging}/${fragmentRef.current?.visible}`;
    if (atlas && measuredPose.current !== pose) {
      measuredPose.current = pose;
      if (metricFrameRef.current !== null) cancelAnimationFrame(metricFrameRef.current);
      metricFrameRef.current = requestAnimationFrame(() => {
        metricFrameRef.current = null;
        gl.domElement.dataset.renderStats = JSON.stringify({ calls:gl.info.render.calls, triangles:gl.info.render.triangles, geometries:gl.info.memory.geometries, textures:gl.info.memory.textures, programs:gl.info.programs?.length, dpr:gl.getPixelRatio(), fragmentVisible:fragmentRef.current?.visible });
      });
    }
    if (atlas && warmed.current && !notified.current) {
      notified.current = true;
      readyFrameRef.current = requestAnimationFrame(() => {
        readyFrameRef.current = null;
        callbacks.current.onReady();
      });
    }
  });

  const interior = useMemo(() => getEntranceInterior(mobile).map((layer) => {
    const shape = outline(layer.points, composition);
    if (layer.opening) shape.holes.push(outline(layer.opening, composition));
    return { ...layer, geometry: new ExtrudeGeometry(shape, { depth: layer.depth / 100, bevelEnabled: false }) };
  }), [composition, mobile]);
  useEffect(() => () => interior.forEach((layer) => layer.geometry.dispose()), [interior]);

  const recess=useMemo(()=>cavityWall(assembly.fragment.points,composition),[assembly,composition]);
  const backplane=useMemo(()=>new ExtrudeGeometry(outline(assembly.fragment.points,composition),{depth:.015,bevelEnabled:false}),[assembly,composition]);
  useEffect(()=>()=>{ recess.dispose(); backplane.dispose(); },[recess,backplane]);
  const pivot = [(assembly.pivot[0]-composition.width/2)/100,(composition.height/2-assembly.pivot[1])/100];
  const joint=[(assembly.focus[0]-composition.width/2)/100,(composition.height/2-assembly.focus[1])/100];
  const damaged = breakState.damage >= 2;
  const crack = useMemo(() => assembly.cut.slice(0,breakState.damage === 2 ? 4 : assembly.cut.length), [assembly, breakState.damage]);

  return (
    <>
      <ambientLight intensity={0.65} color="#fff8eb" />
      <directionalLight position={[-7, 8, 11]} intensity={2.3} color="#fffaf1" castShadow shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-camera-near={0.1} shadow-camera-far={35} shadow-normalBias={0.012} shadow-bias={-0.0001} shadow-radius={8} shadow-blurSamples={12} />
      <directionalLight position={[1, 4, 16]} intensity={0.45} color="#eaf2ff" />
      <mesh position={[0, 0, -0.04]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <shadowMaterial transparent opacity={0.18} />
      </mesh>
      <group ref={sculpture}>
        <group>{interior.map((layer) => <mesh key={layer.id} geometry={layer.geometry} position={[0, 0, layer.z / 100]} receiveShadow><meshStandardMaterial color={layer.color} roughness={.8} /></mesh>)}</group>
        <group visible={breakState.damage>=2}>
          <mesh geometry={recess} receiveShadow><meshStandardMaterial vertexColors roughness={1} side={DoubleSide} /></mesh>
          <mesh geometry={backplane} position={[0,0,-1.22]} receiveShadow><meshStandardMaterial color="#091b46" roughness={1} /></mesh>
          <mesh position={[pivot[0]+.32,pivot[1]-.85,-.72]} rotation={[0,.15,-.08]} receiveShadow><boxGeometry args={[mobile ? .05 : .08,mobile ? 1.05 : 1.65,.08]} /><meshStandardMaterial color="#1c4284" roughness={.86} /></mesh>
          <mesh position={[pivot[0]+.15,pivot[1]-.70,-.74]} rotation={[0,.10,-.08]} receiveShadow><boxGeometry args={[mobile ? .34 : .62,.035,.10]} /><meshStandardMaterial color="#1c4284" roughness={.86} /></mesh>
          <group ref={traceRef} position={[pivot[0]+.28,pivot[1]-(mobile ? 1.20 : 1.52),-1.15]} visible={false}>
            <mesh position={[.10,0,0]}><boxGeometry args={[mobile ? .16 : .26,.012,.008]} /><meshBasicMaterial color="#b6c9e4" /></mesh>
            <mesh position={[mobile ? .20 : .26,.03,0]}><boxGeometry args={[.025,.025,.008]} /><meshBasicMaterial color="#e9ba52" /></mesh>
          </group>
        </group>
        {composition.pieces.map((piece) => piece.id === "raised-flap" ? <group key={piece.id} name={piece.id}>
          <group ref={intactRef} visible={!damaged}>
            <Surface piece={piece} composition={composition} atlas={atlas} textures={textures} />
            {breakState.damage===1 && <Stroke points={assembly.branches[breakState.variant].slice(0,3)} composition={composition} color="#858479" radius={.0025} />}
          </group>
          <group ref={bodyRef} visible={damaged}><Surface piece={assembly.body} composition={composition} atlas={atlas} textures={textures} /></group>
          <group ref={fragmentRef} position={[pivot[0],pivot[1],0]}>
            <group position={[-pivot[0],-pivot[1],0]}>
              <SignatureSurface root={model.scene} name="BreakFragment" atlas={atlas} textures={textures} />
              {damaged && <>
                {breakState.damage===2 && <Stroke points={crack} composition={composition} color="#5b5a51" radius={.003} />}
                <Stroke points={assembly.branches[breakState.variant]} composition={composition} color="#747369" radius={.0025} />
              </>}
            </group>
          </group>
        </group> : piece.id==="metal-lip" || piece.id==="rubber-join" ? <group key={piece.id} name={piece.id} ref={piece.id==="metal-lip" ? metalRef : rubberRef} position={[joint[0],joint[1],0]}>
          <group position={[-joint[0],-joint[1],0]}><SignatureSurface root={model.scene} name={piece.id==="metal-lip" ? "MetalBracket" : "RubberJoint"} atlas={atlas} textures={textures} /></group>
        </group> : <group key={piece.id} name={piece.id} ref={piece.id === "lower-shell" ? paperRef : undefined}><Surface piece={piece} composition={composition} atlas={atlas} textures={textures} /></group>)}
        <group ref={debrisRef} visible={false}>
          {[0,1,2,3].map(index => <mesh key={index}><tetrahedronGeometry args={[.035+index*.009,0]} /><meshStandardMaterial color={index%2 ? "#d9dbd2" : "#f5f4ef"} roughness={.8} /></mesh>)}
        </group>
      </group>
    </>
  );
}

export function EntranceScene(props: EntranceSceneProps) {
  return (
    <Canvas orthographic camera={{ position: [0, 0, 24], near: 0.1, far: 60 }} frameloop="demand" dpr={[1, 1.5]} shadows={{ type: VSMShadowMap }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} style={{ width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
      <Field {...props} />
    </Canvas>
  );
}

export default EntranceScene;
