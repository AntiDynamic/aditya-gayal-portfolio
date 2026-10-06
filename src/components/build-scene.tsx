"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  ExtrudeGeometry,
  Group,
  Shape,
  SRGBColorSpace,
  Vector3,
} from "three";
import { physicalPiecePose } from "./build-poses";
import type { Piece } from "./build-sequence";

type Props = {
  pieces: Piece[];
  damage: number[];
  rebuilt: boolean;
  rebuilding: boolean;
  onReady: () => void;
  onLost: () => void;
};
const thickness = {
  paper: 0.035,
  ceramic: 0.24,
  metal: 0.085,
  rubber: 0.18,
  acrylic: 0.055,
};
const faces = {
  paper: "#f5edda",
  ceramic: "#f15c47",
  metal: "#b9b4a7",
  rubber: "#36342f",
  acrylic: "#63c5ca",
};
function PhysicalPart({
  piece,
  index,
  damage,
  brokenSupport,
  repaired,
  rebuilding,
}: {
  piece: Piece;
  index: number;
  damage: number;
  brokenSupport: boolean;
  repaired: boolean;
  rebuilding: boolean;
}) {
  const group = useRef<Group>(null);
  const { invalidate, viewport } = useThree();
  const reduced = useRef(false);
  const width = (piece.w / 100) * viewport.width,
    height = (piece.h / 100) * viewport.height;
  const mark = piece.label.length === 1;
  const printWidth = mark
    ? Math.min(width * 0.65, height * 0.65)
    : Math.min(width * 0.86, height * 2.4);
  const printHeight = mark ? printWidth : printWidth / 4;
  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width * 0.38, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height * 0.32);
    shape.lineTo(width / 2, height * 0.42);
    shape.lineTo(width * 0.3, height / 2);
    shape.lineTo(-width * 0.46, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height * 0.37);
    shape.closePath();
    return new ExtrudeGeometry(shape, {
      depth: thickness[piece.material],
      bevelEnabled: piece.material !== "paper",
      bevelSize: 0.035,
      bevelThickness: 0.025,
      bevelSegments: 2,
      curveSegments: 4,
    });
  }, [width, height, piece.material]);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = mark ? 128 : 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = piece.material === "rubber" ? "#f6efdf" : "#22211f";
    ctx.font = `800 ${mark ? 90 : 64}px "Bricolage Grotesque", Arial`;
    ctx.textAlign = mark ? "center" : "left";
    ctx.textBaseline = "middle";
    ctx.fillText(piece.label, mark ? 64 : 12, 64, mark ? 112 : 488);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [piece.label, piece.material, mark]);
  const destination = useRef(new Vector3());
  const touched = useRef(false);
  useEffect(() => {
    const pref = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = pref.matches;
      invalidate();
    };
    update();
    pref.addEventListener("change", update);
    return () => pref.removeEventListener("change", update);
  }, [invalidate]);
  useEffect(() => {
    invalidate();
  }, [damage, brokenSupport, repaired, rebuilding, invalidate]);
  useEffect(
    () => () => {
      geometry.dispose();
      texture.dispose();
    },
    [geometry, texture],
  );
  useFrame((_, delta) => {
    if (!group.current) return;
    const repair = repaired || rebuilding;
    const x = ((piece.x + piece.w / 2) / 100 - 0.5) * viewport.width,
      y = (0.5 - (piece.y + piece.h / 2) / 100) * viewport.height;
    const pose = physicalPiecePose(piece, index, damage, brokenSupport, repair);
    destination.current.set(
      x + pose.x,
      y + pose.y,
      0.15 + index * 0.012 + pose.z,
    );
    const alpha = reduced.current
      ? 1
      : 1 -
        Math.exp(
          -Math.min(delta, 0.25) *
            (piece.material === "ceramic"
              ? 7
              : piece.material === "paper"
                ? 10
                : 15),
        );
    if (!touched.current) {
      group.current.position.copy(destination.current);
      touched.current = true;
    } else group.current.position.lerp(destination.current, alpha);
    const rotation = (pose.angle * Math.PI) / 180;
    group.current.rotation.z += (rotation - group.current.rotation.z) * alpha;
    group.current.rotation.x += (pose.tilt - group.current.rotation.x) * alpha;
    if (
      group.current.position.distanceTo(destination.current) > 0.001 ||
      Math.abs(group.current.rotation.z - rotation) > 0.001 ||
      Math.abs(group.current.rotation.x - pose.tilt) > 0.001
    )
      invalidate();
  });
  return (
    <group ref={group}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={faces[piece.material]}
          roughness={
            piece.material === "metal"
              ? 0.37
              : piece.material === "ceramic"
                ? 0.43
                : 0.85
          }
          metalness={piece.material === "metal" ? 0.65 : 0.02}
        />
      </mesh>
      <mesh
        position={[
          0,
          mark ? 0 : index === 1 ? -height * 0.22 : height * 0.1,
          thickness[piece.material] + 0.03,
        ]}
      >
        <planeGeometry args={[printWidth, printHeight]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
      {damage === 1 && piece.material !== "paper" && (
        <mesh
          position={[0.02, 0, thickness[piece.material] + 0.034]}
          rotation={[0, 0, 0.55]}
        >
          <boxGeometry args={[0.018, height * 0.67, 0.012]} />
          <meshBasicMaterial color="#2f211b" />
        </mesh>
      )}
    </group>
  );
}
function Assembly({
  pieces,
  damage,
  rebuilt,
  rebuilding,
  onReady,
  onLost,
}: Props) {
  const { invalidate, gl, size } = useThree();
  const root = useRef<Group>(null);
  const supports = [damage[2] >= 2, damage[8] >= 2, damage[12] >= 2];
  useEffect(() => {
    onReady();
    const lost = () => onLost();
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onReady, onLost]);
  useEffect(() => {
    invalidate();
  }, [damage, rebuilt, rebuilding, invalidate]);
  const repaired = rebuilt || rebuilding;
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[-5, 7, 10]}
        intensity={2.4}
        castShadow
        shadow-mapSize={size.width < 768 ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <directionalLight position={[6, -2, 8]} intensity={0.3} color="#c8d7ff" />
      <group ref={root} rotation={[0.1, -0.1, 0]}>
        {pieces.map((piece, i) => (
          <PhysicalPart
            key={piece.id}
            index={i}
            piece={piece}
            damage={damage[i]}
            brokenSupport={
              piece.dependent
                ? supports[{ a: 0, b: 1, c: 2 }[piece.dependent]]
                : false
            }
            repaired={rebuilt}
            rebuilding={rebuilding}
          />
        ))}
        <group position={[0, 0, -0.02]}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[i - 1, 0.75 - i * 0.85, 0]}
              rotation={[0, 0, repaired ? 0.08 : -0.13]}
            >
              <boxGeometry args={[repaired ? 7.6 : 5, 0.027, 0.035]} />
              <meshStandardMaterial
                color={repaired ? "#b9da35" : "#173fb8"}
                roughness={0.5}
              />
            </mesh>
          ))}
        </group>
      </group>
      <mesh position={[0, -0.05, -0.2]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.17} />
      </mesh>
    </>
  );
}
export function BuildScene(props: Props) {
  return (
    <Canvas
      frameloop="demand"
      orthographic
      camera={{ position: [0, 0, 16], zoom: 65, near: 0.1, far: 40 }}
      dpr={[
        1,
        typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 1.5,
      ]}
      shadows
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    >
      <Assembly {...props} />
    </Canvas>
  );
}
