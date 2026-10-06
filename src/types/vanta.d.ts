declare module "vanta/dist/vanta.waves.min.js" {
  import type { Camera, Mesh, MeshPhongMaterial, Scene, WebGLRenderer } from "three";
  export interface WavesEffect {
    options: { color: number | string; waveHeight: number; waveSpeed: number; zoom: number; scale: number; scaleMobile: number };
    renderer: WebGLRenderer | null;
    scene: Scene | null;
    camera: Camera;
    plane: Mesh<import("three").BufferGeometry, MeshPhongMaterial>;
    req: number;
    prevNow: number;
    animationLoop(): void;
    setOptions(options: Partial<WavesEffect["options"]>): void;
    resize(): void;
    destroy(): void;
  }
  export default function waves(options: Record<string, unknown>): WavesEffect;
}
