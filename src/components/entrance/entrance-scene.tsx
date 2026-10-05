"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, ExtrudeGeometry, Float32BufferAttribute, OrthographicCamera, PCFShadowMap, Shape, SRGBColorSpace } from "three";
import { getEntranceComposition, getEntranceSeam, type EntranceComposition, type EntrancePiece } from "./entrance-manifest";

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

function Surface({ piece, composition, atlas }: { piece: EntrancePiece; composition: EntranceComposition; atlas: CanvasTexture | null }) {
  const geometry = useMemo(() => {
    const geometry = new ExtrudeGeometry(outline(piece.points, composition), {
      depth: piece.depth / 100, bevelEnabled: true, bevelSegments: 3,
      steps: 1, bevelSize: piece.role === "primary" ? 0.018 : 0.026,
      bevelThickness: piece.role === "primary" ? 0.024 : 0.025,
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
    <mesh geometry={geometry} position={[0, 0, piece.z / 100]} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" color={piece.color} map={printed ? atlas : null} roughness={metal ? 0.48 : acrylic ? 0.24 : piece.material === "enamel" ? 0.62 : 0.88} metalness={metal ? 0.72 : 0} onUpdate={(material) => { material.needsUpdate = true; }} transparent={acrylic} opacity={acrylic ? 0.58 : 1} depthWrite={!acrylic} />
      <meshStandardMaterial attach="material-1" color={piece.material === "paper" ? "#cfc3af" : piece.color} roughness={metal ? 0.56 : 0.72} metalness={metal ? 0.65 : 0} transparent={acrylic} opacity={acrylic ? 0.72 : 1} />
    </mesh>
  );
}

function Field({ onReady, onLost }: EntranceSceneProps) {
  const { size, get, gl, invalidate } = useThree();
  const mobile = size.width < 768;
  const composition = useMemo(() => getEntranceComposition(mobile), [mobile]);
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

  const seam = useMemo(() => new ExtrudeGeometry(outline(getEntranceSeam(mobile), composition), { depth: 0.04, bevelEnabled: false }), [composition, mobile]);
  useEffect(() => () => seam.dispose(), [seam]);

  return (
    <>
      <ambientLight intensity={1.5} color="#fff8eb" />
      <directionalLight position={[-8, 9, 11]} intensity={3.1} color="#fffaf1" castShadow shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-camera-near={0.1} shadow-camera-far={35} shadow-normalBias={0.015} shadow-bias={-0.0001} shadow-radius={5} />
      <directionalLight position={[6, -3, 7]} intensity={0.6} color="#dfe8f4" />
      <mesh position={[0, 0, -0.025]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <shadowMaterial transparent opacity={0.22} />
      </mesh>
      <mesh geometry={seam} position={[0, 0, 0.015]} receiveShadow>
        <meshStandardMaterial color="#173fb8" roughness={0.74} />
      </mesh>
      {composition.pieces.map((piece) => <Surface key={piece.id} piece={piece} composition={composition} atlas={atlas} />)}
    </>
  );
}

export function EntranceScene(props: EntranceSceneProps) {
  return (
    <Canvas orthographic camera={{ position: [0, 0, 24], near: 0.1, far: 60 }} frameloop="demand" dpr={[1, 1.5]} shadows={{ type: PCFShadowMap }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} style={{ width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden="true">
      <Field {...props} />
    </Canvas>
  );
}

export default EntranceScene;
