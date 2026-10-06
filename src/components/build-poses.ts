import type { Piece } from "./build-sequence";

/** Shared offsets in world units. Orthographic zoom is 65 CSS pixels per unit. */
export function physicalPiecePose(
  piece: Piece,
  index: number,
  damage: number,
  supportBroken: boolean,
  repaired: boolean,
) {
  const open = damage >= (piece.material === "paper" ? 1 : 2);
  return {
    x: repaired
      ? index === 6
        ? -0.35
        : index === 4
          ? -0.25
          : ((index % 3) - 1) * 0.1
      : open
        ? piece.fallX / 80
        : 0,
    y: repaired
      ? index === 6
        ? 0.8
        : index === 0
          ? -0.45
          : index === 8
            ? 0.3
            : 0
      : open
        ? -0.75
        : supportBroken
          ? -0.18
          : 0,
    angle: repaired
      ? index === 6
        ? -4
        : 0
      : -piece.rotate + (open ? piece.fallRotate : 0),
    tilt: open && !repaired ? 0.32 : piece.material === "paper" ? -0.045 : 0.02,
    z: open && !repaired ? 0.35 : 0,
  };
}
