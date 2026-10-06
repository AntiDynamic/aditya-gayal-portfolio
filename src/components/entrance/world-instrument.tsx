"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Group, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { RevealInstrument } from "../reveal-instrument";
import { getEntranceComposition } from "./entrance-manifest";
import { getBreakAssembly } from "./entrance-break";
import { heroWorldAnchor, openingPose, cavityAnchor } from "./world-layout";
import { thoughtStates } from "../thought-states";
import type { WorldRuntime } from "./world-context";

export function WorldInstrument({
  runtime,
  active,
  passing,
  onInvalidate,
  onReady,
  onLost,
}: {
  runtime: MutableRefObject<WorldRuntime>;
  active: boolean;
  passing: boolean;
  onInvalidate?: (fn: (() => void) | null) => void;
  onReady?: () => void;
  onLost?: () => void;
}) {
  const group = useRef<Group>(null);
  const shadow = useRef<Group>(null);
  const { size, viewport, invalidate, get, set, gl } = useThree();
  const mobile = size.width < 768;
  const composition = useMemo(() => getEntranceComposition(mobile), [mobile]);
  const assembly = useMemo(() => getBreakAssembly(mobile), [mobile]);
  const cavity = useMemo(
    () =>
      cavityAnchor(
        assembly.fragment.points,
        composition.width,
        composition.height,
      ),
    [assembly, composition],
  );
  const notified = useRef(false);
  const readyFrame = useRef<number | null>(null);
  const target = useRef(new Vector3());
  const initialDistance = useRef(24);
  const lastSelection = useRef(-1);
  const start = useRef(false);
  useEffect(() => {
    if (!active && !start.current) {
      const camera = get().camera;
      if (camera instanceof OrthographicCamera) {
        camera.left = -size.width / 200;
        camera.right = size.width / 200;
        camera.top = size.height / 200;
        camera.bottom = -size.height / 200;
        camera.updateProjectionMatrix();
      }
      invalidate();
    }
  }, [active, size.width, size.height, get, invalidate]);
  useEffect(() => {
    notified.current = false;
    invalidate();
    return () => {
      if (readyFrame.current !== null) cancelAnimationFrame(readyFrame.current);
    };
  }, [active, invalidate]);
  useEffect(() => {
    const lost = (e: Event) => {
      e.preventDefault();
      onLost?.();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onLost]);
  useEffect(() => {
    onInvalidate?.(invalidate);
    invalidate();
    return () => onInvalidate?.(null);
  }, [onInvalidate, invalidate, active, passing]);
  useFrame(() => {
    if (!group.current) return;
    const sourceX = cavity.x,
      sourceY = cavity.y;
    const p = passing ? runtime.current.passage : active ? 0 : 1;
    const hero = runtime.current.hero;
    group.current.visible = active || passing || !!hero?.visible.current;
    const anchor = heroWorldAnchor(hero, size, get().camera);
    const { progress } = anchor;
    const toX = anchor.x,
      toY = anchor.y;
    const pose = openingPose(p, sourceX, sourceY, anchor);
    const blend = Math.max(0, Math.min(1, (p - 0.12) / 0.88));
    target.current.set(
      sourceX * pose.scale + pose.x,
      sourceY * pose.scale + pose.y,
      (-0.8 * pose.scale + pose.z) * (1 - p),
    );
    group.current.position.copy(target.current);
    const endScale = anchor.scale;
    group.current.scale.setScalar(
      (mobile ? 0.19 : 0.23) + (endScale - (mobile ? 0.19 : 0.23)) * blend,
    );
    group.current.rotation.z =
      0.18 - progress * 0.32 + (hero?.motion.current.velocity ?? 0) * 0.1;
    group.current
      .getObjectByName("key-wing")
      ?.rotation.set(
        0,
        Math.min(0.28, Math.abs(hero?.motion.current.velocity ?? 0) * 0.12),
        -0.22 - progress * 0.42,
      );
    if (passing && !start.current) {
      const old = get().camera;
      const top = "top" in old ? Number(old.top) : viewport.height / 2;
      const cam = new PerspectiveCamera(32, size.width / size.height, 0.1, 80);
      initialDistance.current = top / Math.tan((16 * Math.PI) / 180);
      cam.position.set(0, 0, initialDistance.current);
      set({ camera: cam });
      start.current = true;
    }
    if (start.current) {
      const cam = get().camera;
      cam.position.set(
        Math.sin(p * Math.PI) * sourceX * 0.32,
        Math.sin(p * Math.PI) * sourceY * 0.32,
        initialDistance.current * (1 - 0.08 * p),
      );
      cam.rotation.set(0, 0, 0);
      cam.updateProjectionMatrix();
    }
    if (shadow.current) {
      shadow.current.position.set(toX + 0.12, toY - 0.35, -0.25);
      shadow.current.scale.setScalar(endScale);
      shadow.current.visible = p > 0.9;
    }
    if (!active && !notified.current) {
      notified.current = true;
      readyFrame.current = requestAnimationFrame(() => {
        onReady?.();
        readyFrame.current = null;
      });
    }
    const selected = hero?.selected.current ?? 0;
    const color = thoughtStates[selected].artifactColor;
    if (lastSelection.current !== selected) {
      group.current.traverse((node) => {
        if ("material" in node) {
          const material = node.material as {
            color?: { getHexString: () => string; set: (c: string) => void };
          };
          if (node.name === "key-enamel" && material.color)
            material.color.set(color);
        }
      });
      lastSelection.current = selected;
    }
  });
  return (
    <>
      <group ref={group}>
        <RevealInstrument />
      </group>
      <group ref={shadow} visible={false}>
        <mesh receiveShadow>
          <planeGeometry args={[4.5, 4]} />
          <shadowMaterial transparent opacity={0.16} depthWrite={false} />
        </mesh>
      </group>
      {!active && (
        <>
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[-7, 8, 11]}
            intensity={2.3}
            castShadow
            shadow-mapSize={size.width < 768 ? [512, 512] : [1024, 1024]}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
            shadow-camera-near={0.1}
            shadow-camera-far={35}
            shadow-normalBias={0.015}
            shadow-radius={4}
            shadow-blurSamples={6}
          />
          <directionalLight
            position={[1, 4, 16]}
            intensity={0.45}
            color="#eaf2ff"
          />
        </>
      )}
    </>
  );
}
