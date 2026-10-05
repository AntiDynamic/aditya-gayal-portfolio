"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ExtrudeGeometry, Group, Mesh, Shape, Vector3 } from "three";
import type { MutableRefObject } from "react";
import { thoughtStates } from "./thought-states";

type MotionState = { progress: number; velocity: number };

const ivory = "#f1e8d8";
const metals = "#aaa69d";

function petalShape() {
  const shape = new Shape();
  shape.moveTo(-1.14, -0.12);
  shape.bezierCurveTo(-0.98, 0.48, -0.55, 0.86, -0.1, 0.72);
  shape.bezierCurveTo(0.19, 0.64, 0.35, 0.4, 0.56, 0.18);
  shape.bezierCurveTo(0.24, 0.12, 0.14, -0.02, 0.37, -0.24);
  shape.bezierCurveTo(0.52, -0.39, 0.27, -0.72, -0.16, -0.68);
  shape.bezierCurveTo(-0.63, -0.65, -1.05, -0.46, -1.14, -0.12);
  return shape;
}

function accentShape() {
  const shape = new Shape();
  shape.moveTo(-0.28, 0.08);
  shape.bezierCurveTo(-0.02, 0.44, 0.42, 0.54, 0.98, 0.16);
  shape.bezierCurveTo(0.75, -0.06, 0.57, -0.46, 0.19, -0.43);
  shape.bezierCurveTo(0.01, -0.42, -0.11, -0.18, -0.28, 0.08);
  return shape;
}

function bladeShape() {
  const shape = new Shape();
  shape.moveTo(-0.5, -0.08);
  shape.lineTo(0.72, -0.39);
  shape.quadraticCurveTo(0.83, -0.42, 0.79, -0.29);
  shape.lineTo(0.32, 0.46);
  shape.quadraticCurveTo(0.25, 0.56, 0.17, 0.47);
  shape.lineTo(-0.5, -0.08);
  return shape;
}

function RevealArtifact({ motionRef, visibleRef, selected, onInvalidate }: {
  motionRef: MutableRefObject<MotionState>;
  visibleRef: MutableRefObject<boolean>;
  selected: number;
  onInvalidate: (invalidate: () => void) => void;
}) {
  const groupRef = useRef<Group>(null);
  const bladeRef = useRef<Mesh>(null);
  const shadowRef = useRef<Mesh>(null);
  const viewport = useThree((state) => state.viewport);
  const mobile = viewport.width < 9;
  const color = thoughtStates[selected].color;
  const petal = useMemo(() => new ExtrudeGeometry(petalShape(), { depth: 0.14, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 9 }), []);
  const accent = useMemo(() => new ExtrudeGeometry(accentShape(), { depth: 0.11, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 7 }), []);
  const blade = useMemo(() => new ExtrudeGeometry(bladeShape(), { depth: 0.075, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.018, bevelThickness: 0.018, curveSegments: 3 }), []);
  const target = useMemo(() => new Vector3(), []);

  useFrame(({ invalidate }, delta) => {
    onInvalidate(invalidate);
    if (!visibleRef.current) return;
    const progress = motionRef.current.progress;
    const xPercent = mobile ? 24 + progress * 48 : 14 + progress * 68;
    const yPercent = 51 - Math.sin(Math.PI * progress) * 30;
    const desiredX = (xPercent / 100 - 0.5) * viewport.width;
    const desiredY = (0.5 - yPercent / 100) * viewport.height;
    if (!groupRef.current) return;
    target.set(desiredX, desiredY, 0);
    groupRef.current.position.lerp(target, 1 - Math.exp(-delta * 13));
    const targetRotation = .1 - progress * .2 + motionRef.current.velocity * .12;
    groupRef.current.rotation.z += (targetRotation - groupRef.current.rotation.z) * (1 - Math.exp(-delta * 10));
    const targetBladeRotation = -.18 + motionRef.current.velocity * .21;
    if (bladeRef.current) bladeRef.current.rotation.z += (targetBladeRotation - bladeRef.current.rotation.z) * (1 - Math.exp(-delta * 12));
    if (shadowRef.current) {
      shadowRef.current.position.x = groupRef.current.position.x;
      shadowRef.current.position.y = groupRef.current.position.y - 1.45;
    }

    const distance = groupRef.current.position.distanceTo(target);
    const rotationDistance = Math.abs(targetRotation - groupRef.current.rotation.z);
    const bladeDistance = bladeRef.current ? Math.abs(targetBladeRotation - bladeRef.current.rotation.z) : 0;
    if (Math.max(distance, rotationDistance, bladeDistance) > .003) invalidate();
  });

  return (
    <>
      <ambientLight intensity={2.2} />
      <directionalLight position={[-3, 5, 8]} intensity={2.1} />
      <directionalLight position={[5, -2, 4]} intensity={.55} />
      <mesh ref={shadowRef} position={[0, -1.45, -0.65]} scale={[1.12, .18, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#494236" transparent opacity={.13} depthWrite={false} />
      </mesh>
      <group ref={groupRef} scale={mobile ? (viewport.width < 6.5 ? .82 : .92) : 1.35}>
        <mesh geometry={petal} position={[-.04, 0, 0]} rotation={[0, 0, -.12]}>
          <meshStandardMaterial color={ivory} roughness={.67} metalness={.02} />
        </mesh>
        <mesh geometry={accent} position={[.23, -.02, .08]} rotation={[0, 0, -.15]}>
          <meshStandardMaterial color={color} roughness={.52} metalness={.03} />
        </mesh>
        <mesh ref={bladeRef} geometry={blade} position={[.12, .02, .2]} rotation={[0, 0, -.18]} scale={[.72, .75, 1]}>
          <meshStandardMaterial color="#d6cfc2" roughness={.58} metalness={.04} />
        </mesh>
        <mesh position={[.06, -.03, .31]}>
          <cylinderGeometry args={[.105, .105, .075, 24]} />
          <meshStandardMaterial color={metals} metalness={.48} roughness={.38} />
        </mesh>
        <mesh position={[.06, -.03, .36]}>
          <cylinderGeometry args={[.033, .033, .018, 20]} />
          <meshStandardMaterial color="#f6f0e6" roughness={.45} />
        </mesh>
        <mesh position={[.83, -.28, .23]} rotation={[0, 0, -.38]}>
          <boxGeometry args={[.2, .075, .065]} />
          <meshStandardMaterial color="#4a4742" roughness={.94} />
        </mesh>
        <mesh position={[-.52, .4, .12]} rotation={[0, 0, .36]}>
          <boxGeometry args={[.55, .018, .012]} />
          <meshStandardMaterial color="#aaa194" roughness={.92} />
        </mesh>
      </group>
    </>
  );
}

export function RevealScene({ motionRef, visibleRef, selected, dpr, onInvalidate, onReady, onLost }: {
  motionRef: MutableRefObject<MotionState>;
  visibleRef: MutableRefObject<boolean>;
  selected: number;
  dpr: number;
  onInvalidate: (invalidate: () => void) => void;
  onReady: () => void;
  onLost: () => void;
}) {
  return (
    <Canvas
      dpr={dpr}
      frameloop="demand"
      orthographic
      camera={{ position: [0, 0, 12], zoom: 62, near: 0.1, far: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      onCreated={({ gl, invalidate }) => {
        gl.setClearColor("#000000", 0);
        gl.domElement.addEventListener("webglcontextlost", onLost, { once: true });
        onInvalidate(invalidate);
        onReady();
        invalidate();
      }}
    >
      <RevealArtifact motionRef={motionRef} visibleRef={visibleRef} selected={selected} onInvalidate={onInvalidate} />
    </Canvas>
  );
}
