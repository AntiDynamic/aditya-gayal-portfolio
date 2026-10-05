"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, ExtrudeGeometry, Float32BufferAttribute, OrthographicCamera, VSMShadowMap, Shape, SRGBColorSpace } from "three";
import { getEntranceComposition, getEntranceInterior, type EntranceComposition, type EntrancePiece } from "./entrance-manifest";
import { MATERIAL_FINISH, useSurfaceTextures } from "./entrance-materials";

export type EntranceSceneProps = {
  onReady: () => void;
  onLost: () => void;
  reducedMotion?: boolean;
};

function outline(points: EntrancePiece["points"], composition: EntranceComposition) {
  const shape = new Shape();
  points.forEach(([x, y], index) => {
    const px = (x - composition.width / 2) / 100;
    const py = (composition.height / 2 - y) / 100;
    if (index === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  });
  shape.closePath();
  return shape;
}

function Surface({ piece, composition, atlas, textures }: { piece: EntrancePiece; composition: EntranceComposition; atlas: CanvasTexture | null; textures: ReturnType<typeof useSurfaceTextures> }) {
  const geometry = useMemo(() => {
    const geometry = new ExtrudeGeometry(outline(piece.points, composition), {
      depth: piece.depth / 100, bevelEnabled: true, bevelSegments: piece.material === "paper" ? 1 : 3,
      steps: 1, bevelSize: piece.material === "paper" ? 0.004 : piece.material === "enamel" ? 0.012 : 0.018,
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

function Field({ onReady, onLost }: EntranceSceneProps) {
  const { size, get, gl, invalidate } = useThree();
  const mobile = size.width < 768;
  const composition = useMemo(() => getEntranceComposition(mobile), [mobile]);
  const textures = useSurfaceTextures(composition.width, composition.height);
  const [atlas, setAtlas] = useState<CanvasTexture | null>(null);
  const notified = useRef(false);
  const readyFrameRef = useRef<number | null>(null);
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
      texture?.dispose();
    };
  }, [composition, gl, invalidate, mobile]);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); callbacks.current.onLost(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl]);

  // Demand rendering remains idle after the completed, font-ready frame.
  useFrame(() => {
    if (atlas && !notified.current) {
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

  return (
    <>
      <ambientLight intensity={0.65} color="#fff8eb" />
      <directionalLight position={[-7, 8, 11]} intensity={2.3} color="#fffaf1" castShadow shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-camera-near={0.1} shadow-camera-far={35} shadow-normalBias={0.012} shadow-bias={-0.0001} shadow-radius={8} shadow-blurSamples={12} />
      <directionalLight position={[1, 4, 16]} intensity={0.45} color="#eaf2ff" />
      <mesh position={[0, 0, -0.04]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <shadowMaterial transparent opacity={0.18} />
      </mesh>
      {interior.map((layer) => <mesh key={layer.id} geometry={layer.geometry} position={[0, 0, layer.z / 100]} receiveShadow><meshStandardMaterial color={layer.color} roughness={.8} /></mesh>)}
      {composition.pieces.map((piece) => <Surface key={piece.id} piece={piece} composition={composition} atlas={atlas} textures={textures} />)}
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
