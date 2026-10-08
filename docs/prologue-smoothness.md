# Mouse-look and smoothness pass

Focused continuation: no visual redesign, new scenes, props, game systems, room geometry, shader tiers or portfolio changes.

## Controls and gameplay

Desktop retains free WASD walking and E/click inspection, but uses only deliberate pointer-lock mouse look. Desktop drag-to-look is removed. Escape releases the cursor and pauses translation; click the canvas or Mouse look to resume. Inspection still releases capture and returns the notebook/camera physically. Mobile touch swipes and reduced-motion authored views are retained, not turned into desktop FPS controls. Skip and direct portfolio access remain available if pointer capture is unavailable.

Mouse events now accumulate target angles; the render loop applies frame-rate-independent, short-time-constant smoothing using a reused Euler instead of allocating one for every mouse event. Walking aligns to the rendered look angle rather than jumping to a future target orientation. Acceleration/deceleration are tightened slightly; the existing 1.5 mm body sway now settles back to eye height after stopping. Camera transitions synchronize both rendered and target look angles so returning from inspection does not snap.

## Performance changes

- Compile room materials asynchronously before waking the camera. One hidden warm render uploads buffers/textures and primes cached shadows, including off-camera props. Original frustum-culling flags are then restored. This shifts first-use shader/upload work out of exploration; it does not add ongoing draw calls or reduce material quality. Startup can hold white slightly longer on slower GPUs; the existing bounded failure/skip behavior remains.
- Cache a flat mesh list and reuse the ray intersection array/center vector. Interaction raycasts run at most 30 Hz and skip unchanged observer poses. Camera matrices are updated before casts. Inspection/guide moves invalidate the cache so returning to the same pose still restores the reticle correctly.
- Room debug/measurement DOM attributes update at 10 Hz instead of every rendered frame. Rendering, camera movement and material animation are not throttled to 10 Hz. Frame/render statistics retain the existing 180-frame averaging window.
- Black-hole scroll UI/DOM writes skip unchanged progress; continuous physical disk simulation and rendering continue while visible. Its renderer and resolution tiers are unchanged.

## Plunge and silence

Approach speed now eases continuously from 0.26 progress/s in the distant view to 0.15 near entry, rather than switching abruptly at the text boundary. Damping gradually rises from 125 to 200 ms. The existing slow white-point travel remains approximately 0.045 progress/s and rises gently to 0.07 for whiteout. Existing narrative boundaries and reduced-motion shortcuts remain intact. Scroll time still does not drive disk simulation time.

Black-hole sound fades before progress 0.575. From **0.575 through 0.943**, both cosmic synthesis and media tracks are silent. The interior track is no longer played; no effects or voices accompany the words. White-light/fixture audio can return afterward, and equipment/portfolio sounds retain their existing behavior.

## Validation

`scripts/room-walk-qa.mjs` now uses actual pointer capture and trusted native mouse movement for desktop rather than the removed drag fallback. It waits for short look damping to settle before precise automated aiming. Mobile/reduced paths remain unchanged. `scripts/sound-design-qa.mjs` explicitly asserts zero measured output and no playing media during text/singularity, while still checking room audio and handoffs. These capture the actual browser render/audio graph, not a mocked presentation.

Outputs: `visual-qa/smoothness/` for gameplay; `visual-qa/smoothness/audio/` for sound. Historic comparison: `visual-qa/audio/walk/report.json`. RAF averages under recording load are not GPU FPS or physical-phone performance measurements. Actual phone, Safari and subjective mouse/headphone review remain limitations.

The full production gameplay run passes **24 named checks** with no page/console errors: trusted mouse look, released-cursor movement pause, collision, notebook, recovery, same-DOM monitor handoff, resize, mobile swipe, reduced motion, skip, session bypass, direct URL, no-JS and WebGL failure. Build, TypeScript and lint pass.

| View | Render size | Draw calls | Previous CPU draw / RAF ms | Current CPU draw / RAF ms |
| --- | --- | ---: | --- | --- |
| Desktop | 1440 × 900 | 32 | 2.20 / 19.44 | 1.99 / 19.07 |
| Desktop 1024 | 1024 × 900 | 27 | 1.60 / 16.67 | 1.95 / 16.94 |
| Mobile emulation | 487 × 1055 | 25 | 1.29 / 16.67 | 1.33 / 16.67 |
| Reduced motion | 1440 × 900 | 32 | 1.93 / 18.89 | 1.88 / 19.54 |

There is no uniform measured FPS improvement and no claim of one. These are non-controlled captures; CPU draw submission excludes interaction/update work, where much of the allocation/raycast reduction occurs. Geometry, draw calls and backing resolutions are unchanged. Prewarming keeps one additional existing texture resident in these inspected views (51 desktop / 49 mobile, previously 50 / 48), trading a small eager allocation/startup cost for fewer first-use uploads. No new texture asset is shipped.

The final audio run passes **seven named checks** with no page errors. At text progress 0.7000, measured post-compressor RMS is approximately 1.37 × 10⁻³⁶ (effectively digital silence); at singularity progress 0.8848 it is exactly zero. Both have zero playing media tracks. Room equipment, fluorescent startup, visibility pause/resume and the monitor/portfolio handoff remain audible and functional on desktop and mobile emulation.

Screenshots and five gameplay captures: `visual-qa/smoothness/`. Dedicated sound recordings: `visual-qa/smoothness/audio/recordings/`. The generated galleries support audiovisual human review; automated frame/signal inspection is not a claim of subjective real-time listening.
