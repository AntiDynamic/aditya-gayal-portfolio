import * as THREE from "three";
import type { CachedRect } from "../motion/rects";

export class NativeProjection {
  private source = new THREE.Matrix4();
  private viewport = new THREE.Matrix4();
  private result = new THREE.Matrix4();
  update(image: HTMLImageElement, mesh: THREE.Mesh, camera: THREE.Camera, rect: CachedRect, scroll: number, width: number, height: number) {
    this.source.set(1 / rect.width, 0, 0, -.5, 0, -1 / rect.height, 0, .5, 0, 0, 1, 0, 0, 0, 0, 1);
    this.viewport.set(width * .5, 0, 0, width * .5 - rect.left, 0, -height * .5, 0, height * .5 - rect.top + scroll, 0, 0, 1, 0, 0, 0, 0, 1);
    this.result.copy(this.viewport).multiply(camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(mesh.matrixWorld).multiply(this.source);
    const values = this.result.elements;
    const divisor = values[15];
    for (let index = 0; index < values.length; index++) values[index] /= divisor;
    values[2] = 0; values[6] = 0; values[10] = 1; values[14] = 0;
    image.style.transformOrigin = "0 0";
    image.style.transform = `matrix3d(${values.map(value => value.toFixed(8)).join(",")})`;
  }
  clear(image: HTMLImageElement) { image.style.removeProperty("transform"); image.style.removeProperty("transform-origin"); image.style.removeProperty("opacity"); }
}
