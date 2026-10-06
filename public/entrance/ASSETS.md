# Entrance assets — Stage C.5

Only assets with a current purpose are stored here. No full libraries, reference
videos, 4K textures, placeholder models, or environment maps are shipped.

## Downloaded audio: Kenney Impact Sounds 1.0

- Author: Kenney.
- Source: https://kenney.nl/assets/impact-sounds
- Archive: https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip
- License: CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/
- Original license retained at `audio/LICENSE-Kenney.txt`.
- Processing: FFmpeg; trim leading/trailing silence at -45 dB, retain short natural
  tails, convert to mono 22,050 Hz Ogg Vorbis quality 3, limit peaks to -6 dBFS
  without automatic makeup gain. No layering, pitch effects, or cinematic processing.
- Purpose: a compact tactile palette for a later explicitly enabled sound system.
  **None is imported, fetched, decoded, or played by Stage C or C.5.** These are material
  Foley source selections, not evidence that sound is already implemented.

| Original archive filename | Final file | Bytes | Intended use |
| --- | --- | ---: | --- |
| `Audio/impactPlate_light_000.ogg` | `audio/enamel-tick.ogg` | 4,756 | Small rigid plate contact |
| `Audio/impactPlate_heavy_001.ogg` | `audio/enamel-release.ogg` | 5,240 | Plate/structural release body |
| `Audio/impactMetal_light_002.ogg` | `audio/metal-tap.ogg` | 3,955 | Restrained bracket contact |
| `Audio/impactSoft_medium_000.ogg` | `audio/rubber-thud.ogg` | 3,906 | Muted resilient joint contact |
| `Audio/impactGlass_light_001.ogg` | `audio/acrylic-tick.ogg` | 3,900 | Future sparse brittle insert contact |
| `Audio/impactWood_heavy_001.ogg` | `audio/structural-snap.ogg` | 4,118 | Dry structural accent |

Total encoded audio: **25,875 bytes**. Plate recordings are not represented as
dedicated ceramic fracture recordings. Their exact mix and material attribution
must be auditioned in the future sound phase. Paper tear/flutter and ceramic chip
recordings remain unselected; do not substitute unrelated sounds just to fill slots.

## Generated runtime graphics

Original procedural work in this repository; no downloaded texture license needed.
No raster texture files were added. The three-object Blender assets are documented below.

| Runtime texture / geometry | Source | Dimensions / method | Use |
| --- | --- | --- | --- |
| `entrance-paper-normal` | `src/components/entrance/entrance-materials.ts` | Deterministic 128×128 RGBA fiber normal field | Restrained paper surface response |
| `entrance-metal-normal` | Same | Deterministic 128×128 RGBA directional normal field | Brushed bracket response |
| `entrance-enamel-crown` | Same | 128×128 RGBA shallow continuous normal field | Smooth enamel light response |
| Font-ready print atlas | `src/components/entrance/entrance-scene.tsx` | Generated canvas, width ≤2048px | Registered headline on every physical face, including detached fragment |
| Enamel complementary cut | `src/components/entrance/entrance-break.ts` | Two authored polygon boundaries with matching cut edges | One actual thick removable corner |
| Four fracture branches | Same + scene `Stroke` | Four authored line paths with geometry, no crack decals | Hit-region-dependent persistent fracture |
| Cobalt interior | Scene + shared manifest | Continuous setback wall, bounded recessed floor, one brace, and distant Trace | Actual recessed view beneath the fragment |
| Ceramic chips | Scene | Four reused tetrahedra, two visible on mobile | Brief supporting debris, never an idle effect |

## Generated Blender signature assets

Blender **4.5.14 LTS**, installed locally outside this repository. Original
geometry generated here, no downloaded model/texture or mystery binary source.
Three objects only; the entrance scene itself remains authored in DOM/SVG/Three.

- Source: `scripts/blender/build-entrance-break.py`.
- Shared-coordinate bridge: `scripts/blender/export-assembly.mjs`, reading the
  actual TypeScript manifest/cut. Blender never maintains a second set of points.
- Generation: `blender -b --factory-startup --python scripts/blender/build-entrance-break.py`.
- Optional neutral CPU preview: append `-- --preview`; its output is an ignored
  QA image, not a production asset.
- Export: GLB / glTF Y-up, applied small bevels and weighted normals, registered
  face UVs, named nodes, no textures, cameras, lights, animation, Draco, or Meshopt.
- Semantic nodes: `BreakFragment`, `MetalBracket`, `RubberJoint`. Three meshes,
  four primitives, four materials. Fragment origin is the upper loaded attachment;
  bracket and rubber origins are their shared mounting point.
- Runtime: load the responsive file before readiness, clone per-node materials,
  restore the atlas UV orientation on the printed face, share the existing atlas,
  reuse through resets, dispose on scene removal. No Blender runtime dependency.

| Asset | First export with duplicate support slots | Optimized GLB | Gzip estimate | Triangles |
| --- | ---: | ---: | ---: | ---: |
| `models/entrance-break-desktop.glb` | 41,092 B | 37,704 B | 27,314 B | 1,404 |
| `models/entrance-break-mobile.glb` | 38,916 B | 35,656 B | 26,328 B | 1,316 |

Optimization removed duplicate material primitives on the supports; no decoder
was added. Gzip figures are local compression estimates, not measured HTTP
transfer sizes. `models/geometry-report.json` records version, source, and sizes.

Stage C.5 also generates rounded/creased-normal parent geometry and continuous
setback cavity walls in `entrance-scene.tsx` / `entrance-geometry.ts`. No image maps
are downloaded. The paper, metal, and enamel procedural maps above remain shared.

Lighting experiment: a locally generated 128×64 floating-point neutral studio
probe was compared against explicit lights in actual production renders. It
slightly brightened faces but added texture/program resources without a clear
readability gain, so it was removed. No HDRI or environment-map file is shipped.
Comparison images remain in ignored `visual-qa/entrance-stage-c5/`.

## Stage C omissions (historical)

- HDRI: retain the approved broad key/fill lighting and contact shadows. An
  environment download has no demonstrated benefit for this matte assembly.
- Stage C used procedural geometry only. Stage C.5 selectively replaces the
  signature fragment/bracket/restraint; no model of the full entrance is used.
- External texture packs: current micro-detail is generated and shared. Downloaded
  images would add transfer cost without improving the signature break.
- Reference videos: local research only, never copied into public assets.

Future `textures/` or `generated/` folders should be created only when
an actual asset is used and documented here.

## Experience V2 generated geometry / graphics

No new external files were downloaded for the full homepage build. No additional GLB, HDRI, texture pack, or audio file was shipped.

| Resource | Source / generation | Use |
| --- | --- | --- |
| Articulated Reveal Key | `src/components/reveal-instrument.tsx`; original extruded Bézier shapes with a real aperture, bevels, pivot, rubber foot | One shared object from the entrance cavity into the hero |
| Physical build assembly | `src/components/build-scene.tsx`; original small bevelled extrusions, shared authored data and poses | Fifteen material pieces with persistent damage and support response |
| Build print | Same file; twelve generated 512×128 transparent label atlases and three 128×128 support marks | Labels remain attached to moving material faces |
| Authored work / curiosity / collaboration graphics | Their local TSX/SVG components | Project-specific worlds and relationship/perspective responses |

These are original repository-native graphics; they do not embed downloaded component source. The 21st.dev proximity implementation informed a rewrite using cached whole-word bounds and existing browser APIs. Existing Kenney Foley remains unloaded and sound stays off.
