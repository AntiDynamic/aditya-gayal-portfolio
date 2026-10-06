"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CanvasTexture,
  ExtrudeGeometry,
  Float32BufferAttribute,
  OrthographicCamera,
  VSMShadowMap,
  SRGBColorSpace,
  DoubleSide,
  TubeGeometry,
  CatmullRomCurve3,
  Vector3,
  RGBADepthPacking,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import {
  getEntranceComposition,
  type EntranceComposition,
  type EntrancePiece,
} from "./entrance-manifest";
import { MATERIAL_FINISH, useSurfaceTextures } from "./entrance-materials";
import { useEntrancePresence } from "./entrance-presence";
import {
  getBreakAssembly,
  type EntranceBreakStore,
} from "./entrance-break";
import { heroWorldAnchor, openingPose, cavityAnchor } from "./world-layout";
import { foldTopology, printFold, sectionProgress } from "./entrance-unfold";
import { WorldInstrument } from "./world-instrument";
import type { WorldRuntime } from "./world-context";
import type { MutableRefObject } from "react";
import { surfaceOutline as outline } from "./entrance-geometry";

export type EntranceSceneProps = {
  onInvalidate?: (fn: (() => void) | null) => void;
  runtime?: MutableRefObject<WorldRuntime>;
  active?: boolean;
  passing?: boolean;
  onReady: () => void;
  onHeroReady?: () => void;
  onLost: () => void;
  reducedMotion?: boolean;
  breakStore: EntranceBreakStore;
};

function Surface({
  piece,
  composition,
  atlas,
  textures,
  runtime,
}: {
  piece: EntrancePiece;
  composition: EntranceComposition;
  atlas: CanvasTexture | null;
  textures: ReturnType<typeof useSurfaceTextures>;
  runtime?: MutableRefObject<WorldRuntime>;
}) {
  const geometry = useMemo(() => {
    let geometry: import("three").BufferGeometry = new ExtrudeGeometry(outline(piece.points, composition), {
      depth: piece.depth / 100,
      bevelEnabled: true,
      bevelSegments: piece.material === "paper" ? 1 : 4,
      steps: 1,
      bevelSize:
        piece.material === "paper"
          ? 0.004
          : piece.material === "enamel"
            ? 0.008
            : 0.018,
      bevelThickness: piece.material === "paper" ? 0.003 : 0.018,
      curveSegments: 1,
    });
    if (piece.material === "paper") {
      const original = geometry;
      geometry = foldTopology(original, composition.width < 768 ? .23 : .65);
      original.dispose();
    }
    // One common planar UV field: print crosses joins without restarting on each sheet.
    const positions = geometry.getAttribute("position");
    const uv = new Float32Array(positions.count * 2);
    for (let index = 0; index < positions.count; index++) {
      // A slight physical lean exposes the cut edges to the straight-on camera.
      const rise = Math.max(0, positions.getZ(index));
      positions.setX(index, positions.getX(index) - rise * 0.24);
      positions.setY(index, positions.getY(index) + rise * 0.35);
      // One deliberate paper lift, not a uniform slab edge. UVs remain registered
      // in the common editorial plane while the printed face changes depth.
      if (piece.material === "paper" && piece.role === "primary") {
        const across =
          (positions.getX(index) * 100 + composition.width / 2) /
          composition.width;
        const lift =
          Math.max(0, across - 0.42) * (piece.id === "sweep" ? 0.34 : 0.2);
        positions.setZ(index, positions.getZ(index) + lift);
      }
      uv[index * 2] =
        (positions.getX(index) * 100 + composition.width / 2) /
        composition.width;
      uv[index * 2 + 1] =
        (positions.getY(index) * 100 + composition.height / 2) /
        composition.height;
    }
    geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    geometry.computeVertexNormals();
    if (piece.material === "enamel")
      return toCreasedNormals(geometry, Math.PI / 3);
    return geometry;
  }, [piece, composition]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const fold = useRef({
    uFieldCurl: { value: .025 },
    uFieldHinge: { value: composition.width < 768 ? .98 : .78 },
    uFieldDirection: { value: piece.id === "sweep" ? 1 : -1 },
  });
  useEffect(() => { fold.current.uFieldHinge.value = composition.width < 768 ? .98 : .78; }, [composition.width]);
  const paper = piece.material === "paper";
  useFrame(() => {
    if (paper) fold.current.uFieldCurl.value = .025 + sectionProgress(runtime?.current.passage ?? 0, .025, .64) * (composition.width < 768 ? .75 : .23);
  });
  const printed = piece.role === "primary";
  const metal = piece.material === "aluminum";
  const acrylic = piece.material === "acrylic";
  return (
    <>
      {piece.material === "paper" && piece.role === "primary" && (
        <mesh
          geometry={geometry}
          position={[0.004, -0.013, piece.z / 100 - 0.035]}
        >
          <meshStandardMaterial color="#e2d6c3" roughness={1} side={DoubleSide}
            onUpdate={material => { printFold(material, fold.current); material.needsUpdate = true; }} />
        </mesh>
      )}
      <mesh
        geometry={geometry}
        position={[0, 0, piece.z / 100]}
        castShadow
        receiveShadow
      >
        {paper && (
          <meshDepthMaterial
            attach="customDepthMaterial"
            depthPacking={RGBADepthPacking}
            onUpdate={material => {
              printFold(material, fold.current);
              material.needsUpdate = true;
            }}
          />
        )}
        <meshStandardMaterial
          attach="material-0"
          {...MATERIAL_FINISH[piece.material]}
          side={paper ? DoubleSide : undefined}
          color={piece.color}
          map={printed ? atlas : null}
          normalMap={
            piece.material === "paper"
              ? textures.paperNormal
              : piece.material === "enamel"
                ? textures.enamelNormal
                : metal
                  ? textures.metalNormal
                  : null
          }
          onUpdate={(material) => {
            if (paper) printFold(material, fold.current);
            material.needsUpdate = true;
          }}
        />
        <meshStandardMaterial
          attach="material-1"
          onUpdate={material => { if (paper) printFold(material, fold.current); material.needsUpdate = true; }}
          color={
            piece.material === "paper"
              ? "#ded2bf"
              : piece.material === "enamel"
                ? "#e0e0d8"
                : piece.color
          }
          roughness={metal ? 0.56 : piece.material === "paper" ? 1 : 0.6}
          metalness={metal ? 0.65 : 0}
          transparent={acrylic}
          opacity={acrylic ? 0.52 : 1}
        />
      </mesh>
    </>
  );
}

function SignatureSurface({
  root,
  name,
  atlas,
  textures,
}: {
  root: import("three").Group;
  name: string;
  atlas: CanvasTexture | null;
  textures: ReturnType<typeof useSurfaceTextures>;
}) {
  const object = useMemo(() => {
    const source = root.getObjectByName(name);
    if (!source) throw new Error(`Missing signature node: ${name}`);
    const clone = source.clone(true);
    clone.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      node.castShadow = true;
      node.receiveShadow = true;
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      const mapped = materials.map((source) => {
        const material = (source as MeshStandardMaterial).clone();
        if (material.name === "PrintFace") {
          material.map = atlas;
          material.normalMap = textures.enamelNormal;
          // glTF stores V downward. Restore our shared atlas's upward UV field.
          node.geometry = node.geometry.clone();
          const uv = node.geometry.getAttribute("uv");
          for (let index = 0; index < uv.count; index++)
            uv.setY(index, 1 - uv.getY(index));
          uv.needsUpdate = true;
        }
        if (material.name === "BrushedMetal") {
          material.normalMap = textures.metalNormal;
          material.normalScale.set(0.08, 0.16);
        }
        material.needsUpdate = true;
        return material;
      });
      node.material = Array.isArray(node.material) ? mapped : mapped[0];
    });
    return clone;
  }, [root, name, atlas, textures]);
  useEffect(
    () => () =>
      object.traverse((node) => {
        if (node instanceof Mesh) {
          const materials = Array.isArray(node.material)
            ? node.material
            : [node.material];
          if (materials.some((material) => material.name === "PrintFace"))
            node.geometry.dispose();
          materials.forEach((material) => material.dispose());
        }
      }),
    [object],
  );
  return <primitive object={object} />;
}

function Field({
  onReady,
  onLost,
  runtime,
}: EntranceSceneProps) {
  const { size, get, gl, invalidate } = useThree();
  const mobile = size.width < 768;
  const composition = useMemo(() => getEntranceComposition(mobile), [mobile]);
  const sculpture = useEntrancePresence(composition);
  const unfolded = useRef<import("three").Group>(null);
  const seam = useRef<import("three").Group>(null);
  const chamberMaterials = useRef<import("three").Material[]>([]);
  const seamMaterials = useRef<import("three").Material[]>([]);
  const top = useRef<import("three").Group>(null);
  const bottom = useRef<import("three").Group>(null);
  const enamel = useRef<import("three").Group>(null);
  const metal = useRef<import("three").Group>(null);
  const rubber = useRef<import("three").Group>(null);
  const assembly = useMemo(() => getBreakAssembly(mobile), [mobile]);
  const textures = useSurfaceTextures(composition.width, composition.height);
  const modelUrl = `/entrance/models/entrance-break-${mobile ? "mobile" : "desktop"}.glb`;
  const model = useLoader(GLTFLoader, modelUrl);
  useEffect(
    () => () => {
      model.scene.traverse((node) => {
        if (node instanceof Mesh) {
          node.geometry.dispose();
          (Array.isArray(node.material)
            ? node.material
            : [node.material]
          ).forEach((material) => material.dispose());
        }
      });
      useLoader.clear(GLTFLoader, modelUrl);
    },
    [model, modelUrl],
  );
  const [atlas, setAtlas] = useState<CanvasTexture | null>(null);
  const notified = useRef(false);
  const warmed = useRef(false);
  const readyFrameRef = useRef<number | null>(null);
  const metricFrameRef = useRef<number | null>(null);
  const measuredPose = useRef(-1);
  const passageGroup = useRef<import("three").Group>(null);
  const callbacks = useRef({ onReady, onLost });
  useEffect(() => {
    callbacks.current = { onReady, onLost };
  }, [onReady, onLost]);

  useEffect(() => {
    // Camera frustum is imperative Three state, not React render state.
    const ortho = get().camera as OrthographicCamera;
    const unitsPerPixel =
      Math.max(
        composition.width / size.width,
        composition.height / size.height,
      ) / 100;
    if (ortho instanceof OrthographicCamera) {
      ortho.left = (-size.width * unitsPerPixel) / 2;
      ortho.right = (size.width * unitsPerPixel) / 2;
      ortho.top = (size.height * unitsPerPixel) / 2;
      ortho.bottom = (-size.height * unitsPerPixel) / 2;
      ortho.updateProjectionMatrix();
    }
    gl.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5));
    invalidate();
  }, [get, composition, size.width, size.height, gl, invalidate, mobile]);

  useEffect(() => {
    let cancelled = false;
    let texture: CanvasTexture | undefined;
    notified.current = false;
    document.fonts.ready
      .then(() => {
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        const resolution = Math.min(mobile ? 2 : 1.5, 2048 / composition.width);
        canvas.width = Math.ceil(composition.width * resolution);
        canvas.height = Math.ceil(composition.height * resolution);
        const context = canvas.getContext("2d");
        if (!context) {
          callbacks.current.onLost();
          return;
        }
        context.scale(resolution, resolution);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, composition.width, composition.height);
        context.fillStyle = "#22211f";
        const font =
          getComputedStyle(document.documentElement)
            .getPropertyValue("--font-display")
            .trim() || '"Bricolage Grotesque", Arial, sans-serif';
        context.textBaseline = "alphabetic";
        for (const line of composition.titleLines) {
          context.font = `800 ${line.size}px ${font}`;
          context.letterSpacing = `${line.size * -0.045}px`;
          context.fillText(line.text, line.x, line.y);
        }
        texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
        setAtlas(texture);
        invalidate();
      })
      .catch(() => callbacks.current.onLost());
    return () => {
      cancelled = true;
      if (readyFrameRef.current !== null)
        cancelAnimationFrame(readyFrameRef.current);
      if (metricFrameRef.current !== null)
        cancelAnimationFrame(metricFrameRef.current);
      texture?.dispose();
    };
  }, [composition, gl, invalidate, mobile]);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      callbacks.current.onLost();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl]);

  useEffect(() => {
    if (!atlas) return;
    // compile() traverses hidden meshes too: the fragment must be ready before a hit.
    gl.initTexture(atlas);
    gl.compile(get().scene, get().camera);
    warmed.current = true;
    invalidate();
    return () => {
      warmed.current = false;
    };
  }, [atlas, gl, get, invalidate]);

  // Scroll controls one shared pose. Geometry bends in the vertex shader;
  // printed UVs, normals and shadow geometry travel with the actual surface.
  useFrame(() => {
    const p = runtime?.current.passage ?? 0;
    const lift = sectionProgress(p, .025, .57);
    const depart = sectionProgress(p, .45, .96);
    const joinDepart = sectionProgress(p, .20, .55);
    if (top.current) {
      top.current.rotation.set(lift * .88, -lift * .10, lift * -.07);
      top.current.position.y = .78 + lift * .8 + depart * 4;
      top.current.position.z = lift * .30;
    }
    if (bottom.current) {
      bottom.current.rotation.set(-lift * .80, lift * .05, lift * .045);
      bottom.current.position.y = .78 - lift * .65 - depart * 4.5;
      bottom.current.position.z = lift * .5;
    }
    if (enamel.current) {
      enamel.current.rotation.set(-lift * .035, lift * 1.15, lift * -.035);
      enamel.current.position.x = 1.65 + lift * (mobile ? .5 : 1.15) + depart * 5;
      enamel.current.position.z = lift * .75;
    }
    if (metal.current) {
      metal.current.rotation.z = -lift * .32;
      metal.current.position.z = lift * .55;
      metal.current.position.x = lift * .12 - joinDepart * (mobile ? 2.4 : 5.5);
      metal.current.position.y = joinDepart * (mobile ? 3.5 : 7);
    }
    if (rubber.current) {
      rubber.current.scale.set(1 + lift * .24, 1 - lift * .22, 1);
      rubber.current.position.z = lift * .25;
      rubber.current.position.x = -joinDepart * (mobile ? 2.6 : 6);
      rubber.current.position.y = joinDepart * (mobile ? 3.5 : 7);
    }
    if (unfolded.current) {
      unfolded.current.visible = p > .025 && p < .99;
      if (!chamberMaterials.current.length) unfolded.current.traverse(node => {
        if (node instanceof Mesh) chamberMaterials.current.push(...(Array.isArray(node.material) ? node.material : [node.material]));
      });
      const opacity = sectionProgress(p, .025, .20) * (1 - sectionProgress(p, .73, .99));
      chamberMaterials.current.forEach(material => { material.opacity = opacity; });
    }
    if (seam.current) {
      if (!seamMaterials.current.length) seam.current.traverse(node => {
        if (node instanceof Mesh) seamMaterials.current.push(...(Array.isArray(node.material) ? node.material : [node.material]));
      });
      const opacity = 1 - sectionProgress(p, .18, .43);
      seam.current.visible = opacity > .001;
      seamMaterials.current.forEach(material => { material.opacity = opacity; });
    }
    if (passageGroup.current && runtime) {
      const cavity = cavityAnchor(assembly.fragment.points, composition.width, composition.height);
      const travel = sectionProgress(p, .34, 1);
      const pose = openingPose(travel, cavity.x, cavity.y, heroWorldAnchor(runtime.current.hero, size, get().camera));
      passageGroup.current.scale.setScalar(pose.scale);
      passageGroup.current.rotation.y = Math.sin(travel * Math.PI) * -.10;
      passageGroup.current.position.set(pose.x, pose.y, pose.z * .65);
    }
    const state = Math.round(p * 4);
    if (atlas && measuredPose.current !== state) {
      measuredPose.current = state;
      if (metricFrameRef.current !== null) cancelAnimationFrame(metricFrameRef.current);
      metricFrameRef.current = requestAnimationFrame(() => {
        metricFrameRef.current = null;
        gl.domElement.dataset.renderStats = JSON.stringify({
          calls: gl.info.render.calls, triangles: gl.info.render.triangles,
          geometries: gl.info.memory.geometries, textures: gl.info.memory.textures,
          programs: gl.info.programs?.length, dpr: gl.getPixelRatio(), passage: p,
        });
      });
    }
    if (atlas && warmed.current && !notified.current) {
      notified.current = true;
      readyFrameRef.current = requestAnimationFrame(() => {
        readyFrameRef.current = null;
        callbacks.current.onReady();
      });
    }
  });

  const interior = useMemo(() => {
    const points: [number, number][] = mobile
      ? [[259,112],[279,120],[265,298],[299,327],[307,391],[274,378],[245,336],[173,334],[-30,327],[-30,311],[244,311]]
      : [[887,94],[921,108],[873,371],[961,401],[987,478],[944,472],[847,431],[682,436],[-105,463],[-105,442],[849,405]];
    return new ExtrudeGeometry(outline(points, composition), { depth: .18, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 2 });
  }, [composition, mobile]);
  const trace = useMemo(() => new TubeGeometry(new CatmullRomCurve3([
    new Vector3(mobile ? -.8 : -3.5, -.35, -3.25),
    new Vector3(mobile ? -.25 : -1.5, .45, -3.20),
    new Vector3(mobile ? .35 : 1, .45, -3.20),
    new Vector3(mobile ? .8 : 2.9, -.15, -3.18),
  ]), 36, mobile ? .008 : .014, 5, false), [mobile]);
  useEffect(() => () => { interior.dispose(); trace.dispose(); }, [interior, trace]);

  return (
    <>
      <ambientLight intensity={0.65} color="#fff8eb" />
      <directionalLight
        position={[-7, 8, 11]}
        intensity={2.3}
        color="#fffaf1"
        castShadow
        shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.1}
        shadow-camera-far={35}
        shadow-normalBias={0.012}
        shadow-bias={-0.0001}
        shadow-radius={8}
        shadow-blurSamples={12}
      />
      <directionalLight
        position={[1, 4, 16]}
        intensity={0.45}
        color="#eaf2ff"
      />
      <mesh position={[0, 0, -0.04]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <shadowMaterial transparent opacity={0.18} />
      </mesh>
      <group ref={passageGroup}>
        <group ref={sculpture}>
          <group ref={seam}>
            <mesh geometry={interior} position={[0, 0, -.08]} receiveShadow>
              <meshStandardMaterial color="#1b43bd" roughness={.62} metalness={.12} transparent />
            </mesh>
          </group>
          <group ref={unfolded}>
            {/* A bounded architectural recess, with walls and a far plane.
                Leave the instrument's route clear; never stack blue bars over it. */}
            <mesh position={[0, 0, -4.1]} receiveShadow>
              <boxGeometry args={[mobile ? 5.6 : 20, 14, .12]} />
              <meshStandardMaterial color="#143891" roughness={.93} transparent depthWrite={false} />
            </mesh>
            <mesh position={[mobile ? -2.4 : -6.7, 0, -1.65]} rotation={[0, -.32, -.04]} receiveShadow>
              <boxGeometry args={[.20, 11, 4.5]} />
              <meshStandardMaterial color="#163b96" roughness={.72} transparent depthWrite={false} />
            </mesh>
            <mesh position={[mobile ? 2.1 : 6.0, 0, -1.9]} rotation={[0, .22, -.08]} receiveShadow>
              <boxGeometry args={[.30, 12, 4.3]} />
              <meshStandardMaterial color="#1c46b4" roughness={.64} metalness={.08} transparent depthWrite={false} />
            </mesh>
            <mesh position={[0, mobile ? -3.0 : -3.8, -1.8]} rotation={[.06, 0, -.025]} receiveShadow>
              <boxGeometry args={[mobile ? 5 : 14, .14, 4.5]} />
              <meshStandardMaterial color="#15367e" roughness={.78} transparent depthWrite={false} />
            </mesh>
            <mesh geometry={trace}>
              <meshBasicMaterial color="#92b8cd" transparent depthWrite={false} />
            </mesh>
            <mesh position={[mobile ? .80 : 2.9, -.15, -3.17]}>
              <boxGeometry args={[.045, .045, .01]} />
              <meshBasicMaterial color="#ebbb49" transparent depthWrite={false} />
            </mesh>
          </group>
          {composition.pieces.map(piece => {
            const isTop = piece.id === "sweep";
            const isBottom = piece.id === "lower-shell" || piece.id === "fold-under";
            const isEnamel = piece.id === "raised-flap";
            const pivotX = isEnamel ? 1.65 : 0;
            const pivotY = isTop || isBottom ? .78 : 0;
            const ref = isTop ? top : piece.id === "lower-shell" ? bottom : isEnamel ? enamel : piece.id === "metal-lip" ? metal : piece.id === "rubber-join" ? rubber : undefined;
            if (piece.id === "fold-under") return null;
            return (
              <group key={piece.id} name={piece.id} ref={ref} position={[pivotX, pivotY, 0]}>
                <group position={[-pivotX, -pivotY, 0]}>
                  {piece.id === "metal-lip" || piece.id === "rubber-join" ? (
                    <SignatureSurface root={model.scene} name={piece.id === "metal-lip" ? "MetalBracket" : "RubberJoint"} atlas={atlas} textures={textures} />
                  ) : <Surface piece={piece} composition={composition} atlas={atlas} textures={textures} runtime={runtime} />}
                  {piece.id === "lower-shell" && <Surface piece={composition.pieces.find(p => p.id === "fold-under")!} composition={composition} atlas={atlas} textures={textures} runtime={runtime} />}
                </group>
              </group>
            );
          })}
        </group>
      </group>
    </>
  );
}

export function EntranceScene(props: EntranceSceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 24], near: 0.1, far: 60 }}
      frameloop="demand"
      dpr={[1, 1.5]}
      shadows={{ type: VSMShadowMap }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden="true"
    >
      {(props.active !== false || props.passing) && <Field {...props} />}
      {props.runtime && (
        <WorldInstrument
          runtime={props.runtime}
          onInvalidate={props.onInvalidate}
          onReady={props.onHeroReady}
          onLost={props.onLost}
          active={props.active !== false}
          passing={!!props.passing}
        />
      )}
    </Canvas>
  );
}

export default EntranceScene;
