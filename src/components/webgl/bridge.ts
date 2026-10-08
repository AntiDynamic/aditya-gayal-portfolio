import * as THREE from "three";
import { mediaMaterial } from "./media-material";
import type { CachedRect } from "../motion/rects";
import { clamp, damp, smooth } from "../motion/math";
import { MediaFlow } from "./media-flow";
import { SheetShadows } from "./sheet-shadows";
import { NativeProjection } from "./native-projection";

export type MediaLayer = { element: HTMLElement; image: HTMLImageElement; mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>; texture: THREE.Texture; ready: boolean; reveal: number; hover: number; source: string; depth: number; bounds: { left: number; right: number; top: number; bottom: number } };
export type MotionFrame = { scroll: number; width: number; height: number; delta: number; velocity: number; pointerX: number; pointerY: number; inside: boolean; reduced: boolean; mobile: boolean; monitor: boolean };

export class WebGLBridge {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(35, 1, .1, 6000);
  readonly layers: MediaLayer[] = [];
  readonly rule: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  readonly flow: MediaFlow;
  readonly accent = new THREE.Color(0xa43128);
  private shadows: SheetShadows;
  private geometry: THREE.PlaneGeometry;
  private disposed = false;
  private corner = new THREE.Vector3();
  private nativeProjection = new NativeProjection();
  constructor(private host: HTMLElement, elements: HTMLElement[], private wake: () => void, private fallback: () => void, private restore: () => void) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0xf2ede3, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.debug.onShaderError = () => this.fallback();
    host.appendChild(this.renderer.domElement);
    this.geometry = new THREE.PlaneGeometry(1, 1, innerWidth < 700 ? 12 : 24, 16);
    this.flow = new MediaFlow(this.geometry);
    this.flow.mesh.material.uniforms.uAccent.value = this.accent;
    this.scene.add(this.flow.mesh);
    this.shadows = new SheetShadows(elements.length + 1);
    this.scene.add(this.shadows.mesh);
    for (const preview of this.flow.previews) this.scene.add(preview);
    this.rule = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xa43128, depthTest: false, transparent: true, toneMapped: false }));
    this.rule.renderOrder = 100;
    this.scene.add(this.rule);
    for (const element of elements) {
      const image = element.querySelector<HTMLImageElement>("img")!;
      const texture = new THREE.Texture();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      const mesh = new THREE.Mesh(this.geometry, mediaMaterial(texture, element.dataset.media !== "project"));
      mesh.material.uniforms.uAccent.value = this.accent;
      mesh.visible = false; mesh.frustumCulled = false;
      this.scene.add(mesh);
      const layer: MediaLayer = { element, image, mesh, texture, ready: false, reveal: 1, hover: 0, source: "", depth: 0, bounds: { left: 0, right: 0, top: 0, bottom: 0 } };
      this.layers.push(layer);
      image.addEventListener("load", this.loaded);
      if (image.complete && image.naturalWidth) this.prepare(layer);
    }
    this.renderer.domElement.addEventListener("webglcontextlost", this.contextLost);
    this.renderer.domElement.addEventListener("webglcontextrestored", this.contextRestored);
  }
  private loaded = (event: Event) => { const layer = this.layers.find(layer => layer.image === event.target); if (layer) this.prepare(layer); };
  private prepare(layer: MediaLayer) {
    if (this.disposed) return;
    const source = layer.image.currentSrc || layer.image.src;
    if (!source) return;
    layer.source = source;
    layer.ready = false;
    delete layer.element.dataset.gl;
    void layer.image.decode().then(() => {
      if (this.disposed || layer.source !== source) return;
      layer.texture.image = layer.image;
      layer.texture.needsUpdate = true;
      this.renderer.initTexture(layer.texture);
      layer.ready = true;
      this.wake();
    }).catch(() => { if (!this.disposed) { layer.ready = false; delete layer.element.dataset.gl; this.wake(); } });
  }
  resize(width: number, height: number, quality: number) {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, quality));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.position.z = height / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov * .5)));
    this.camera.updateProjectionMatrix(); this.camera.updateMatrixWorld();
  }
  update(layer: MediaLayer, rect: CachedRect, frame: MotionFrame) {
    if (frame.reduced || frame.monitor) { layer.mesh.visible = false; delete layer.element.dataset.gl; this.nativeProjection.clear(layer.image); return false; }
    const top = rect.top - frame.scroll;
    const visible = layer.ready && rect.width > 0 && top < frame.height + 100 && top + rect.height > -100;
    layer.mesh.visible = visible;
    if (!visible) { delete layer.element.dataset.gl; this.nativeProjection.clear(layer.image); return false; }
    const portrait = layer.element.dataset.media !== "project";
    const restingPhoto = layer.element.dataset.media === "interlude";
    const localX = clamp((frame.pointerX - rect.left) / rect.width);
    const localY = clamp(1 - (frame.pointerY - top) / rect.height);
    const inside = frame.inside && frame.pointerX > rect.left && frame.pointerX < rect.left + rect.width && frame.pointerY > top && frame.pointerY < top + rect.height;
    const focused = Boolean(layer.element.closest("a")?.matches(":focus-visible"));
    const hoverTarget = frame.reduced || frame.mobile || frame.monitor || restingPhoto ? 0 : inside || focused ? 1 : 0;
    layer.hover = damp(layer.hover, hoverTarget, 11, frame.delta);
    const progress = clamp((frame.height - top) / (frame.height + rect.height));
    const depthEnvelope = smooth(.08, .3, progress) * (1 - smooth(.6, .88, progress));
    const depthTarget = frame.reduced || frame.monitor ? 0 : (depthEnvelope * (restingPhoto ? 9 : portrait ? 25 : 38) + layer.hover * (portrait ? 5 : 22)) * (frame.mobile ? .3 : 1);
    layer.depth = damp(layer.depth, depthTarget, restingPhoto ? 2.8 : 5, frame.delta);
    const entrance = clamp((frame.height - top) / Math.min(rect.height * .3, frame.height * .26));
    const revealTarget = frame.reduced || frame.monitor ? 1 : entrance;
    layer.reveal = frame.reduced || frame.monitor ? 1 : damp(layer.reveal, revealTarget, restingPhoto ? 3 : 9, frame.delta);
    const mesh = layer.mesh;
    mesh.position.set(rect.left + rect.width * .5 - frame.width * .5, frame.height * .5 - top - rect.height * .5, layer.depth);
    mesh.scale.set(rect.width, rect.height, Math.max(rect.width, rect.height));
    mesh.rotation.set(0, 0, 0);
    if (!frame.reduced && !frame.monitor) {
      mesh.rotation.y = (localX - .5) * layer.hover * .035 + depthEnvelope * (portrait ? -.025 : .055) * (frame.mobile ? .35 : 1);
      mesh.rotation.x = (localY - .5) * layer.hover * .026 + depthEnvelope * (portrait ? .012 : -.028) * (frame.mobile ? .35 : 1);
    }
    const aspect = layer.image.naturalWidth / layer.image.naturalHeight;
    const targetAspect = rect.width / rect.height;
    mesh.material.uniforms.uCover.value.set(Math.min(1, targetAspect / aspect), Math.min(1, aspect / targetAspect));
    mesh.material.uniforms.uPointer.value.set(localX, localY);
    mesh.material.uniforms.uHover.value = layer.hover;
    mesh.material.uniforms.uVelocity.value = frame.reduced || frame.monitor || restingPhoto ? 0 : frame.velocity;
    mesh.material.uniforms.uReveal.value = layer.reveal;
    mesh.material.uniforms.uParallax.value = frame.reduced ? 0 : (progress - .5) * (restingPhoto ? .012 : portrait ? .025 : .045) * (frame.mobile ? .5 : 1);
    mesh.material.uniforms.uZoom.value = frame.reduced ? 0 : depthEnvelope * (restingPhoto ? .012 : .028) + layer.hover * (portrait ? .006 : .025);
    mesh.material.uniforms.uEdgeReveal.value = portrait && !restingPhoto ? 1 : 0;
    layer.element.dataset.depth = layer.depth.toFixed(2);
    mesh.updateMatrixWorld(true);
    this.nativeProjection.update(layer.image, mesh, this.camera, rect, frame.scroll, frame.width, frame.height);
    const bounds = layer.bounds;
    bounds.left = Infinity; bounds.right = -Infinity; bounds.top = Infinity; bounds.bottom = -Infinity;
    for (let index = 0; index < 4; index++) {
      this.corner.set(index % 2 ? .5 : -.5, index > 1 ? .5 : -.5, 0).applyMatrix4(mesh.matrixWorld).project(this.camera);
      const horizontal = (this.corner.x + 1) * frame.width * .5;
      const vertical = (1 - this.corner.y) * frame.height * .5;
      bounds.left = Math.min(bounds.left, horizontal); bounds.right = Math.max(bounds.right, horizontal);
      bounds.top = Math.min(bounds.top, vertical); bounds.bottom = Math.max(bounds.bottom, vertical);
    }
    if (layer.depth < .04 && layer.hover < .001 && layer.reveal > .999 && frame.velocity < .001) { mesh.visible = false; delete layer.element.dataset.gl; }
    return Math.abs(layer.hover - hoverTarget) > .001 || Math.abs(layer.depth - depthTarget) > .03 || Math.abs(layer.reveal - revealTarget) > .003;
  }
  render() {
    this.shadows.begin();
    for (const layer of this.layers) this.shadows.add(layer.mesh, this.camera.position.z);
    this.shadows.add(this.flow.mesh, this.camera.position.z);
    this.shadows.commit();
    try { this.renderer.render(this.scene, this.camera); }
    catch { this.fallback(); return; }
    for (const layer of this.layers) if (layer.mesh.visible) layer.element.dataset.gl = "true";
    this.flow.commit();
    this.host.dataset.drawCalls = String(this.renderer.info.render.calls);
    this.host.dataset.triangles = String(this.renderer.info.render.triangles);
    this.host.dataset.textures = String(this.renderer.info.memory.textures);
  }
  restoreNative() {
    this.flow.reset();
    for (const layer of this.layers) {
      this.nativeProjection.clear(layer.image);
      delete layer.element.dataset.gl;
      delete layer.element.dataset.depth;
      layer.mesh.visible = false;
    }
    this.renderer.domElement.style.visibility = "hidden";
  }
  private contextLost = (event: Event) => { event.preventDefault(); this.flow.reset(); this.layers.forEach(layer => { delete layer.element.dataset.gl; this.nativeProjection.clear(layer.image); }); this.fallback(); };
  private contextRestored = () => { this.layers.forEach(layer => this.prepare(layer)); this.restore(); this.wake(); };
  dispose() {
    this.disposed = true;
    this.renderer.domElement.removeEventListener("webglcontextlost", this.contextLost);
    this.renderer.domElement.removeEventListener("webglcontextrestored", this.contextRestored);
    for (const layer of this.layers) { layer.image.removeEventListener("load", this.loaded); this.nativeProjection.clear(layer.image); delete layer.element.dataset.gl; delete layer.element.dataset.depth; layer.texture.dispose(); layer.mesh.material.dispose(); }
    this.shadows.dispose(); this.flow.dispose(); this.rule.geometry.dispose(); this.rule.material.dispose(); this.geometry.dispose();
    this.renderer.dispose(); this.renderer.domElement.remove();
  }
}
