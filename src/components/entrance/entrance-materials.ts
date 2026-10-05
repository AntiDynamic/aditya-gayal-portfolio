"use client";

import { useEffect, useMemo } from "react";
import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, Vector2, type MeshStandardMaterialParameters } from "three";
import type { EntranceMaterial } from "./entrance-manifest";

/** Color belongs to the authored composition. These finishes distinguish its objects. */
export const MATERIAL_FINISH: Record<EntranceMaterial, MeshStandardMaterialParameters> = {
  paper: { roughness: 0.96, metalness: 0, normalScale: new Vector2(0.12, 0.12) },
  enamel: { roughness: 0.43, metalness: 0 },
  aluminum: { roughness: 0.49, metalness: 0.78, normalScale: new Vector2(0.16, 0.32) },
  rubber: { roughness: 1, metalness: 0 },
  acrylic: { roughness: 0.2, metalness: 0, transparent: true, opacity: 0.38, depthWrite: false },
};

const TILE_SIZE = 128;

// Integer hash: deterministic, no random state, browser APIs, or external assets.
function grain(x: number, y: number, seed: number) {
  let value = Math.imul(x + seed, 374761393) ^ Math.imul(y + seed, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295 - 0.5;
}

function makeNormal(kind: "paper" | "metal", width: number, height: number) {
  const heights = new Float32Array(TILE_SIZE * TILE_SIZE);
  const wrap = (value: number) => (value + TILE_SIZE) % TILE_SIZE;
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      let value = 0;
      // Paper fibers are short and softly connected. Metal grain runs horizontally.
      const radius = kind === "paper" ? 2 : 12;
      for (let offset = -radius; offset <= radius; offset++) {
        value += grain(wrap(x + offset), y, kind === "paper" ? 19 : 71);
      }
      value /= radius * 2 + 1;
      heights[y * TILE_SIZE + x] = kind === "paper"
        ? value * 0.75 + grain(x, y, 43) * 0.12
        : value * 0.5 + grain(0, y, 97) * 0.24;
    }
  }
  const data = new Uint8Array(TILE_SIZE * TILE_SIZE * 4);
  const sample = (x: number, y: number) => heights[wrap(y) * TILE_SIZE + wrap(x)];
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const dx = (sample(x - 1, y) - sample(x + 1, y)) * 1.6;
      const dy = (sample(x, y - 1) - sample(x, y + 1)) * 1.6;
      const length = Math.hypot(dx, dy, 1);
      const index = (y * TILE_SIZE + x) * 4;
      data[index] = Math.round((dx / length * 0.5 + 0.5) * 255);
      data[index + 1] = Math.round((dy / length * 0.5 + 0.5) * 255);
      data[index + 2] = Math.round((1 / length * 0.5 + 0.5) * 255);
      data[index + 3] = 255;
    }
  }
  const texture = new DataTexture(data, TILE_SIZE, TILE_SIZE, RGBAFormat);
  texture.name = `entrance-${kind}-normal`;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  // The scene uses composition-wide planar UVs. Keep grain near pixel scale on
  // both authored assemblies instead of stretching a tile over an entire face.
  texture.repeat.set(width / 128, height / 128);
  texture.needsUpdate = true;
  return texture;
}

// A shallow ceramic crown changes the light response across the smooth face.
// This is a normal field, not a painted highlight or an albedo gradient.
function makeEnamelNormal() {
  const data = new Uint8Array(TILE_SIZE * TILE_SIZE * 4);
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const nx = (x / (TILE_SIZE - 1) - .78) * .18;
      const ny = (y / (TILE_SIZE - 1) - .64) * .14;
      const length = Math.hypot(nx, ny, 1);
      const index = (y * TILE_SIZE + x) * 4;
      data[index] = Math.round((nx / length * .5 + .5) * 255);
      data[index + 1] = Math.round((ny / length * .5 + .5) * 255);
      data[index + 2] = Math.round((1 / length * .5 + .5) * 255);
      data[index + 3] = 255;
    }
  }
  const texture = new DataTexture(data, TILE_SIZE, TILE_SIZE, RGBAFormat);
  texture.name = "entrance-enamel-crown";
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/** Call once in Field and share the three maps with its faces. No idle frames. */
export function useSurfaceTextures(width: number, height: number) {
  const textures = useMemo(() => ({
    paperNormal: makeNormal("paper", width, height),
    metalNormal: makeNormal("metal", width, height),
    enamelNormal: makeEnamelNormal(),
  }), [width, height]);

  useEffect(() => {
    // Dispose GPU storage, retain the deterministic CPU arrays. A new renderer
    // uploads their existing nonzero texture version without mutating React data.
    return () => {
      textures.paperNormal.dispose();
      textures.metalNormal.dispose();
      textures.enamelNormal.dispose();
    };
  }, [textures]);

  return textures;
}
