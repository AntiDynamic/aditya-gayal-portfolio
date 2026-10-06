# Stage C.5 — tension, separation, and signature geometry

Reviewed 2026-10-06. Only the existing enamel-corner prototype changes. Later
homepage sections, other materials, sound playback, full passage choreography,
and physics remain outside this pass.

## A. Video critique

Reviewed the newest 84-second screen recording in full and its break frame by
frame, alongside the preserved Stage C controlled study. The old corner exposed
too much of its complete cut on the first hit. Release and flight arrived before
the eye could identify the printed piece. Bright nested blue rims looked more
like graphic polygons than a recess. The crosshair and persistent instructions
also made the experience read as a demo.

The new first hit retains the intact silhouette. Damage persists, the edge
progressively separates, the mounting joint releases, and the printed fragment
has a dedicated readable interval before acceleration.

## B. Blender decision

Blender was initially absent. Following the request to use CLI, installed the
official portable **Blender 4.5.14 LTS** outside the repository and verified
background bpy operation, GLB export, and a neutral CPU Cycles render.

Use is deliberately narrow: small bevels, weighted normals, dense fragment
thickness, a folded metal bracket, and rounded rubber construction benefit from
a reproducible authoring pass. The full scene, paper, parent enamel, layout,
print atlas, cavity, and realtime animation remain in Three.js/DOM/SVG.

## C. Reproducible geometry pipeline

```bash
blender -b --factory-startup --python scripts/blender/build-entrance-break.py
```

Append `-- --preview` for the neutral CPU preview. The bridge
`scripts/blender/export-assembly.mjs` reads the actual TypeScript manifest and
cut, so model authoring does not duplicate runtime coordinates.

Each responsive GLB contains `BreakFragment`, `MetalBracket`, and `RubberJoint`:
three meshes, four primitives, four materials. The fragment has a deliberate
upper attachment pivot and a shared planar print UV field. The bracket has a
mounting pivot and visibly bent free edge. No cameras, lights, animations,
textures, decoder, or Blender runtime are shipped.

| Output | Bytes | Local gzip estimate | Asset triangles |
| --- | ---: | ---: | ---: |
| `entrance-break-desktop.glb` | 37,704 | 27,314 | 1,404 |
| `entrance-break-mobile.glb` | 35,656 | 26,328 | 1,316 |

The final script was rerun successfully. Duplicate support material primitives
were removed from the first export. Gzip sizes are estimates, not measured HTTP
transfer sizes. Source and provenance: [ASSETS.md](../public/entrance/ASSETS.md).

## D. Motion timeline

| Phase | Approximate timing after failure-triggering impact |
| --- | --- |
| Load | 0–120ms |
| Resistance / hesitation | 120–190ms |
| Restraint release | 190–310ms |
| Readable separation | 310–490ms |
| Acceleration / flight | 490–850ms |
| Departure | 850–1,150ms |
| Surrounding follow-through | 700–1,000ms, overlaps flight |
| Fully settled | By 1,250ms |

Paper sags with soft overshoot. Metal has a short sharply damped vibration.
Rubber releases with recoil. Enamel has resisted initial movement and sustained
rotation rather than bouncing. These are authored trajectories, not rigid-body
simulation. Mobile has less lateral travel and fewer chips.

## E. Visual improvements and review

- **Fracture:** faint authored branch on first damage, then a narrow real gap;
  late damage relies on separated geometry and sidewalls rather than a thick
  pasted spiderweb. The cut silhouette has longer facets and one small notch.
- **Fragment:** small bevels and weighted normals make its thickness readable;
  front face and printed letter remain visible before the downwards exit.
- **Typography:** printed UVs stay on the moving mesh. Semantic HTML remains
  complete and accessible. Decorative print may intentionally leave the sculpture.
- **Cavity:** continuous setback wall, dark bounded floor, muted structural brace,
  and one distant Trace hint. Removed an early oversized floor rectangle caught
  in real renders. No sci-fi portal or permanent ambient loop.
- **Shadows:** the separating piece gains a moving cast shadow; contact and
  recessed shadows remain after departure. Shadows explain the existing depth.
- **Camera:** retained the near-frontal editorial orthographic framing. Tiny view
  impulse and a 1.2% final approach are lower on mobile and absent in reduced motion.
- **UI:** removed crosshair and persistent tutorial text. A faint incomplete
  pressure ring contracts on hold. Keyboard focus retains a complete strong ring.
  One proximity cue disappears after the first hit; reset is a labeled 44px icon.

Design review using ui-ux-pro-max: inspect actual T0–T10, desktop/tablet/mobile,
material edges, printed-face ownership, negative space, and final silhouette.
The separation is now distinct from release and flight. The opening is bounded
by the existing sculpture. Mobile preserves the same four-line identity and
reachable seam. No new panels, decorative particles, or visual noise were added.

A tiny locally generated studio probe was A/B tested in production. It modestly
brightened surfaces but increased texture/program resources without a clear
readability benefit. Explicit key/fill lighting remains; no HDRI is shipped.

## F. Engineering review and measurements

React/Next/Tailwind/vercel guidance: retain the server-rendered portfolio, narrow
client gate, responsive lazy scene, imperative transient motion, and shared
semantic store. No per-frame React state, new runtime dependency, Rapier,
postprocessing, or active second canvas.

- Aggregate generated JS gzip: **448,368 → 463,448 bytes**, **+15,080 bytes**.
  Whole-build comparison, not initial-route transfer size.
- Downloaded assets in this pass: **none**. Generated responsive GLBs above;
  no fetched texture packs. Existing 25,875-byte Foley palette remains unloaded.
- Renderer counters including shadow passes: pristine **36 calls**, settled
  **46 calls**. Desktop pristine/settled **3,550 / 4,022 triangles**; mobile
  **3,110 / 3,582 triangles**. These are sampled poses, not peak flight counters.
- Desktop device-DPR-2 check caps at **1.5**; mobile caps at **1.0**.
- One major fragment, four supporting chips desktop / two mobile.
- One shadow-casting key, VSM, 2048 desktop / 1024 mobile shadow map.
- Each tested width and reset completion adds **zero instrumented draws over a
  one-second settled idle check**. No permanent render loop.
- Four reset cycles plateau at **23 geometries / 8 textures / 13 programs** after
  warmup. This is a bounded-resource observation, not a comprehensive heap proof.
- Responsive GLB is prefetched, the print atlas uploaded, and hidden signature
  materials compiled before WebGL readiness. Resets reuse the loaded asset.
- Clone materials and printed-face UV geometry are disposed on removal; shared
  source buffers are cleared when the scene unmounts.
- Production build, TypeScript, lint, and diff whitespace checks pass.

Measurements use headless Chromium software WebGL. No claim of hardware 60fps
or real-phone frame pacing. The videos are controlled-time real renders, not
performance recordings. Existing VSM shadow targets remain the main GPU concern.

## G. UX and accessibility review

Production inspected at **1440, 1024, 768, 390, 320px**.

- Mouse normal click and hold, native touch tap and hold, keyboard Enter and held Space.
- Visible focus; Skip, pressure control, and restore button in keyboard order.
- Reset restores pristine and focuses Skip. Skip/Escape exit; Skip focuses `hero-title`.
- One canvas observed on either side of handoff, never simultaneous active scenes.
- Reduced motion changes fracture/reveal immediately, without flight or camera impulse.
- Forced WebGL failure remains interactive through SVG and reaches the broken state.
- No JavaScript removes the entrance and leaves underlying portfolio non-inert.
- Direct section hashes bypass the entrance. No horizontal overflow or recorded
  uncaught runtime exceptions at reviewed widths.
- No sound, precision aim, hover, or completed destruction is needed to access content.

## H. Before/after and artifacts

Local artifacts are in ignored `visual-qa/entrance-stage-c5/`, never shipped:

- `motion-contact-sheet.jpg` — exact T0–T10 progression.
- `T0-pristine.png` through `T10-settled.png` — individual conceptual moments.
- `destruction-motion-study.mp4` — new controlled study, sound muted.
- `before-after-motion.mp4` — comparable Stage C / C.5 studies side by side.
- `pristine-{1440,1024,768,390,320}.png` and matching `first-*`, `settled-*`.
- `readable-fragment-390.png`, `motion-settled-390.png` — mobile motion comparison.
- `reduced-{first,final}-390.png`, `fallback-{first,final}-390.png`, `no-js-390.png`.
- `explicit-*.png` / `studio-*.png` — rejected environment comparison.
- `blender-neutral.png` — raw signature assembly preview.
- `report.json` — interaction and renderer observations.

Old `visual-qa/entrance-stage-c/destruction-motion-study.mp4` is preserved.

## I. Remaining weaknesses and next decision

The enamel fracture remains stylized and deliberately authored. It is not a
natural ceramic fracture solver. The mobile fragment is narrower, so its printed
portion is less prominent than desktop; edge and shadow carry more of its
readability. The surviving printed composition intentionally loses part of a
letter while semantic text stays intact. In software rendering some shadow
edges remain harder than a photographed studio reference.

The distant cavity signal is a first Trace hint, not an actual HTML portal.
No full entry choreography, audio playback, collision settling, material-wide
destruction, adaptive quality, or global canvas has been added. Real-device
input/frame-time validation remains necessary before treating this as final.

Future renderer recommendation remains **hybrid**: investigate sharing entrance
and hero rendering for the approved passage when needed, while keeping personal
sections DOM/SVG and later scenes isolated. Do not refactor now.

Stop here. Review the muted side-by-side motion and mobile study before deciding
whether this one break warrants scaling.
