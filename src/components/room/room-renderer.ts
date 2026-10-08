import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { paperTexture, monitorTexture, keyboardTexture } from "./room-art";
import { ease, positionAllowed, viewpointDiscovery, viewpointOrder, type Discovery, type Viewpoint } from "./room-content";
import { surfaceAtlas, fixtureTexture, windowTexture, finishTexture } from "./room-surfaces";

const assetIds = ["room-shell", "metal_office_desk", "painted_wooden_chair_02", "desk_lamp_arm_01", "binder_notebook", "wooden_bookshelf_worn", "book_encyclopedia_set_01", "flathead_screwdriver"];
const roomTextures = new Map<string, THREE.Texture>();
let preload: Promise<Map<string, THREE.Group>> | undefined;
export function preloadRoomAssets() {
  if (!preload) {
    const loader = new GLTFLoader();
    const models = Promise.all(assetIds.map(async identifier => {
      const asset = await loader.loadAsync(`/room/models/${identifier}.glb`);
      asset.scene.traverse(item => {
        if (!(item instanceof THREE.Mesh)) return;
        for (const material of Array.isArray(item.material) ? item.material : [item.material]) if (material instanceof THREE.MeshStandardMaterial) {
          for (const texture of [material.map, material.normalMap, material.roughnessMap, material.metalnessMap]) if (texture) texture.anisotropy = 4;
        }
      });
      return [identifier, asset.scene] as const;
    }));
    const textureLoader = new THREE.TextureLoader();
    const textures = Promise.all(["white_plaster_02", "linoleum_brown"].flatMap(identifier => ["color", "normal"].map(async map => {
      const texture = await textureLoader.loadAsync(`/room/textures/${identifier}-${map}.webp`);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 4;
      texture.repeat.set(identifier === "linoleum_brown" ? 6 : 3, identifier === "linoleum_brown" ? 5 : 2);
      if (map === "color") texture.colorSpace = THREE.SRGBColorSpace;
      roomTextures.set(`${identifier}-${map}`, texture);
    })));
    const handwriting = new FontFace("Room Hand", "url(/room/fonts/caveat.ttf)", { weight: "500" }).load().then(font => { document.fonts.add(font); });
    const exterior = textureLoader.loadAsync("/room/textures/window-exterior.webp").then(texture => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; roomTextures.set("exterior", texture); });
    preload = Promise.all([models, textures, handwriting, exterior]).then(([entries]) => new Map(entries)).catch(error => { preload = undefined; throw error; });
  }
  return preload;
}

type CameraPose = { position: THREE.Vector3; rotation: THREE.Quaternion; fov: number };
type CameraMove = { from: CameraPose; to: CameraPose; via?: THREE.Vector3; elapsed: number; duration: number; complete?: () => void };
export type RoomStatus = { phase: "wake" | "ready" | "explore" | "inspect" | "handoff"; target: Discovery | null; inspection: Discovery | null; locked: boolean; recovered: boolean; recovering?: boolean; viewpoint: Viewpoint };
type Callbacks = { status: (status: RoomStatus) => void; complete: () => void; failed: () => void; revealWebsite: () => HTMLElement | null; sound: (kind: "lamp" | "paper" | "drive" | "step" | "power" | "drawer" | "keyboard") => void; audioFrame: (position: readonly [number, number, number], forward: readonly [number, number, number], up: readonly [number, number, number], wake: number, handoff: number) => void };

export class RoomRenderer {
  private gl: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(52, 1, 0.025, 35);
  private ray = new THREE.Raycaster();
  private keys = new Set<string>();
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private lookEuler = new THREE.Euler(0, 0, 0, "YXZ");
  private lookYaw = 0;
  private lookPitch = 0;
  private rayObjects: THREE.Mesh[] = [];
  private rayHits: THREE.Intersection[] = [];
  private rayCenter = new THREE.Vector2();
  private targetTime = -1;
  private targetPosition = new THREE.Vector3(Infinity, Infinity, Infinity);
  private targetRotation = new THREE.Quaternion();
  private reportTime = -1;
  private frame = 0;
  private previous = 0;
  private clock = 0;
  private wakeTime = 0;
  private disposed = false;
  private initialized = false;
  private cameraMove?: CameraMove;
  private returnPose?: CameraPose;
  private status: RoomStatus = { phase: "wake", target: null, inspection: null, locked: false, recovered: false, viewpoint: "desk" };
  private yaw = 0;
  private pitch = 0;
  private lamp = new THREE.PointLight(0xffcca0, 0, 2.8, 2);
  private ceiling = new THREE.RectAreaLight(0xe2eaf2, 65, 1.37, 0.255);
  private monitorLight = new THREE.PointLight(0xcbdacf, 0.2, 2.6, 2);
  private tubeMaterials: THREE.MeshStandardMaterial[] = [];
  private monitor?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private drawer?: THREE.Group;
  private fan?: THREE.Mesh;
  private dust?: THREE.Points;
  private rain?: THREE.Texture;
  private css?: CSS3DRenderer;
  private cssScene?: THREE.Scene;
  private monitorSurface?: CSS3DObject;
  private website?: HTMLElement;
  private websiteParent?: HTMLElement;
  private handoffTime = 0;
  private handoffStarted = false;
  private handoffDepth = 0;
  private lampPowered = false;
  private stepDistance = 0;
  private audioForward = new THREE.Vector3();
  private audioUp = new THREE.Vector3();
  private audioTime = 0;
  private recoveryTime = 0;
  private notebookPage = 0;
  private notebook?: THREE.Group;
  private notebookLift = 0;
  private visits = new Set<Discovery>();
  private ownedGeometries = new Set<THREE.BufferGeometry>();
  private ownedMaterials = new Set<THREE.Material>();
  private ownedTextures = new Set<THREE.Texture>();
  private timings: number[] = [];
  private drawTimes: number[] = [];
  private drag?: { horizontal: number; vertical: number; origin: number };
  private dragDistance = 0;
  private suppressClick = false;
  private restoreMouseLook = false;
  private lastInteraction = 0;
  private touchRoam = false;

  constructor(private canvas: HTMLCanvasElement, private host: HTMLElement, private guided: boolean, private reduced: boolean, private callbacks: Callbacks) {
    RectAreaLightUniformsLib.init();
    this.gl = new THREE.WebGLRenderer({ canvas, antialias: !guided, alpha: false, powerPreference: guided ? "low-power" : "high-performance" });
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.05;
    this.gl.shadowMap.enabled = !guided;
    this.gl.shadowMap.type = THREE.PCFShadowMap;
    this.scene.background = new THREE.Color(0x69776c);
    this.scene.fog = new THREE.Fog(0x7c8479, 11, 25);
    this.camera.position.set(0, 0.16, 0.7);
    this.camera.lookAt(0, 3.04, 0.7);
    canvas.addEventListener("webglcontextlost", this.contextLost);
    canvas.addEventListener("click", this.click);
    canvas.addEventListener("pointerdown", this.pointerDown);
    addEventListener("pointerup", this.pointerUp);
    addEventListener("pointermove", this.pointerMove);
    addEventListener("keydown", this.keyDown);
    addEventListener("keyup", this.keyUp);
    addEventListener("blur", this.blur);
    addEventListener("resize", this.resize);
    document.addEventListener("visibilitychange", this.visibility);
    document.addEventListener("pointerlockchange", this.pointerLock);
    document.addEventListener("pointerlockerror", this.pointerError);
    this.resize();
  }

  async initialize() {
    const assets = await preloadRoomAssets();
    if (this.disposed) return;
    const shell = assets.get("room-shell")!.clone(true);
    const paintFinish = finishTexture("paint"); this.ownedTextures.add(paintFinish);
    shell.traverse(item => {
      if (!(item instanceof THREE.Mesh)) return;
      if (["room_city_plaster", "room_city_wall", "room_city_roof", "room_city_glass"].includes(item.name)) item.userData.discovery = "shelf";
      if (item.name === "room_paint") {
        const material = (item.material as THREE.MeshStandardMaterial).clone(); this.ownedMaterials.add(material);
        material.roughnessMap = paintFinish; material.normalMap = roomTextures.get("white_plaster_02-normal")!; material.normalScale.setScalar(0.06); item.material = material;
      }
      const identifier = item.name === "room_plaster" ? "white_plaster_02" : item.name === "room_floor" ? "linoleum_brown" : null;
      if (!identifier) return;
      const material = (item.material as THREE.MeshStandardMaterial).clone(); this.ownedMaterials.add(material);
      material.map = roomTextures.get(`${identifier}-color`)!; material.normalMap = roomTextures.get(`${identifier}-normal`)!;
      material.normalScale.setScalar(identifier === "white_plaster_02" ? 0.16 : 0.28);
      if (identifier === "white_plaster_02") material.roughnessMap = paintFinish;
      material.color.set(identifier === "white_plaster_02" ? 0xeee9df : 0xb7c1b8);
      if (identifier === "linoleum_brown") this.surfaceResponse(material, "floor");
      item.material = material;
    });
    this.scene.add(shell);
    this.addLighting();
    this.addFurniture(assets);
    this.addDetails();
    this.addSurfaceHistory();
    this.gl.shadowMap.autoUpdate = false;
    this.gl.shadowMap.needsUpdate = true;
    await this.gl.compileAsync(this.scene, this.camera);
    if (this.disposed) return;
    const culling: [THREE.Mesh, boolean][] = [];
    this.scene.traverse(object => { if (object instanceof THREE.Mesh) { culling.push([object, object.frustumCulled]); object.frustumCulled = false; } });
    this.gl.render(this.scene, this.camera);
    culling.forEach(([object, enabled]) => { object.frustumCulled = enabled; });
    this.initialized = true;
    this.host.dataset.ready = "true";
    this.emit();
    this.wake();
  }

  private material(color: THREE.ColorRepresentation, roughness = 0.8, metalness = 0) {
    const material = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    this.ownedMaterials.add(material); return material;
  }

  private surfaceResponse(material: THREE.MeshStandardMaterial, surface: "desk" | "floor") {
    material.customProgramCacheKey = () => `room-finish-${surface}`;
    material.onBeforeCompile = shader => {
      shader.vertexShader = `varying vec3 vRoomSurface;\n${shader.vertexShader}`.replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvRoomSurface = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      const response = surface === "desk" ? `
        float topSurface = 1.0 - smoothstep(0.002, 0.03, abs(vRoomSurface.y - 0.77));
        vec2 deskOffset = (vRoomSurface.xz - vec2(-0.53, -1.66)) / vec2(0.37, 0.30);
        float polish = exp(-dot(deskOffset, deskOffset) * 1.7) * topSurface;
        float forearm = exp(-pow((vRoomSurface.z + 1.48) / 0.035, 2.0)) * (1.0 - smoothstep(0.35, 0.80, abs(vRoomSurface.x + 0.80))) * topSurface;
        roughnessFactor = mix(roughnessFactor, 0.38, polish * 0.45 + forearm * 0.2);
      ` : `
        vec2 chairPath = (vRoomSurface.xz - vec2(-0.4, -0.45)) / vec2(0.65, 1.15);
        float usePath = exp(-dot(chairPath, chairPath) * 1.5);
        roughnessFactor = mix(roughnessFactor, 0.62, usePath * 0.25);
      `;
      shader.fragmentShader = `varying vec3 vRoomSurface;\n${shader.fragmentShader}`.replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\n${response}`);
    };
  }

  private box(size: [number, number, number], position: [number, number, number], material: THREE.Material, parent: THREE.Object3D = this.scene, bevel = 0) {
    const geometry = bevel ? new RoundedBoxGeometry(...size, 1, bevel) : new THREE.BoxGeometry(...size); this.ownedGeometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); parent.add(mesh); return mesh;
  }

  private plane(width: number, height: number, position: [number, number, number], texture: THREE.Texture, parent: THREE.Object3D = this.scene) {
    this.ownedTextures.add(texture);
    const geometry = new THREE.PlaneGeometry(width, height); this.ownedGeometries.add(geometry);
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, side: THREE.DoubleSide }); this.ownedMaterials.add(material);
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); parent.add(mesh); return mesh;
  }

  private addModel(assets: Map<string, THREE.Group>, identifier: string, width: number, position: [number, number, number], rotation = 0, interactive?: Discovery) {
    const model = assets.get(identifier)!.clone(true);
    const bounds = new THREE.Box3().setFromObject(model); const size = bounds.getSize(new THREE.Vector3());
    model.scale.setScalar(width / size.x); model.position.set(...position); model.rotation.y = rotation;
    model.traverse(item => { if (item instanceof THREE.Mesh) { item.castShadow = !this.guided && identifier !== "wooden_bookshelf_worn"; item.receiveShadow = true; } });
    if (["metal_office_desk", "wooden_bookshelf_worn"].includes(identifier)) model.traverse(item => {
      if (!(item instanceof THREE.Mesh) || !(item.material instanceof THREE.MeshStandardMaterial)) return;
      const material = item.material.clone(); material.roughness = identifier === "metal_office_desk" ? 0.62 : 0.88; if (identifier === "wooden_bookshelf_worn") material.normalScale.setScalar(0.45); this.ownedMaterials.add(material); item.material = material;
      if (identifier === "metal_office_desk") this.surfaceResponse(material, "desk");
    });
    if (interactive) model.userData.discovery = interactive;
    this.scene.add(model); return model;
  }

  private addLighting() {
    this.scene.add(new THREE.HemisphereLight(0xdce5ed, 0x625b50, 0.48));
    const daylight = new THREE.DirectionalLight(0xd4e1ef, 2); daylight.position.set(-5, 4.5, 1.2); daylight.target.position.set(0, 0, -1);
    daylight.castShadow = !this.guided; daylight.shadow.mapSize.set(1024, 1024);
    daylight.shadow.camera.left = -4; daylight.shadow.camera.right = 4; daylight.shadow.camera.top = 4; daylight.shadow.camera.bottom = -4;
    daylight.shadow.normalBias = 0.035; daylight.shadow.bias = -0.00015;
    daylight.shadow.radius = 4;
    this.scene.add(daylight, daylight.target);
    if (!this.guided) {
      const windowFill = new THREE.RectAreaLight(0xc6d8e4, 4, 2.75, 1.59); windowFill.position.set(-3.13, 1.89, -0.05); windowFill.lookAt(0, 1.05, -1.1); this.scene.add(windowFill);
    }
    this.ceiling.position.set(0, 2.985, 0.7); this.ceiling.lookAt(0, 0, 0.7); this.scene.add(this.ceiling);
    this.lamp.position.set(-1.43, 1.23, -2.01); this.scene.add(this.lamp);
    this.monitorLight.position.set(-0.52, 1.22, -1.86); this.scene.add(this.monitorLight);
    const diffuser = this.scene.getObjectByName("room_diffuser");
    if (diffuser instanceof THREE.Mesh && diffuser.material instanceof THREE.MeshStandardMaterial) {
      const material = diffuser.material.clone(); material.emissive.set(0xe7edf3); material.emissiveIntensity = 2.4; material.roughness = 0.38; this.ownedMaterials.add(material); diffuser.material = material; this.tubeMaterials.push(material);
      const texture = fixtureTexture(); this.ownedTextures.add(texture); material.map = texture; material.emissiveMap = texture;
    }
    const landscape = roomTextures.get("exterior")!;
    landscape.mapping = THREE.EquirectangularReflectionMapping; this.scene.background = landscape; this.scene.backgroundRotation.y = Math.PI; this.scene.backgroundIntensity = 0.85;
    const rain = windowTexture(); rain.wrapT = THREE.RepeatWrapping; this.rain = rain; this.ownedTextures.add(rain);
    const glass = new THREE.MeshStandardMaterial({ map: rain, color: 0xc6d0cb, transparent: true, opacity: 0.20, roughness: 0.48 }); this.ownedMaterials.add(glass);
    this.box([0.014, 1.59, 2.86], [-3.20, 1.89, -0.05], glass);
    const exteriorLedge = this.material(0x899595, 0.97);
    this.box([0.53, 0.075, 3.08], [-3.42, 1.045, -0.05], exteriorLedge, this.scene, 0.008);
    this.box([0.045, 0.08, 3.10], [-3.67, 1.10, -0.05], this.material(0x4a5859, 0.73, 0.25), this.scene, 0.004);
    const weathered = this.material(0x536160, 0.92, 0.08);
    this.box([0.035, 0.035, 2.52], [-4.08, 1.33, -0.05], weathered, this.scene, 0.004);
    for (const depth of [-1.25, -.43, .49, 1.20]) this.box([0.035, 0.46, 0.035], [-4.08, 1.13, depth], weathered, this.scene, 0.003);
    for (const depth of [0.63, 0.79]) {
      const material = new THREE.MeshStandardMaterial({ color: 0xeeefdc, emissive: 0xe0eddf, emissiveIntensity: 3.3, roughness: 0.35 }); this.ownedMaterials.add(material); this.tubeMaterials.push(material);
      const geometry = new THREE.CylinderGeometry(0.022, 0.022, 1.31, 16); this.ownedGeometries.add(geometry);
      const tube = new THREE.Mesh(geometry, material); tube.position.set(0, 3.015, depth); tube.rotation.z = Math.PI / 2; this.scene.add(tube);
    }
    this.scene.traverse(item => { if (item instanceof THREE.Mesh && item.name.startsWith("room_")) { item.receiveShadow = true; item.castShadow = !this.guided && ["room_plaster", "room_cream"].includes(item.name); } });
  }

  private addFurniture(assets: Map<string, THREE.Group>) {
    this.addModel(assets, "metal_office_desk", 1.955, [-0.67, 0, -1.93]);
    this.addModel(assets, "painted_wooden_chair_02", 0.48, [-0.4, 0, -0.88], Math.PI + 0.13);
    this.addModel(assets, "painted_wooden_chair_02", 0.48, [1.03, 0, -0.90], -0.71, "diagram");
    this.addModel(assets, "wooden_bookshelf_worn", 1.50, [2.68, 0, -1.41], -Math.PI / 2, "shelf");
    this.addModel(assets, "desk_lamp_arm_01", 0.12, [-1.40, 0.77, -2.05], -0.5);
    this.addModel(assets, "binder_notebook", 0.24, [-1.26, 0.771, -1.86], 0.09, "notebook");
    this.addModel(assets, "book_encyclopedia_set_01", 0.34, [2.64, 0.415, -1.58], -Math.PI / 2, "shelf");
    this.addModel(assets, "book_encyclopedia_set_01", 0.26, [2.62, 0.415, -0.98], -Math.PI / 2 + 0.06, "shelf");
    const screwdriver = this.addModel(assets, "flathead_screwdriver", 0.024, [-0.1, 0.771, -1.63], 0.34);
    screwdriver.rotation.x = -Math.PI / 2;
    screwdriver.position.y += 0.771 - new THREE.Box3().setFromObject(screwdriver).min.y;
    const rubber = this.material(0x242c29, 0.63); const steel = this.material(0x59635e, 0.42, 0.45); const paper = this.material(0xddd5bc);
    const plasticFinish = finishTexture("plastic"); this.ownedTextures.add(plasticFinish); rubber.roughnessMap = plasticFinish; rubber.bumpMap = plasticFinish; rubber.bumpScale = 0.0003;
    this.box([0.72, 0.47, 0.045], [-0.50, 1.20, -2.1], rubber, this.scene, 0.008).userData.discovery = "computer";
    this.box([0.052, 0.21, 0.04], [-0.50, 0.89, -2.12], steel);
    this.box([0.26, 0.018, 0.16], [-0.50, 0.780, -2.06], rubber);
    const texture = monitorTexture(false); this.ownedTextures.add(texture);
    const geometry = new THREE.PlaneGeometry(0.64, 0.4); this.ownedGeometries.add(geometry);
    const monitorMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }); this.ownedMaterials.add(monitorMaterial);
    this.monitor = new THREE.Mesh(geometry, monitorMaterial); this.monitor.position.set(-0.50, 1.20, -2.071); this.monitor.userData.discovery = "computer"; this.scene.add(this.monitor);
    this.box([0.41, 0.021, 0.19], [-0.53, 0.79, -1.68], rubber, this.scene, 0.004);
    const footGeometries: THREE.BufferGeometry[] = [];
    for (const horizontal of [-0.67, -0.39]) for (const depth of [-1.74, -1.62]) { const geometry = new THREE.BoxGeometry(0.02, 0.01, 0.02); geometry.translate(horizontal, 0.775, depth); footGeometries.push(geometry); }
    const feet = mergeGeometries(footGeometries); footGeometries.forEach(geometry => geometry.dispose()); this.ownedGeometries.add(feet); this.scene.add(new THREE.Mesh(feet, rubber));
    const keyGeometries: THREE.BufferGeometry[] = [];
    for (let row = 0; row < 4; row++) for (let column = 0; column < 13; column++) {
      const key = new THREE.BoxGeometry(0.023, 0.007, 0.024); const uv = key.attributes.uv;
      for (let vertex = 0; vertex < uv.count; vertex++) uv.setXY(vertex, (column + uv.getX(vertex)) / 13, 1 - (row + 1 - uv.getY(vertex)) / 5);
      key.translate(-0.712 + column * 0.029, 0.805, -1.747 + row * 0.032); keyGeometries.push(key);
    }
    const space = new THREE.BoxGeometry(0.17, 0.007, 0.024);
    for (let vertex = 0; vertex < space.attributes.uv.count; vertex++) space.attributes.uv.setXY(vertex, 0.1 + space.attributes.uv.getX(vertex) * 0.1, space.attributes.uv.getY(vertex) * 0.1);
    space.translate(-0.54, 0.805, -1.61); keyGeometries.push(space);
    const keys = mergeGeometries(keyGeometries); keyGeometries.forEach(geometry => geometry.dispose());
    const keyboardMap = keyboardTexture(); this.ownedTextures.add(keyboardMap);
    const keyboardMaterial = new THREE.MeshStandardMaterial({ map: keyboardMap, roughness: 0.75 }); this.ownedMaterials.add(keyboardMaterial);
    this.ownedGeometries.add(keys); this.scene.add(new THREE.Mesh(keys, keyboardMaterial));
    this.box([0.16, 0.043, 0.24], [0.22, 0.8, -2.14], steel, this.scene, 0.006).userData.discovery = "computer";
    this.box([0.19, 0.011, 0.27], [0.22, 0.7755, -2.14], paper);
    this.box([0.115, 0.003, 0.15], [0.22, 0.824, -2.12], this.material(0x526954));
    this.box([0.027, 0.004, 0.024], [0.204, 0.828, -2.109], rubber);
    this.box([0.014, 0.004, 0.03], [0.247, 0.828, -2.163], rubber);
    this.box([0.034, 0.012, 0.027], [0.22, 0.831, -2.024], steel);
    const traces = this.material(0x969260, 0.72, 0.15);
    for (let trace = 0; trace < 3; trace++) this.box([0.06, 0.0007, 0.0008], [0.222, 0.826, -2.148 + trace * 0.009], traces);
    const notebook = new THREE.Group(); notebook.position.set(-1.03, 0.778, -1.65); notebook.rotation.y = -0.14; notebook.userData.discovery = "notebook"; this.scene.add(notebook);
    this.notebook = notebook;
    this.box([0.52, 0.016, 0.35], [0, 0, 0], this.material(0x5b655b), notebook, 0.006);
    this.box([0.50, 0.02, 0.33], [0, 0.014, 0], paper, notebook);
    const pages = this.plane(0.5, 0.33, [0, 0.025, 0], paperTexture("notebook"), notebook); pages.rotation.x = -Math.PI / 2;
    const paperFinish = finishTexture("paper"); this.ownedTextures.add(paperFinish); pages.material.roughnessMap = paperFinish; pages.material.bumpMap = paperFinish; pages.material.bumpScale = 0.00008; pages.material.roughness = 0.94;
    const curved = new THREE.PlaneGeometry(0.5, 0.33, 40, 12); this.ownedGeometries.add(curved); pages.geometry = curved;
    const vertices = curved.attributes.position;
    for (let vertex = 0; vertex < vertices.count; vertex++) { const horizontal = vertices.getX(vertex); const vertical = vertices.getY(vertex); vertices.setZ(vertex, Math.sin(Math.abs(horizontal) / 0.25 * Math.PI) * 0.004 + (horizontal > 0.19 && vertical < -0.12 ? (horizontal - 0.19) * 0.14 : 0)); }
    curved.computeVertexNormals();
    const pageLayers: THREE.BufferGeometry[] = [];
    for (let layer = 0; layer < 9; layer++) { const geometry = new THREE.BoxGeometry(0.496 - layer % 3 * 0.001, 0.00065, 0.327); geometry.translate(layer % 2 * 0.001, 0.005 + layer * 0.00165, 0.001 * Math.sin(layer)); pageLayers.push(geometry); }
    const pageGeometry = mergeGeometries(pageLayers); pageLayers.forEach(geometry => geometry.dispose()); this.ownedGeometries.add(pageGeometry); notebook.add(new THREE.Mesh(pageGeometry, this.material(0xbeb8a3)));
    const diagram = this.plane(0.78, 0.585, [0.86, 1.64, -2.727], paperTexture("diagram")); diagram.rotation.z = -0.035; diagram.userData.discovery = "diagram";
    const tape = this.material(0xbfb28e);
    for (const [horizontal, vertical, angle] of [[0.51, 1.939, -0.10], [1.20, 1.915, 0.15]]) { const strip = this.box([0.08, 0.033, 0.001], [horizontal, vertical, -2.724], tape); strip.rotation.z = angle; }
    const sequence = this.plane(0.36, 0.16, [2.52, 0.87, -1.17], paperTexture("frames")); sequence.rotation.y = -Math.PI / 2; sequence.userData.discovery = "shelf";
    const label = this.plane(0.17, 0.11, [2.39, 1.09, -1.02], paperTexture("label")); label.rotation.y = -Math.PI / 2; label.userData.discovery = "shelf";
    this.drawer = new THREE.Group(); this.drawer.position.set(2.72, 0.78, 1.325); this.drawer.userData.discovery = "drawer"; this.scene.add(this.drawer);
    this.box([0.65, 0.27, 0.025], [0, 0, -0.285], steel, this.drawer);
    this.box([0.17, 0.018, 0.04], [0, 0.06, -0.322], rubber, this.drawer);
    this.plane(0.10, 0.072, [0.16, 0.01, -0.301], paperTexture("drawer"), this.drawer).rotation.y = Math.PI;
    this.box([0.55, 0.035, 0.53], [0, -0.075, 0], this.material(0x747d72), this.drawer);
    const cableMaterial = this.material(0x252c29);
    const placements = [[-0.14, -0.12, 0.17], [0.055, -0.11, 0.9], [0.11, 0.055, -0.25], [-0.09, 0.09, 0.43], [-0.1, -0.015, -0.1], [0.03, 0.025, 2.15]];
    for (let cable = 0; cable < 6; cable++) {
      const radius = 0.037 + cable % 2 * 0.015; const points: THREE.Vector3[] = [];
      for (let segment = 0; segment <= 48; segment++) { const angle = segment / 48 * Math.PI * 4; points.push(new THREE.Vector3(Math.cos(angle) * radius, segment / 48 * 0.005, Math.sin(angle) * radius)); }
      points.push(new THREE.Vector3(radius + 0.02, 0.005, 0.015)); points.push(new THREE.Vector3(radius + 0.045, 0.005, 0.015));
      const geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 90, 0.0025, 4, false); this.ownedGeometries.add(geometry);
      const bundle = new THREE.Group(); bundle.position.set(placements[cable][0], -0.05 + cable % 3 * 0.008, placements[cable][1]); bundle.rotation.y = placements[cable][2]; this.drawer.add(bundle);
      bundle.add(new THREE.Mesh(geometry, cableMaterial));
      this.box([0.018, 0.009, cable % 2 ? 0.018 : 0.029], [radius + 0.045, 0.005, 0.015], cableMaterial, bundle);
    }
    const fanGeometry = new THREE.BoxGeometry(0.058, 0.008, 0.014); this.ownedGeometries.add(fanGeometry);
    this.fan = new THREE.Mesh(fanGeometry, rubber); this.fan.position.set(0.225, 0.827, -2.14); this.scene.add(this.fan);
  }

  private addDetails() {
    const steel = this.material(0x777d73, 0.38, 0.3); const dark = this.material(0x2f3530); const mugMaterial = this.material(0xaaa89b, 0.65);
    const mugGeometry = new THREE.CylinderGeometry(0.046, 0.039, 0.085, 24, 1, true); this.ownedGeometries.add(mugGeometry);
    mugMaterial.side = THREE.DoubleSide;
    const mug = new THREE.Mesh(mugGeometry, mugMaterial); mug.position.set(-1.56, 0.8125, -1.67); this.scene.add(mug);
    const handleGeometry = new THREE.TorusGeometry(0.025, 0.006, 8, 18); this.ownedGeometries.add(handleGeometry);
    const handle = new THREE.Mesh(handleGeometry, mugMaterial); handle.position.set(-1.503, 0.815, -1.67); this.scene.add(handle);
    const residueGeometry = new THREE.CircleGeometry(0.036, 24); this.ownedGeometries.add(residueGeometry);
    const residue = new THREE.Mesh(residueGeometry, this.material(0x55483b)); residue.position.set(-1.56, 0.772, -1.67); residue.rotation.x = -Math.PI / 2; this.scene.add(residue);
    const ringGeometry = new THREE.RingGeometry(0.053, 0.056, 32); this.ownedGeometries.add(ringGeometry);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x765e41, transparent: true, opacity: 0.32, side: THREE.DoubleSide }); this.ownedMaterials.add(ringMaterial);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial); ring.position.set(-1.52, 0.7706, -1.58); ring.rotation.x = -Math.PI / 2; this.scene.add(ring);
    const penGeometry = new THREE.CylinderGeometry(0.0035, 0.0035, 0.14, 8); this.ownedGeometries.add(penGeometry);
    const pen = new THREE.Mesh(penGeometry, dark); pen.position.set(-0.94, 0.807, -1.61); pen.rotation.set(0.02, 0.29, Math.PI / 2); this.scene.add(pen);
    pen.userData.discovery = "notebook";
    const tipGeometry = new THREE.ConeGeometry(0.0024, 0.012, 8); tipGeometry.translate(0, -0.076, 0); tipGeometry.rotateZ(Math.PI); this.ownedGeometries.add(tipGeometry);
    pen.add(new THREE.Mesh(tipGeometry, steel));
    this.notebook?.attach(pen);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.19, 0.79, -2.13), new THREE.Vector3(0.50, 0.68, -2.28), new THREE.Vector3(0.53, 0.05, -1.99), new THREE.Vector3(0.70, 0.018, -1.58), new THREE.Vector3(0.98, 0.012, -1.32), new THREE.Vector3(1.03, 0.015, -0.92)]);
    const cableGeometry = new THREE.TubeGeometry(curve, 40, 0.005, 5, false); this.ownedGeometries.add(cableGeometry); this.scene.add(new THREE.Mesh(cableGeometry, dark));
    this.box([0.034, 0.019, 0.07], [0.67, 0.026, -1.53], steel);
    const strip = this.box([0.28, 0.025, 0.052], [0.65, 0.04, -2.66], this.material(0xbebba6)); strip.rotation.y = 0.05;
    for (let socket = 0; socket < 3; socket++) this.box([0.034, 0.004, 0.031], [0.57 + socket * 0.08, 0.055, -2.66], dark);
    const positions = new Float32Array(36 * 3);
    for (let particle = 0; particle < 36; particle++) { positions[particle * 3] = Math.sin(particle * 17.31) * 1.5; positions[particle * 3 + 1] = 0.5 + (particle % 15) * 0.16; positions[particle * 3 + 2] = Math.cos(particle * 11.71); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3)); this.ownedGeometries.add(geometry);
    const material = new THREE.PointsMaterial({ size: 0.007, color: 0xd6d6bc, transparent: true, opacity: 0.18, depthWrite: false }); this.ownedMaterials.add(material);
    this.dust = new THREE.Points(geometry, material); this.scene.add(this.dust);
    const floorShadow = document.createElement("canvas"); floorShadow.width = 128; floorShadow.height = 128;
    const context = floorShadow.getContext("2d")!; const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 63); gradient.addColorStop(0, "rgba(16,22,18,.34)"); gradient.addColorStop(1, "rgba(16,22,18,0)"); context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(floorShadow); this.ownedTextures.add(texture);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }); this.ownedMaterials.add(shadowMaterial);
    const contacts: THREE.BufferGeometry[] = [];
    for (const [horizontal, depth, width, length] of [[-0.67, -1.93, 2.6, 1.5], [-0.4, -0.88, 0.85, 0.9], [1.03, -0.9, 0.8, 0.85], [2.7, -1.4, 0.8, 1.4]]) {
      const geometry = new THREE.PlaneGeometry(width, length); geometry.rotateX(-Math.PI / 2); geometry.translate(horizontal, 0.004, depth); contacts.push(geometry);
    }
    const contactGeometry = mergeGeometries(contacts); contacts.forEach(geometry => geometry.dispose()); this.ownedGeometries.add(contactGeometry); this.scene.add(new THREE.Mesh(contactGeometry, shadowMaterial));
  }

  private addSurfaceHistory() {
    const atlas = surfaceAtlas(); this.ownedTextures.add(atlas);
    const patches: THREE.BufferGeometry[] = [];
    const patch = (region: number, width: number, height: number, position: [number, number, number], rotation: [number, number, number] = [-Math.PI / 2, 0, 0]) => {
      const geometry = new THREE.PlaneGeometry(width, height); const coordinates = geometry.attributes.uv;
      for (let vertex = 0; vertex < coordinates.count; vertex++) coordinates.setXY(vertex, (region % 2 + coordinates.getX(vertex)) / 2, 1 - (Math.floor(region / 2) + 1 - coordinates.getY(vertex)) / 2);
      geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(1, 1, 1))); patches.push(geometry);
    };
    patch(0, 0.59, 0.40, [-1.03, 0.7705, -1.65]);
    patch(0, 0.48, 0.23, [-0.53, 0.7705, -1.68]);
    patch(0, 0.34, 0.24, [-0.5, 0.7705, -2.06]);
    patch(1, 0.62, 0.25, [-0.52, 0.771, -1.47]);
    patch(1, 0.35, 0.23, [0.21, 0.771, -1.86]);
    patch(2, 1.1, 1.6, [-0.35, 0.006, -0.25]);
    patch(0, 0.58, 0.37, [2.67, 1.373, -1.3]);
    patch(1, 0.54, 0.3, [2.65, 1.373, -0.93]);
    patch(3, 0.028, 0.11, [-0.845, 1.23, -2.076], [0, 0, 0]);
    const combined = mergeGeometries(patches); patches.forEach(geometry => geometry.dispose()); this.ownedGeometries.add(combined);
    const material = new THREE.MeshBasicMaterial({ map: atlas, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }); this.ownedMaterials.add(material);
    this.scene.add(new THREE.Mesh(combined, material));
    const metal = this.material(0x65716d, 0.46, 0.4); const rubber = this.material(0x252c28);
    const scraps: THREE.BufferGeometry[] = [];
    for (const [index, placement] of [[0.34, 1.72, 0.12], [1.43, 1.83, -0.11], [1.37, 1.30, 0.07]].entries()) {
      const geometry = new THREE.BoxGeometry(0.16, 0.21, 0.001); const coordinates = geometry.attributes.uv;
      for (let vertex = 0; vertex < coordinates.count; vertex++) coordinates.setXY(vertex, (index % 2 + coordinates.getX(vertex)) / 2, 1 - (Math.floor(index / 2) + 1 - coordinates.getY(vertex)) / 2);
      geometry.rotateZ(placement[2]); geometry.translate(placement[0], placement[1], -2.728); scraps.push(geometry);
    }
    const scrapGeometry = mergeGeometries(scraps); scraps.forEach(geometry => geometry.dispose()); this.ownedGeometries.add(scrapGeometry);
    const scrapMap = paperTexture("scraps"); this.ownedTextures.add(scrapMap); const scrapMaterial = new THREE.MeshStandardMaterial({ map: scrapMap, roughness: 0.98 }); this.ownedMaterials.add(scrapMaterial);
    const scrapsMesh = new THREE.Mesh(scrapGeometry, scrapMaterial); scrapsMesh.userData.discovery = "diagram"; this.scene.add(scrapsMesh);
    const pinGeometries: THREE.BufferGeometry[] = [];
    for (const [horizontal, vertical] of [[0.34, 1.809], [1.43, 1.919], [1.37, 1.389]]) { const geometry = new THREE.CylinderGeometry(0.004, 0.004, 0.004, 8); geometry.rotateX(Math.PI / 2); geometry.translate(horizontal, vertical, -2.724); pinGeometries.push(geometry); }
    const pins = mergeGeometries(pinGeometries); pinGeometries.forEach(geometry => geometry.dispose()); this.ownedGeometries.add(pins); this.scene.add(new THREE.Mesh(pins, rubber));
    const folded = this.plane(0.19, 0.13, [-0.19, 0.771, -2.19], paperTexture("diagram", 256)); folded.rotation.set(-Math.PI / 2, 0, 0.19);
    const lid = this.box([0.165, 0.008, 0.24], [0.04, 0.774, -2.12], metal, this.scene, 0.002); lid.rotation.y = -0.20;
    this.box([0.045, 0.019, 0.029], [0.27, 0.780, -1.83], rubber, this.scene, 0.003);
    this.box([0.018, 0.01, 0.032], [0.28, 0.780, -1.875], metal);
    const looseCable = new THREE.CatmullRomCurve3([new THREE.Vector3(0.20, 0.773, -2.02), new THREE.Vector3(0.30, 0.773, -1.94), new THREE.Vector3(0.13, 0.773, -1.81), new THREE.Vector3(0.24, 0.773, -1.72)]);
    const cableGeometry = new THREE.TubeGeometry(looseCable, 24, 0.003, 5); this.ownedGeometries.add(cableGeometry); this.scene.add(new THREE.Mesh(cableGeometry, rubber));
    const acrylic = new THREE.MeshStandardMaterial({ color: 0xd2dedc, transparent: true, opacity: 0.23, roughness: 0.26, metalness: 0.05, depthWrite: false }); this.ownedMaterials.add(acrylic);
    const planes: THREE.BufferGeometry[] = [];
    for (let layer = 0; layer < 3; layer++) { const geometry = new THREE.BoxGeometry(0.008, 0.21, 0.24); geometry.rotateY(layer * 0.06); geometry.translate(2.57 + layer * 0.065, 1.904, -1.2 + layer * 0.02); planes.push(geometry); }
    const windows = mergeGeometries(planes); planes.forEach(geometry => geometry.dispose()); this.ownedGeometries.add(windows);
    const windowPlanes = new THREE.Mesh(windows, acrylic); windowPlanes.userData.discovery = "shelf"; this.scene.add(windowPlanes);
    this.host.dataset.surfacePatches = String(patches.length);
  }

  private pose(position: [number, number, number], target: [number, number, number], fov = 52): CameraPose {
    const camera = this.camera.clone(); camera.position.set(...position); camera.lookAt(...target); return { position: camera.position, rotation: camera.quaternion, fov };
  }

  private capture(): CameraPose { return { position: this.camera.position.clone(), rotation: this.camera.quaternion.clone(), fov: this.camera.fov }; }
  private move(pose: CameraPose, duration: number, complete?: () => void, via?: THREE.Vector3) {
    this.velocity.set(0, 0, 0); this.keys.clear();
    this.targetPosition.set(Infinity, Infinity, Infinity);
    if (this.reduced) {
      this.cameraMove = undefined; this.camera.position.copy(pose.position); this.camera.quaternion.copy(pose.rotation); this.camera.fov = pose.fov; this.camera.updateProjectionMatrix(); this.synchronizeAngles(); complete?.();
    } else this.cameraMove = { from: this.capture(), to: pose, via, elapsed: 0, duration, complete };
    this.wake();
  }

  walk(held: boolean, direction: "KeyW" | "KeyS" = "KeyW") { if (held && this.status.phase === "explore") this.keys.add(direction); else this.keys.delete(direction); this.wake(); }
  setTouchRoam(enabled: boolean) {
    this.touchRoam = enabled; this.guided = !enabled;
    this.host.dataset.guided = String(!enabled);
    this.keys.clear(); this.velocity.set(0, 0, 0); this.drag = undefined;
    this.lastInteraction = this.clock; this.wake();
  }
  exit() { this.finishHandoff(); }

  enter() {
    if (this.status.phase !== "ready" && this.status.phase !== "explore") return;
    this.status.phase = "explore"; this.canvas.tabIndex = -1; this.canvas.focus({ preventScroll: true }); this.emit();
    this.lastInteraction = this.clock;
    if (!this.guided && !this.reduced && !this.touchRoam) {
      try { const lock = this.canvas.requestPointerLock(); if (lock) void lock.catch(this.pointerError); } catch { this.pointerError(); }
    }
    this.wake();
  }

  guide(viewpoint: Viewpoint) {
    if (["wake", "handoff"].includes(this.status.phase)) return;
    if (this.status.inspection) this.closeInspection();
    this.status.phase = "explore"; this.status.viewpoint = viewpoint; this.status.target = viewpointDiscovery[viewpoint] ?? null;
    const poses: Record<Viewpoint, CameraPose> = {
      desk: this.pose([-1.85, 1.65, 0.8], [-0.55, 1.0, -1.9]),
      notebook: this.pose([-1.31, 1.50, -0.82], [-1.03, 0.80, -1.65]),
      shelf: this.pose([1.5, 1.58, -0.1], [2.65, 1.28, -1.4]),
      wall: this.pose([0.91, 1.55, -0.40], [0.86, 1.64, -2.71]),
      computer: this.pose([-0.51, 1.50, -0.65], [-0.5, 1.20, -2.07]),
    };
    const distance = this.camera.position.distanceTo(poses[viewpoint].position);
    const via = distance > 1.3 ? this.camera.position.clone().add(poses[viewpoint].position).multiplyScalar(.5).lerp(new THREE.Vector3(0, 1.65, .35), .45) : undefined;
    this.move(poses[viewpoint], Math.min(2.5, 1 + distance * .42), undefined, via); this.emit();
  }

  inspect(discovery: Discovery | null = this.status.target) {
    if (!discovery || !["explore", "ready"].includes(this.status.phase)) return;
    this.restoreMouseLook = document.pointerLockElement === this.canvas;
    this.lastInteraction = this.clock;
    this.returnPose = this.capture(); this.status.inspection = discovery; this.status.target = null; this.status.phase = "inspect";
    this.visits.add(discovery); this.host.dataset.discoveries = [...this.visits].join(",");
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    const poses: Record<Discovery, CameraPose> = {
      notebook: this.pose([-1.06, 1.33, -1.40], [-1.03, 0.81, -1.65], 42),
      diagram: this.pose([0.86, 1.64, -1.50], [0.86, 1.64, -2.71], 44),
      computer: this.pose([-0.50, 1.20, -1.07], [-0.50, 1.20, -2.07], 43),
      shelf: this.pose([1.57, 1.55, -1.1], [2.63, 1.28, -1.3], 45),
      drawer: this.pose([2.36, 1.18, 0.44], [2.71, 0.71, 1.07], 43),
    };
    if (this.camera.aspect < 0.8) {
      poses.notebook = this.pose([-1.16, 1.40, -1.25], [-1.16, 0.81, -1.65], 45);
      poses.diagram = this.pose([0.86, 1.64, -0.55], [0.86, 1.64, -2.71], 60);
      poses.computer = this.pose([-0.50, 1.20, -0.82], [-0.50, 1.20, -2.07], 62);
    }
    this.notebookPage = 0;
    if (discovery === "notebook") this.callbacks.sound("paper");
    if (discovery === "drawer") this.callbacks.sound("drawer");
    this.move(poses[discovery], 1.05); this.emit();
  }

  closeInspection() {
    if (this.status.phase !== "inspect") return;
    if (this.status.inspection === "notebook") this.callbacks.sound("paper");
    if (this.status.inspection === "drawer") this.callbacks.sound("drawer");
    this.status.inspection = null; this.status.phase = "explore";
    this.lastInteraction = this.clock;
    if (this.returnPose) this.move(this.returnPose, 0.8);
    if (this.restoreMouseLook && !this.guided && !this.reduced) this.enter();
    this.restoreMouseLook = false;
    this.emit();
  }

  turnNotebookPage() {
    if (this.status.inspection !== "notebook") return;
    this.notebookPage = 1 - this.notebookPage;
    const horizontal = this.notebookPage ? -0.90 : -1.16;
    this.callbacks.sound("paper");
    this.move(this.pose([horizontal, 1.40, -1.25], [horizontal, 0.87, -1.65], 45), 0.55);
  }

  recover() {
    if (this.status.inspection !== "computer" || this.status.recovered || this.status.recovering) return;
    this.status.recovering = true; this.recoveryTime = 1.8;
    this.lastInteraction = this.clock;
    this.callbacks.sound("drive");
    this.callbacks.sound("keyboard");
    const texture = monitorTexture(false, true); this.ownedTextures.add(texture);
    this.updateMonitor(texture);
    this.emit(); this.wake();
  }

  openPortfolio() {
    if (!this.status.recovered || this.status.phase !== "inspect") return;
    this.callbacks.sound("keyboard");
    if (document.pointerLockElement) document.exitPointerLock();
    this.status.phase = "handoff"; this.status.inspection = null; this.emit();
    this.website = this.callbacks.revealWebsite() ?? undefined;
    if (!this.website) { this.callbacks.complete(); return; }
    this.websiteParent = this.website.parentElement!;
    this.css = new CSS3DRenderer(); this.css.setSize(innerWidth, innerHeight);
    Object.assign(this.css.domElement.style, { position: "absolute", inset: "0", pointerEvents: "none", overflow: "hidden", zIndex: "1" });
    this.host.appendChild(this.css.domElement); this.cssScene = new THREE.Scene();
    Object.assign(this.website.style, { width: `${innerWidth}px`, height: `${innerHeight}px`, overflow: "hidden", visibility: "visible", opacity: "0", position: "absolute", background: "#f2ede3" });
    this.website.dataset.monitorSurface = "true";
    const surfaceScale = Math.min(0.64 / innerWidth, 0.4 / innerHeight);
    const surface = new CSS3DObject(this.website); this.monitorSurface = surface; surface.position.set(-0.5, 1.20, -2.067); surface.scale.setScalar(surfaceScale); this.cssScene.add(surface);
    const depth = innerWidth * surfaceScale / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) * this.camera.aspect);
    this.handoffDepth = depth; this.handoffStarted = false; this.handoffTime = 0;
  }

  private updateMonitor(texture: THREE.Texture | null) {
    if (!this.monitor) return;
    const previous = this.monitor.material.map;
    this.monitor.material.map = texture; this.monitor.material.needsUpdate = true;
    if (previous && this.ownedTextures.delete(previous)) previous.dispose();
  }

  private restoreWebsite() {
    this.cssScene?.clear();
    if (this.website && this.websiteParent) { this.websiteParent.appendChild(this.website); this.website.removeAttribute("style"); delete this.website.dataset.monitorSurface; }
    this.css?.domElement.remove(); this.css = undefined; this.cssScene = undefined; this.monitorSurface = undefined; this.website = undefined; this.websiteParent = undefined;
  }

  private finishHandoff() { this.restoreWebsite(); this.host.style.visibility = "hidden"; this.callbacks.complete(); }

  private emit() { this.host.dataset.phase = this.status.phase; this.host.dataset.inspection = this.status.inspection ?? ""; this.host.dataset.target = this.status.target ?? ""; this.callbacks.status({ ...this.status }); }

  private synchronizeAngles() { this.lookEuler.setFromQuaternion(this.camera.quaternion, "YXZ"); this.yaw = this.lookYaw = this.lookEuler.y; this.pitch = this.lookPitch = this.lookEuler.x; }

  private updateLook(delta: number) {
    if (this.status.phase !== "explore" || this.cameraMove || !(this.status.locked || this.touchRoam)) return;
    this.lookYaw = THREE.MathUtils.damp(this.lookYaw, this.yaw, 35, delta);
    this.lookPitch = THREE.MathUtils.damp(this.lookPitch, this.pitch, 35, delta);
    this.camera.quaternion.setFromEuler(this.lookEuler.set(this.lookPitch, this.lookYaw, 0));
  }

  private updateMovement(delta: number) {
    if (this.status.phase !== "explore" || this.cameraMove || !(this.status.locked || this.touchRoam) || this.host.dataset.guided === "true") return;
    const horizontal = Number(this.keys.has("KeyD") || this.keys.has("ArrowRight")) - Number(this.keys.has("KeyA") || this.keys.has("ArrowLeft"));
    const forward = Number(this.keys.has("KeyW") || this.keys.has("ArrowUp")) - Number(this.keys.has("KeyS") || this.keys.has("ArrowDown"));
    this.direction.set(horizontal, 0, -forward).normalize().applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.lookYaw).multiplyScalar(1.32);
    this.velocity.lerp(this.direction, 1 - Math.exp(-delta * (horizontal || forward ? 10 : 18)));
    const previousHorizontal = this.camera.position.x; const previousDepth = this.camera.position.z;
    const horizontalNext = this.camera.position.x + this.velocity.x * delta; const depthNext = this.camera.position.z + this.velocity.z * delta;
    if (positionAllowed(horizontalNext, this.camera.position.z)) this.camera.position.x = horizontalNext; else this.velocity.x = 0;
    if (positionAllowed(this.camera.position.x, depthNext)) this.camera.position.z = depthNext; else this.velocity.z = 0;
    this.stepDistance += Math.hypot(this.camera.position.x - previousHorizontal, this.camera.position.z - previousDepth);
    if (this.stepDistance > 0.70) { this.stepDistance = 0; this.callbacks.sound("step"); }
    const sway = this.reduced || !(horizontal || forward) ? 0 : Math.sin(this.stepDistance / 0.70 * Math.PI * 2) * Math.min(this.velocity.length() / 1.32, 1) * 0.0015;
    this.camera.position.y += (1.65 + sway - this.camera.position.y) * (1 - Math.exp(-delta * 8));
  }

  private updateTarget() {
    if (this.status.phase !== "explore" || this.cameraMove) return;
    if (this.clock - this.targetTime < 1 / 30) return;
    if (this.camera.position.distanceToSquared(this.targetPosition) < 0.000001 && this.camera.quaternion.angleTo(this.targetRotation) < 0.0001) return;
    this.targetTime = this.clock; this.targetPosition.copy(this.camera.position); this.targetRotation.copy(this.camera.quaternion);
    if (!this.rayObjects.length) this.scene.traverse(object => { if (object instanceof THREE.Mesh) this.rayObjects.push(object); });
    this.camera.updateMatrixWorld();
    this.ray.setFromCamera(this.rayCenter, this.camera); this.ray.far = 2.6;
    let target: Discovery | null = null;
    this.rayHits.length = 0;
    const hits = this.ray.intersectObjects(this.rayObjects, false, this.rayHits);
    for (const hit of hits) {
      if (hit.object instanceof THREE.Points) continue;
      let object: THREE.Object3D | null = hit.object;
      while (object && !object.userData.discovery) object = object.parent;
      target = object?.userData.discovery ?? null;
      if (!target && ["room_cream", "room_steel"].includes(hit.object.name) && hit.point.x > 2.17 && hit.point.x < 3.17 && hit.point.z > -2.2 && hit.point.z < -0.62 && hit.point.y > 0.1 && hit.point.y < 2.3) target = "shelf";
      if (hit.object instanceof THREE.Mesh && hit.object.material instanceof THREE.Material && hit.object.material.transparent) continue;
      break;
    }
    if (target !== this.status.target) { this.status.target = target; this.emit(); }
  }

  private render = (time: number) => {
    this.frame = 0;
    if (this.disposed || document.hidden || !this.initialized) return;
    const elapsed = this.previous ? (time - this.previous) / 1000 : 1 / 60;
    const delta = Math.min(0.05, elapsed); this.previous = time; this.clock += delta;
    if (this.status.phase === "wake") {
      this.wakeTime += delta;
      this.host.dataset.wakeTime = this.wakeTime.toFixed(3);
      const wakeFov = this.camera.aspect < 0.8 ? 68 : 52;
      const orientationProgress = this.reduced ? Number(this.wakeTime >= 2.35) : ease((this.wakeTime - 3.8) / 3.9);
      const fieldOfView = THREE.MathUtils.lerp(wakeFov, 52, orientationProgress);
      if (this.camera.fov !== fieldOfView) { this.camera.fov = fieldOfView; this.camera.updateProjectionMatrix(); }
      const duration = this.reduced ? 3 : 7.7;
      const flicker = !this.reduced && (this.wakeTime > 0.85 && this.wakeTime < 1.13 || this.wakeTime > 1.36 && this.wakeTime < 1.53);
      this.host.style.setProperty("--wake-white", String(flicker ? 0 : 1 - ease((this.wakeTime - 1.60) / 1.50)));
      this.gl.toneMappingExposure = flicker ? 0.015 : 1.05 + (1 - ease((this.wakeTime - 1.6) / 2)) * 3;
      this.ceiling.intensity = flicker ? 0.02 : 65;
      this.tubeMaterials.forEach((material, index) => material.emissiveIntensity = flicker || index === 1 && this.wakeTime < 1.63 ? 0.03 : 3.3);
      if (this.reduced) {
        const white = this.wakeTime < 2.1 ? 1 - ease((this.wakeTime - 0.4) / 0.8) : this.wakeTime < 2.35 ? ease((this.wakeTime - 2.1) / 0.25) : 1 - ease((this.wakeTime - 2.35) / 0.6);
        this.host.style.setProperty("--wake-white", String(white)); this.gl.toneMappingExposure = 1.05;
        if (this.wakeTime >= 2.35) { const standing = this.pose([0, 1.65, 1.92], [-0.52, 1.20, -1.9]); this.camera.position.copy(standing.position); this.camera.quaternion.copy(standing.rotation); }
      }
      if (!this.reduced && this.wakeTime > 3.8) {
        const progress = ease((this.wakeTime - 3.8) / 3.9);
        const standing = this.pose([0, 1.65, 1.92], [-0.52, 1.20, -1.9]);
        const lying = this.pose([0, 0.16, 0.7], [0, 3.04, 0.7]);
        this.camera.position.lerpVectors(lying.position, standing.position, progress); this.camera.quaternion.slerpQuaternions(lying.rotation, standing.rotation, progress);
      }
      if (this.wakeTime >= duration) {
        this.host.style.setProperty("--wake-white", "0"); this.gl.toneMappingExposure = 1.05;
        if (this.reduced) { const standing = this.pose([0, 1.65, 1.92], [-0.52, 1.20, -1.9]); this.camera.position.copy(standing.position); this.camera.quaternion.copy(standing.rotation); }
        this.synchronizeAngles(); this.status.phase = "ready"; this.emit();
      }
    }
    if (this.cameraMove) {
      const move = this.cameraMove; move.elapsed += delta; const progress = ease(move.elapsed / move.duration);
      if (move.via) this.camera.position.copy(move.from.position).multiplyScalar((1 - progress) ** 2).addScaledVector(move.via, 2 * (1 - progress) * progress).addScaledVector(move.to.position, progress ** 2);
      else this.camera.position.lerpVectors(move.from.position, move.to.position, progress);
      this.camera.quaternion.slerpQuaternions(move.from.rotation, move.to.rotation, progress); this.camera.fov = THREE.MathUtils.lerp(move.from.fov, move.to.fov, progress); this.camera.updateProjectionMatrix();
      if (move.elapsed >= move.duration) { this.cameraMove = undefined; this.synchronizeAngles(); move.complete?.(); if (this.disposed) return; }
    }
    this.updateLook(delta); this.updateMovement(delta); this.updateTarget();
    if (this.notebook) {
      this.notebookLift = THREE.MathUtils.damp(this.notebookLift, this.status.inspection === "notebook" ? 1 : 0, 6, delta);
      this.notebook.position.y = 0.778 + this.notebookLift * 0.06;
      this.notebook.rotation.x = this.notebookLift * 0.07;
      this.host.dataset.notebookLift = this.notebookLift.toFixed(3);
    }
    if (this.recoveryTime > 0) {
      this.recoveryTime -= delta;
      if (this.recoveryTime <= 0) {
        this.status.recovering = false; this.status.recovered = true;
        this.callbacks.sound("power");
        const texture = monitorTexture(true); this.ownedTextures.add(texture);
        this.updateMonitor(texture);
        this.emit();
      }
    }
    const powered = this.visits.has("notebook") || this.status.recovered;
    if (powered && !this.lampPowered) { this.lampPowered = true; this.callbacks.sound("lamp"); }
    this.lamp.intensity += ((powered ? 1.65 : 0) - this.lamp.intensity) * (1 - Math.exp(-delta * 7));
    this.monitorLight.intensity += ((this.status.recovered ? 2.5 : 0.2) - this.monitorLight.intensity) * (1 - Math.exp(-delta * 2));
    if (this.fan && this.status.recovered) this.fan.rotation.y += delta * (this.reduced ? 0.5 : 12);
    if (this.drawer) this.drawer.position.z += ((this.status.inspection === "drawer" ? 0.95 : 1.28) - this.drawer.position.z) * (1 - Math.exp(-delta * 4));
    if (this.dust && !this.reduced) this.dust.position.x = Math.sin(this.clock * 0.06) * 0.10;
    if (this.rain && !this.reduced) this.rain.offset.y = -this.clock * 0.002;
    if (this.clock - this.audioTime >= 1 / 30) {
      this.audioTime = this.clock;
      this.camera.getWorldDirection(this.audioForward); this.audioUp.set(0, 1, 0).applyQuaternion(this.camera.quaternion);
      this.callbacks.audioFrame([this.camera.position.x, this.camera.position.y, this.camera.position.z], [this.audioForward.x, this.audioForward.y, this.audioForward.z], [this.audioUp.x, this.audioUp.y, this.audioUp.z], this.reduced ? Math.max(3, this.wakeTime) : this.wakeTime, this.status.phase === "handoff" && this.handoffStarted ? this.handoffTime * (this.reduced ? 3.4 / 0.9 : 1) : 0);
    }
    if (this.status.phase === "handoff") {
      this.handoffTime += delta;
      if (!this.handoffStarted) {
        const journey = this.website?.querySelector<HTMLElement>("[data-workbench-stage]");
        if (journey?.dataset.ready === "true" || this.handoffTime > 6) {
          this.handoffStarted = true; this.handoffTime = 0;
          if (this.monitor) { this.monitor.material.transparent = true; this.monitor.material.needsUpdate = true; }
          if (this.reduced && this.monitorSurface) {
            this.monitorSurface.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(this.handoffDepth)); this.monitorSurface.quaternion.copy(this.camera.quaternion);
          } else this.move(this.pose([-0.5, 1.20, -2.067 + this.handoffDepth], [-0.5, 1.20, -2.067], this.camera.fov), 3.4, () => this.finishHandoff());
        }
      } else {
        if (this.website) { this.website.style.opacity = String(ease(this.handoffTime / 0.65)); this.website.style.setProperty("--monitor-glass", String((1 - ease(this.handoffTime / 3.2)) * 0.14)); }
        if (this.monitor) this.monitor.material.opacity = 1 - ease(this.handoffTime / 0.65);
        this.monitorLight.intensity = 2.5 + ease(this.handoffTime / 2.6) * 5;
        if (this.reduced && this.handoffTime > 0.9) { this.finishHandoff(); return; }
      }
    }
    const start = performance.now(); this.gl.render(this.scene, this.camera);
    if (this.css && this.cssScene) this.css.render(this.cssScene, this.camera);
    if (elapsed < 0.25) this.timings.push(elapsed * 1000); this.drawTimes.push(performance.now() - start);
    if (this.timings.length > 180) this.timings.shift(); if (this.drawTimes.length > 180) this.drawTimes.shift();
    if (this.clock - this.reportTime >= 0.1) {
      this.reportTime = this.clock;
      this.host.dataset.drawCalls = String(this.gl.info.render.calls); this.host.dataset.triangles = String(this.gl.info.render.triangles); this.host.dataset.textures = String(this.gl.info.memory.textures);
      this.host.dataset.camera = `${this.camera.position.x.toFixed(3)},${this.camera.position.y.toFixed(3)},${this.camera.position.z.toFixed(3)}`;
      this.host.dataset.look = `${this.lookYaw.toFixed(5)},${this.lookPitch.toFixed(5)}`;
      this.host.dataset.lookTarget = `${this.yaw.toFixed(5)},${this.pitch.toFixed(5)}`;
      if (this.timings.length === 180) { this.host.dataset.frameMs = (this.timings.reduce((sum, value) => sum + value, 0) / 180).toFixed(2); this.host.dataset.drawMs = (this.drawTimes.reduce((sum, value) => sum + value, 0) / this.drawTimes.length).toFixed(2); }
    }
    const resting = this.guided && ["ready", "explore", "inspect"].includes(this.status.phase) && !this.cameraMove && this.recoveryTime <= 0 && this.clock - this.lastInteraction > 1.5 && Math.abs(this.notebookLift - (this.status.inspection === "notebook" ? 1 : 0)) < .004 && Math.abs(this.lamp.intensity - (powered ? 1.65 : 0)) < .01 && Math.abs(this.monitorLight.intensity - (this.status.recovered ? 2.5 : 0.2)) < .01;
    if (resting) { this.previous = 0; this.host.dataset.idle = "true"; return; }
    this.frame = requestAnimationFrame(this.render);
  };

  private resize = () => {
    const width = this.host.clientWidth || innerWidth; const height = this.host.clientHeight || innerHeight;
    const ratio = Math.min(devicePixelRatio, this.guided ? 1.25 : 1.5, Math.sqrt((this.guided ? 600000 : 1500000) / (width * height)));
    this.gl.setPixelRatio(ratio); this.gl.setSize(width, height, false); this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
    const size = this.gl.getDrawingBufferSize(new THREE.Vector2()); this.host.dataset.renderSize = `${size.x}x${size.y}`;
    if (this.status.phase === "handoff" && this.website && this.css && this.monitorSurface) {
      this.css.setSize(width, height); Object.assign(this.website.style, { width: `${width}px`, height: `${height}px` });
      const scale = Math.min(0.64 / width, 0.4 / height); this.monitorSurface.scale.setScalar(scale);
      this.handoffDepth = width * scale / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) * this.camera.aspect);
      if (this.reduced && this.handoffStarted) this.monitorSurface.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(this.handoffDepth));
      else if (this.handoffStarted && this.cameraMove) {
        const remaining = Math.max(0.3, this.cameraMove.duration - this.cameraMove.elapsed);
        this.cameraMove = { from: this.capture(), to: this.pose([-0.5, 1.20, -2.067 + this.handoffDepth], [-0.5, 1.20, -2.067], this.camera.fov), elapsed: 0, duration: remaining, complete: () => this.finishHandoff() };
      }
    }
    this.wake();
  };
  private wake() { if (!this.frame && !this.disposed && !document.hidden && this.initialized) { this.previous = 0; this.frame = requestAnimationFrame(this.render); } }
  private visibility = () => { if (document.hidden) { cancelAnimationFrame(this.frame); this.frame = 0; this.previous = 0; this.keys.clear(); } else this.wake(); };
  private blur = () => { this.keys.clear(); this.velocity.set(0, 0, 0); };
  private keyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) return;
    if (event.code === "Escape" && this.status.phase === "inspect") { event.preventDefault(); this.closeInspection(); return; }
    if (event.code === "Escape" && document.pointerLockElement === this.canvas) { document.exitPointerLock(); this.keys.clear(); return; }
    const movement = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code);
    const arrowOnControl = event.code.startsWith("Arrow") && event.target instanceof Element && Boolean(event.target.closest("button,a,summary"));
    if (movement && !arrowOnControl && this.status.phase === "explore") { event.preventDefault(); this.keys.add(event.code); }
    if (event.code === "KeyE" && !event.repeat) { event.preventDefault(); if (this.status.phase === "inspect") this.closeInspection(); else this.inspect(); }
  };
  private keyUp = (event: KeyboardEvent) => { this.keys.delete(event.code); };
  private pointerLock = () => { this.status.locked = document.pointerLockElement === this.canvas; this.keys.clear(); this.velocity.set(0, 0, 0); this.synchronizeAngles(); this.emit(); };
  private pointerError = () => { if (this.disposed) return; this.host.dataset.pointerFallback = "true"; this.status.locked = false; this.emit(); };
  private monitorActionAt(horizontal: number, vertical: number) {
    if (!this.monitor || this.status.phase !== "inspect" || this.status.inspection !== "computer" || this.cameraMove) return false;
    const bounds = this.canvas.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2((horizontal - bounds.left) / bounds.width * 2 - 1, 1 - (vertical - bounds.top) / bounds.height * 2), this.camera);
    const hit = this.ray.intersectObject(this.monitor)[0];
    return Boolean(hit?.uv && (this.status.recovered ? hit.uv.x > 0.68 && hit.uv.y < 0.23 : hit.uv.x < 0.43 && hit.uv.y < 0.31));
  }
  private click = (event: MouseEvent) => {
    if (this.suppressClick) { this.suppressClick = false; return; }
    if (this.status.phase === "explore" && !this.guided && !this.reduced && !this.status.locked && !this.touchRoam) { this.enter(); return; }
    if (this.monitorActionAt(event.clientX, event.clientY)) { if (this.status.recovered) this.openPortfolio(); else this.recover(); }
    else if (this.status.phase === "explore" && this.status.target) this.inspect();
  };
  private pointerDown = (event: PointerEvent) => { this.suppressClick = false; this.dragDistance = 0; if ((this.guided || this.touchRoam) && this.status.phase === "explore") { this.drag = { horizontal: event.clientX, vertical: event.clientY, origin: event.clientX }; this.canvas.setPointerCapture(event.pointerId); } };
  private pointerUp = () => {
    if (this.drag && this.dragDistance > 4) this.suppressClick = true;
    if (this.drag && this.host.dataset.guided === "true" && Math.abs(this.drag.horizontal - this.drag.origin) > 55 && !this.cameraMove) {
      const index = viewpointOrder.indexOf(this.status.viewpoint); const direction = this.drag.horizontal < this.drag.origin ? 1 : -1;
      this.guide(viewpointOrder[Math.max(0, Math.min(viewpointOrder.length - 1, index + direction))]);
    }
    this.drag = undefined;
  };
  private pointerMove = (event: PointerEvent) => {
    if (this.status.phase === "inspect") { this.canvas.style.cursor = this.monitorActionAt(event.clientX, event.clientY) ? "pointer" : "auto"; return; }
    this.canvas.style.cursor = "auto";
    if (this.cameraMove || this.status.phase !== "explore") return;
    let horizontal = 0; let vertical = 0;
    if (this.status.locked) { horizontal = event.movementX; vertical = event.movementY; }
    else if (this.drag) { horizontal = event.clientX - this.drag.horizontal; vertical = event.clientY - this.drag.vertical; this.dragDistance += Math.hypot(horizontal, vertical); this.drag = { horizontal: event.clientX, vertical: event.clientY, origin: this.drag.origin }; }
    if (this.host.dataset.guided === "true") return;
    this.yaw -= horizontal * 0.0018; this.pitch = THREE.MathUtils.clamp(this.pitch - vertical * 0.0018, -1.15, 1.15);
  };
  private contextLost = (event: Event) => { event.preventDefault(); this.callbacks.failed(); };

  dispose() {
    this.disposed = true; cancelAnimationFrame(this.frame);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.canvas.removeEventListener("webglcontextlost", this.contextLost); this.canvas.removeEventListener("click", this.click); this.canvas.removeEventListener("pointerdown", this.pointerDown);
    removeEventListener("pointerup", this.pointerUp); removeEventListener("pointermove", this.pointerMove); removeEventListener("keydown", this.keyDown); removeEventListener("keyup", this.keyUp); removeEventListener("blur", this.blur); removeEventListener("resize", this.resize);
    document.removeEventListener("visibilitychange", this.visibility); document.removeEventListener("pointerlockchange", this.pointerLock); document.removeEventListener("pointerlockerror", this.pointerError);
    this.restoreWebsite(); this.ownedGeometries.forEach(geometry => geometry.dispose()); this.ownedMaterials.forEach(material => material.dispose()); this.ownedTextures.forEach(texture => texture.dispose());
    this.gl.dispose(); this.gl.forceContextLoss();
  }
}
