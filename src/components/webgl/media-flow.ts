import * as THREE from "three";
import type { MediaLayer, MotionFrame } from "./bridge";
import type { CachedRect } from "../motion/rects";
import { clamp, mix, smooth } from "../motion/math";
import { mediaMaterial } from "./media-material";
import { NativeProjection } from "./native-projection";

export class MediaFlow {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  readonly previews: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[];
  private source?: MediaLayer;
  private destination?: MediaLayer;
  private armed: boolean[] = [];
  private nativeProjection = new NativeProjection();
  constructor(geometry: THREE.PlaneGeometry) {
    this.mesh = new THREE.Mesh(geometry, mediaMaterial(new THREE.Texture(), false));
    this.mesh.material.uniforms.uMap.value.dispose();
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
    this.previews = Array.from({ length: 2 }, () => {
      const material = mediaMaterial(new THREE.Texture(), false);
      material.uniforms.uMap.value.dispose();
      const preview = new THREE.Mesh(geometry, material);
      preview.visible = false; preview.frustumCulled = false;
      return preview;
    });
  }
  reset() {
    this.release(this.source); this.release(this.destination);
    this.source = undefined; this.destination = undefined;
    this.mesh.visible = false;
    for (const preview of this.previews) preview.visible = false;
  }
  private release(layer?: MediaLayer) { if (layer) { delete layer.element.dataset.flow; delete layer.element.dataset.gl; delete layer.element.dataset.flowProgress; layer.image.style.removeProperty("opacity"); } }
  update(layers: MediaLayer[], getRect: (element: HTMLElement) => CachedRect, frame: MotionFrame, camera: THREE.Camera) {
    if (frame.reduced || frame.monitor) return;
    for (let index = 0; index < layers.length - 1; index++) {
      const source = layers[index]; const destination = layers[index + 1];
      if (!source.ready || !destination.ready) continue;
      const first = getRect(source.element); const second = getRect(destination.element);
      const start = Math.max(first.top + first.height - frame.height * .58, index > 0 ? first.top - frame.height * .13 : -Infinity);
      const end = second.top - frame.height * .25;
      if (frame.scroll <= start) this.armed[index] = true;
      if (!this.armed[index]) continue;
      if (end <= start + 80 || frame.scroll <= start || frame.scroll >= end) continue;
      const progress = smooth(start, end, frame.scroll);
      const envelope = Math.sin(progress * Math.PI);
      const centerX = mix(first.left + first.width * .5, second.left + second.width * .5, progress);
      const centerY = mix(first.top + first.height * .5, second.top + second.height * .5, progress) - frame.scroll;
      const width = mix(first.width, second.width, progress) * (1 - envelope * .08);
      const height = mix(first.height, second.height, progress) * (1 - envelope * .08);
      const mesh = this.mesh;
      mesh.visible = true;
      mesh.position.set(centerX - frame.width * .5, frame.height * .5 - centerY, mix(source.depth, destination.depth, progress) + envelope * (frame.mobile ? 9 : 45));
      mesh.scale.set(width, height, Math.max(width, height));
      mesh.rotation.set(mix(source.mesh.rotation.x, destination.mesh.rotation.x, progress) - envelope * .018, mix(source.mesh.rotation.y, destination.mesh.rotation.y, progress) + envelope * (second.left > first.left ? -.065 : .065) * (frame.mobile ? .3 : 1), 0);
      const uniforms = mesh.material.uniforms;
      uniforms.uMap.value = source.texture; uniforms.uNextMap.value = destination.texture;
      const sourcePortrait = source.element.dataset.media !== "project";
      const destinationPortrait = destination.element.dataset.media !== "project";
      uniforms.uBlend.value = smooth(sourcePortrait ? .4 : .25, sourcePortrait ? .9 : .78, progress);
      uniforms.uWipeAxis.value = sourcePortrait ? 1 : destinationPortrait ? 2 : 0;
      uniforms.uTension.value = envelope * (frame.mobile ? .25 : 1);
      uniforms.uPortrait.value = mix(sourcePortrait ? 1 : 0, destinationPortrait ? 1 : 0, progress);
      uniforms.uReveal.value = 1;
      uniforms.uSeam.value = envelope;
      uniforms.uWidth.value = width;
      uniforms.uVelocity.value = frame.velocity * (1 - envelope * .7);
      uniforms.uHover.value = mix(source.hover, destination.hover, progress);
      uniforms.uParallax.value = mix(source.mesh.material.uniforms.uParallax.value, destination.mesh.material.uniforms.uParallax.value, progress);
      uniforms.uZoom.value = mix(source.mesh.material.uniforms.uZoom.value, destination.mesh.material.uniforms.uZoom.value, progress);
      uniforms.uPointer.value.set(clamp((frame.pointerX - centerX + width * .5) / width), clamp(1 - (frame.pointerY - centerY + height * .5) / height));
      const aspect = width / height;
      const firstAspect = source.image.naturalWidth / source.image.naturalHeight;
      const secondAspect = destination.image.naturalWidth / destination.image.naturalHeight;
      uniforms.uCover.value.set(Math.min(1, aspect / firstAspect), Math.min(1, firstAspect / aspect));
      uniforms.uNextCover.value.set(Math.min(1, aspect / secondAspect), Math.min(1, secondAspect / aspect));
      this.source = source; this.destination = destination;
      mesh.updateMatrixWorld(true);
      this.nativeProjection.update(source.image, mesh, camera, first, frame.scroll, frame.width, frame.height);
      this.nativeProjection.update(destination.image, mesh, camera, second, frame.scroll, frame.width, frame.height);
      source.image.style.opacity = String(1 - uniforms.uBlend.value);
      destination.image.style.opacity = String(uniforms.uBlend.value);
      for (let previewIndex = 0; previewIndex < this.previews.length; previewIndex++) {
        const preview = this.previews[previewIndex];
        preview.visible = !frame.mobile && destination.element.dataset.media === "project" && envelope > .08;
        if (!preview.visible) continue;
        const side = previewIndex === 0 ? 1 : -1;
        preview.position.set(mesh.position.x + side * width * .42 * envelope, mesh.position.y + side * height * .38, -28 - previewIndex * 12);
        preview.scale.set(width * .34, width * .34 / (secondAspect * .42 / .22), Math.max(width, height));
        preview.rotation.set(0, side * .05 * envelope, side * .045 * envelope);
        const previewUniforms = preview.material.uniforms;
        previewUniforms.uMap.value = destination.texture;
        previewUniforms.uCover.value.set(1, 1);
        previewUniforms.uCrop.value.set(previewIndex === 0 ? .52 : .05, previewIndex === 0 ? .72 : .05, .42, .22);
        previewUniforms.uOpacity.value = envelope * .9;
        previewUniforms.uReveal.value = 1;
      }
      source.mesh.visible = false; destination.mesh.visible = false;
      source.element.dataset.flow = "true"; destination.element.dataset.flow = "true";
      source.element.dataset.flowProgress = clamp(progress).toFixed(3);
      return;
    }
  }
  commit() { if (this.source) this.source.element.dataset.gl = "true"; if (this.destination) this.destination.element.dataset.gl = "true"; }
  dispose() { this.reset(); this.mesh.material.dispose(); for (const preview of this.previews) preview.material.dispose(); }
}
