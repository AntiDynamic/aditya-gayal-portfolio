"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { CatmullRomCurve3, ExtrudeGeometry, Group, Mesh, Shape, TubeGeometry, Vector3 } from "three";
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
  shape.moveTo(-0.62, -0.17);
  shape.bezierCurveTo(-0.23, -0.34, 0.17, -0.27, 0.76, -0.03);
  shape.bezierCurveTo(0.49, 0.12, 0.32, 0.41, 0.06, 0.4);
  shape.bezierCurveTo(-0.16, 0.38, -0.38, 0.07, -0.62, -0.17);
  return shape;
}

function RevealArtifact({ motionRef, visibleRef, selected, onInvalidate }: {
  motionRef: MutableRefObject<MotionState>;
  visibleRef: MutableRefObject<boolean>;
  selected: number;
  onInvalidate: (invalidate: () => void) => void;
}) {
  const groupRef = useRef<Group>(null);
  const petalRef = useRef<Mesh>(null);
  const accentRef = useRef<Mesh>(null);
  const bladeRef = useRef<Mesh>(null);
  const shadowRef = useRef<Mesh>(null);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const mobile = size.width < 640;
  const tablet = !mobile && size.width < 1200;
  const color = thoughtStates[selected].artifactColor;
  const petal = useMemo(() => new ExtrudeGeometry(petalShape(), { depth: 0.18, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.055, bevelThickness: 0.05, curveSegments: 18 }), []);
  const accent = useMemo(() => new ExtrudeGeometry(accentShape(), { depth: 0.14, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.04, bevelThickness: 0.04, curveSegments: 16 }), []);
  const blade = useMemo(() => new ExtrudeGeometry(bladeShape(), { depth: 0.09, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.03, curveSegments: 8 }), []);
  const tensionLine = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(-0.52, 0.4, 0.17),
      new Vector3(-0.13, 0.59, 0.17),
      new Vector3(0.22, 0.5, 0.17),
      new Vector3(0.55, 0.22, 0.17),
    ]);
    return new TubeGeometry(curve, 28, 0.012, 6, false);
  }, []);
  const target = useMemo(() => new Vector3(), []);

  useFrame(({ invalidate }, delta) => {
    onInvalidate(invalidate);
    if (!visibleRef.current) return;
    const progress = motionRef.current.progress;
    const xPercent = mobile ? 24 + progress * 52 : tablet ? 14 + progress * 34 : 16 + progress * 68;
    const yPercent = mobile ? 58 - Math.sin(Math.PI * progress) * 10 : tablet ? 72 - Math.sin(Math.PI * progress) * 12 : 63 - Math.sin(Math.PI * progress) * 20;
    const desiredX = (xPercent / 100 - 0.5) * viewport.width;
    const desiredY = (0.5 - yPercent / 100) * viewport.height;
    if (!groupRef.current) return;
    target.set(desiredX, desiredY, 0);
    groupRef.current.position.lerp(target, 1 - Math.exp(-delta * 13));
    const targetRotation = .16 - progress * .32 + motionRef.current.velocity * .16;
    groupRef.current.rotation.z += (targetRotation - groupRef.current.rotation.z) * (1 - Math.exp(-delta * 10));
    const targetBladeRotation = -.18 + motionRef.current.velocity * .26;
    const tension = Math.min(1, Math.abs(motionRef.current.velocity));
    if (accentRef.current) {
      const accentX = .23 + Math.sin(progress * Math.PI) * .08 + tension * .2;
      const accentZ = .08 + tension * .12;
      accentRef.current.position.x += (accentX - accentRef.current.position.x) * (1 - Math.exp(-delta * 12));
      accentRef.current.position.z += (accentZ - accentRef.current.position.z) * (1 - Math.exp(-delta * 12));
    }
    if (petalRef.current) {
      const petalRotation = -.12 - motionRef.current.velocity * .045;
      petalRef.current.rotation.z += (petalRotation - petalRef.current.rotation.z) * (1 - Math.exp(-delta * 10));
    }
    if (bladeRef.current) bladeRef.current.rotation.z += (targetBladeRotation - bladeRef.current.rotation.z) * (1 - Math.exp(-delta * 12));
    if (shadowRef.current) {
      shadowRef.current.position.x = groupRef.current.position.x;
      shadowRef.current.position.y = groupRef.current.position.y - 1.45;
    }

    const distance = groupRef.current.position.distanceTo(target);
    const rotationDistance = Math.abs(targetRotation - groupRef.current.rotation.z);
    const bladeDistance = bladeRef.current ? Math.abs(targetBladeRotation - bladeRef.current.rotation.z) : 0;
    const petalDistance = petalRef.current ? Math.abs((-.12 - motionRef.current.velocity * .045) - petalRef.current.rotation.z) : 0;
    const accentDistance = accentRef.current
      ? Math.max(Math.abs((.23 + Math.sin(progress * Math.PI) * .08 + tension * .2) - accentRef.current.position.x), Math.abs((.08 + tension * .12) - accentRef.current.position.z))
      : 0;
    if (Math.max(distance, rotationDistance, bladeDistance, petalDistance, accentDistance) > .003) invalidate();
  });

  return (
    <>
      <ambientLight intensity={2.2} />
      <directionalLight position={[-3, 5, 8]} intensity={2.1} />
      <directionalLight position={[5, -2, 4]} intensity={.55} />
      <mesh ref={shadowRef} position={[0, -1.7, -0.65]} scale={[2.2, .28, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#494236" transparent opacity={.13} depthWrite={false} />
      </mesh>
      <group ref={groupRef} scale={mobile ? (size.width < 375 ? 1.05 : 1.2) : tablet ? 1.55 : 3.05}>
        <mesh ref={petalRef} geometry={petal} position={[-.04, 0, 0]} rotation={[0, 0, -.12]}>
          <meshStandardMaterial color={ivory} roughness={.76} metalness={.015} />
        </mesh>
        <mesh ref={accentRef} geometry={accent} position={[.23, -.02, .08]} rotation={[0, 0, -.15]}>
          <meshStandardMaterial color={color} roughness={.63} metalness={.02} />
        </mesh>
        <mesh ref={bladeRef} geometry={blade} position={[.12, .02, .2]} rotation={[0, 0, -.18]} scale={[.72, .75, 1]}>
          <meshStandardMaterial color="#d6cfc2" roughness={.58} metalness={.04} />
        </mesh>
        <mesh position={[.06, -.03, .31]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[.125, .035, 8, 32]} />
          <meshStandardMaterial color={metals} metalness={.35} roughness={.46} />
        </mesh>
        <mesh position={[.06, -.03, .35]}>
          <cylinderGeometry args={[.033, .033, .018, 20]} />
          <meshStandardMaterial color="#f6f0e6" roughness={.45} />
        </mesh>
        <mesh geometry={tensionLine}>
          <meshStandardMaterial color="#857d70" roughness={.88} />
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
