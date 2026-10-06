import { OrthographicCamera, PerspectiveCamera, type Camera } from "three";
import type { HeroBinding } from "./world-context";

export function heroWorldAnchor(
  hero: HeroBinding | null,
  size: { width: number; height: number },
  camera: Camera,
) {
  const progress = hero?.motion.current.progress ?? 0;
  const rect = hero?.bounds.current;
  const width = rect?.width ?? size.width;
  const small = width < 640;
  const tablet = !small && width < 1200;
  const x = small
    ? 24 + progress * 52
    : tablet
      ? 14 + progress * 34
      : 16 + progress * 68;
  const y = small
    ? 58 - Math.sin(progress * Math.PI) * 10
    : tablet
      ? 72 - Math.sin(progress * Math.PI) * 12
      : 63 - Math.sin(progress * Math.PI) * 20;
  const units =
    camera instanceof OrthographicCamera
      ? (camera.right - camera.left) / camera.zoom / size.width
      : camera instanceof PerspectiveCamera
        ? (2 *
            Math.abs(camera.position.z) *
            Math.tan((camera.fov * Math.PI) / 360)) /
          size.height
        : 0.01;
  return {
    x: ((rect?.left ?? 0) + (width * x) / 100 - size.width / 2) * units,
    y:
      (size.height / 2 -
        (rect?.top ?? 0) -
        ((rect?.height ?? size.height) * y) / 100) *
      units,
    scale: small ? 1 : tablet ? 1.35 : 1.5,
    progress,
  };
}

export function openingPose(
  progress: number,
  sourceX: number,
  sourceY: number,
  destination: { x: number; y: number },
) {
  const scale = 1 + progress * 2.5;
  return {
    scale,
    x: progress * (destination.x - sourceX * scale),
    y: progress * (destination.y - sourceY * scale),
    z: progress * 7,
  };
}

/** The authored fracture supplies its own destination; no second placement map. */
export function cavityAnchor(
  points: [number, number][],
  width: number,
  height: number,
) {
  let area = 0,
    x = 0,
    y = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    const cross = a[0] * b[1] - b[0] * a[1];
    area += cross;
    x += (a[0] + b[0]) * cross;
    y += (a[1] + b[1]) * cross;
  }
  return {
    x: (x / (3 * area) - width / 2) / 100,
    y: (height / 2 - y / (3 * area)) / 100,
  };
}
