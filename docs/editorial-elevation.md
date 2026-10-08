# Editorial elevation — fluid continuity

This pass retains the existing cream/charcoal/red layout, photography, copy, work data, navigation and ending. It does not modify the black-hole or room renderer, add assets, install dependencies or introduce a new visual concept.

## What changed

- Hero motion now moves coherent word groups into perspective, holds, then returns them to their original plane before About. Removed the alternating per-letter depth that made it look fragmented. Entrances use a faster editorial cadence; spatial movement follows a separate scroll envelope.
- The primary photograph reveals horizontally from a red edge. Its first heading line selectively moves behind the projected photograph; the other lines stay in front. The original semantic text and font remain intact.
- A pooled `MediaFlow` surface carries Photo A into the first project, each project into the next, and the last project into Photo B. Layout rectangles interpolate in document space, with current-frame scroll subtracted once. Aspect-correct UVs prevent portrait stretching. A moving red seam changes the actual content, rather than decorating an independent transition.
- The same geometry gains shallow depth and restrained tension during travel, then aligns with the destination's actual depth, angle, pointer state and edge deformation. Reverse scrolling reverses the same handoff. No pinned carousel or duplicate scene clock.
- Foreground typography and project metadata have cream paper-like knockout regions. These are necessary to prevent dark imagery crossing behind dark text; they do not change the static layout or introduce card UI.
- Project planes have slightly stronger depth and faster hover settling. Photo B has much slower settling, less depth and no velocity warp/hover response. The ending still settles into flat DOM and a red underline.
- Handoffs only arm when both images are ready before the transition starts. If a destination arrives late, native media remain instead of popping into a partially completed transition. The first project image is prioritized: its optimized asset is only 22 KB.
- Short mobile media have non-overlapping handoff windows and a brief flat interval between sheets. Invisible image hit areas pause during transport; visible repository links remain usable and keyboard access is retained.
- Context loss clears traveling surfaces and text clipping, restoring the native page. Reduced motion disables both transport and occlusion; mobile reduces depth, tilt and tension and keeps all content native and accessible.

## Implementation

`MediaFlow` reuses the shared plane geometry and already-loaded image textures. The material performs the second texture fetch only during a content handoff. The red seam is part of the same fragment shader, not an extra transparent draw layer. No new texture assets or framebuffer passes.

The existing director remains the only RAF owner. Lenis advances first, then the shared rectangle snapshot, DOM motion, regular media, handoff surface, red rule and render. ResizeObserver/cache tracking remains intact. The occlusion cut uses projected mesh bounds without measuring DOM per frame. The canvas remains pointer-transparent; all actual links stay semantic DOM.

## QA

Production lint/build pass. The flow regression checks all four handoffs forward and backward at 1440, 1024 and 390, including flat release intervals and reduced-motion switching. Full-page QA passes semantic content, hashes, image decode, overflow, context recovery and no-JS access.

The final production room regression also passes notebook/recovery, physical monitor takeover, session bypass, skip, direct links, no-JS and WebGL failure. The room scene and black-hole source were not edited during this elevation pass. Evidence: `visual-qa/elevation/room/report.json`.

Measured full-page scroll on this workstation: desktop median **16.7 ms**, p95 **16.8 ms**, observed maximum **3 draw calls / 2,304 triangles**. Mobile emulation: same rounded median/p95, **3 draw calls / 770 triangles**, render resolution **487 × 1055** (390 × 844 viewport, DPR capped at 1.25). Desktop render resolution **1440 × 1000** at device DPR 1. Five textures loaded; steady-scroll layout reads remain zero.

Final reduced-motion regression uses native photos and rules: **zero WebGL draw calls, triangles and uploaded textures**, median/p95 16.7 ms across 364 sampled browser frames. Report: `visual-qa/elevation/reduced-native/report.json`. This describes this workstation's browser capture, not a mobile-device performance guarantee.

The prior isolated desktop run also measured 16.7/16.8 ms. This run records five intervals above 33.4 ms across 354 sampled frames versus three across 366 previously. Those capture workloads are not identical; the data does not establish an FPS gain or absence of all hitching. No isolated GPU-load or physical-phone VRAM measurement is claimed. Texture assets and mipmap policy are unchanged; transport reuses loaded textures rather than allocating another image set. Reduced motion now returns all media and red rules to native DOM, avoiding pointless image mirroring.

- `scripts/elevation-flow-qa.mjs`: transition start/middle/end, reverse motion, release, and reduced-motion switching at 1440, 1024 and 390.
- `scripts/editorial-qa.mjs`: full-page capture, hover, hashes, no-JS, overflow, context recovery and sampled frame pacing.
- Evidence: `visual-qa/elevation/flow/` and `visual-qa/elevation/full/`.
- Full-page recording: `visual-qa/elevation/full/recordings/desktop.mp4`. Targeted transition recordings: `visual-qa/elevation/flow/1440.webm`, `1024.webm`, `390.webm`.

## Critical assessment

- Work is more connected, but its project metadata remains deliberately conventional. The actual TracePilot capture is still offline and Continuum remains a labelled documentation plate; new real imagery would help more than another shader.
- About-to-Work is the boldest and weakest handoff: the portrait changes aspect while moving across the title. Crop is preserved rather than stretched, but the temporary split image can feel collage-like. The paper knockouts keep it readable; those would be the first things to simplify if this feels excessive.
- About occlusion uses the planar mesh's projected bounds, not subject segmentation. It is a picture-plane layering effect, not a cut-out person. Velocity-bent edges can differ by a few pixels from the planar mask; distortion remains restrained.
- Desktop wheel synchronization has one frame owner. Native touch compositor/main-thread differences can still occur on physical phones; emulated mobile is not proof of perfect iOS behavior.
- Hover remains a subtle material/shear response, not a reveal of a second real project view. No secondary views were fabricated.
- Lately remains a quiet list. Adding more fluidity there would dilute the rest/ending rather than strengthen it.
- If simplifying, remove photo-to-project texture morphing first; retain project-to-project handoffs and the slow personal reset. Do not add more objects or camera motion.
