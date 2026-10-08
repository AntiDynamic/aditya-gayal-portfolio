# White light / work room

Current behavior and QA are documented in the [final polish report](prologue-lock.md). Desktop is freely walkable; mobile and reduced motion use authored viewpoints. Earlier implementation notes below are historical.

## Implemented experience

The existing black-hole renderer and scroll narrative lead to the same white point. At full white, the renderer hands over to a lazily preloaded room in the same route. White holds, a fluorescent tube starts imperfectly, exposure settles, and the camera is revealed lying on the floor beneath it. The camera regains an upright position. There is no portal architecture or room biography.

The room is a 6.4 × 5.6 × 3.15m workspace: a desk against the far wall, two differently angled chairs, a muted daylight window on the left, a shelf on the right, a cabinet near the door, and a corrected drawing above the desk. Standing eye height is 1.65m. The desk surface is approximately 0.77m high. The empty floor provides readable movement space rather than another facility to explore.

The fluorescent light is neutral, the window is overcast, and the desk lamp starts off. Inspecting the notebook restores the warm desk light. Recovering the computer brings back its fan and soft monitor light. These are environmental responses, not a displayed objective chain. Recovery does not require collecting three objects: an impatient visitor can go directly to the computer or skip.

## Discoveries

- **Notebook:** a physically stationary open binder, original handwritten-looking notes, crossed arrows, failed attempts, blank areas and two readable pages. Mobile can switch the framed page. Copy is ordinary rather than a polished manifesto.
- **Corrected drawing:** a black route, another person's cyan correction, and small “this?” / “yeah” annotations. A second chair reinforces the inference without a collaboration label.
- **Computer:** ordinary damaged-file recovery followed by the five real project names from the existing project data: Continuum, TracePilot, NetraNagar, AI Video Editor and AI4Browser. No invented last-opened dates or project-card exhibit.
- **Optional shelf:** cream city/street model and dock, layered timeline mechanism, stacked window planes and printed frame strip. They foreshadow projects without explaining them.
- **Optional drawer:** a sliding tray with uneven cable bundles, plugs, and a sparse handwritten label. A pen, screwdriver, drink ring, worn furniture and extension cable are related to the desk rather than evenly distributed decorative clutter.

## Controls and architecture

Selection regression fix: desktop viewpoint buttons retained focus, and the renderer previously ignored all key events from buttons. This blocked E inspection and WASD immediately after selecting Shelf or another viewpoint. Game keys now work from those controls, while Enter/Space, control-arrow navigation, editable fields and modified browser shortcuts remain native. Already-handled inspection events are ignored so E closes once instead of reopening. `scripts/room-selection-qa.mjs` reproduces this without manually focusing the canvas; the main QA helper no longer hides the bug with a forced canvas focus.

`ExperienceGate` owns eligibility, the black-hole bridge, room lifecycle, session completion and final portfolio release. The existing portfolio remains server-rendered and is passed as a child rather than rebuilt as a game UI. Its animation/rendering stays paused until the monitor approach.

The room is an imperative Three.js scene, loaded on demand. No game engine, CPU physics simulation, per-frame React state or extra postprocessing dependency is introduced. Camera/velocity/interaction state lives in refs and scene objects; React updates only for useful UI changes. First-person movement uses damped velocity, axis-separated collision against simple authored bounds, and a centre ray for nearby objects. Camera transitions use smooth easing. The black hole is not kept rendering behind the room.

Desktop deliberately starts with **Enter room**. WASD moves, mouse look uses pointer lock, E/click inspects and Esc releases/returns. Drag look remains available when pointer lock cannot be acquired. Inspection changes framing around the real object; it is not an inventory screen. Keyboard-accessible authored viewpoints and readable transcripts offer an alternative to precise aiming.

Mobile uses swipe/scroll/tap through desk, notebook, shelf, drawing and computer viewpoints, with **Look closer** and Back. It has no virtual dual sticks. Pinch zoom is not repurposed as navigation. Reduced motion uses a short light reveal and static authored viewpoints with small fades instead of forced camera travel and startup flicker.

The physical computer screen supports raycast/UV clicks for recovery and opening; semantic DOM buttons are the keyboard equivalent. During the final approach, CSS3DRenderer places the actual portfolio DOM inside the monitor. The portfolio begins rendering before the camera finishes its move, so its original graphics do not appear only after release. The same DOM is synchronously restored to its persistent React-owned holder at completion; pointer lock, inert and scroll locks are removed. No screenshot substitute, route navigation or duplicate website is used.

## Lifecycle and accessibility

- Skip prologue remains available during wake, exploration, inspection and monitor approach.
- A completed session goes directly to the normal website. Replay clears completion intentionally.
- Direct section hashes and `?portfolio` bypass both experiences. No JavaScript exposes the original server-rendered portfolio.
- WebGL creation failure or a room asset-load timeout falls back to the portfolio rather than trapping the visitor.
- Hidden documents stop the room RAF and suspend its optional audio; resume resets frame timing. Unmount disposes owned GPU resources, controls, listeners, audio and the rendering context.
- Sound defaults on after browser-permitted activation, without an enable button. The room uses quiet original environmental synthesis, not music or third-party sound. Existing soundtrack playback pauses during the room.
- Inspection offers semantic transcripts, focus management, Back/E/Esc and functional recovery announcements. It does not pretend pointer-lock exploration is the only accessible route.

## Assets, authoring and lighting

See [asset sources](asset-sources.md) for creators, URLs, licenses, original/optimized sizes and rebuild commands. Seven CC0 Poly Haven model bases are used; two CC0 material sources supply four maps. Caveat is locally hosted under SIL OFL 1.1 with its complete notice. No game reference assets or AI-generated environment imagery is used.

Blender scripts normalize and simplify downloaded props, join materials, remove unused hierarchy and reduce textures. Custom Blender work covers the beveled room shell, fixture, trim, cabinet and project artifacts. Runtime custom geometry covers interaction-specific electronics, keyboard, pages and small human desk details.

Source models shrink from 16,689,753 to 2,116,944 bytes and from 130,035 to 32,975 triangles. Scene assets including custom shell, material maps and handwriting font total 2,908,116 bytes, excluding application JavaScript and tiny manifests. Background maps are 512px; notebook art is 1536 × 1024; monitor art is 1024 × 640. Secondary labels are downsampled. Download-compressed JPEG/WebP textures are not GPU-compressed KTX2 textures.

Lighting is a hemisphere/overcast fill, neutral fixture, warm lamp and restrained monitor spill. There is one cached 1024px sunlight shadow map on desktop, inexpensive contact decals, and no realtime GI. Mobile disables dynamic shadows and MSAA. This is not a fully baked lightmapped room; richer baked indirect/contact lighting remains an improvement opportunity.

## Production validation

Commands:

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm start
QA_URL=http://localhost:3000 node scripts/room-walk-qa.mjs
node scripts/room-walk-review.mjs
```

Build/dev use Webpack explicitly because this environment's Turbopack PostCSS subprocess repeatedly fails its port binding with `Operation not permitted`. Production Webpack compilation, type checking and static page generation succeed; this is a build-tool choice, not a replacement of the renderer.

The QA script covers 1440 × 900, 1024 × 900 and touch-emulated 390 × 844 at DPR 3. It captures the white point, fluorescent/floor reveal, standing room, desk, notebook, powered lamp, shelf, corrected drawing, drawer, inactive/active computer, monitor approach and final website. It exercises physical E inspection, monitor UV clicks, deliberate pointer lock, movement/collision, Escape, mobile guided navigation, session replay/bypass, direct section links, skip, reduced motion, WebGL failure and no-JS. Visibility pause/resume is tested with an injected hidden-document event, not a claim of an actual background-tab recording.

Exact results, errors and measured renderer counters are saved to `visual-qa/room/final/qa-report.json`. Screenshots and recordings are local review artifacts, not deployment assets. The review helper produces:

- `visual-qa/room/final/index.html`: screenshot/video gallery.
- `visual-qa/room/final/recordings/prologue-desktop.mp4`.
- `visual-qa/room/final/recordings/prologue-mobile.mp4`.
- `visual-qa/room/final/review/`: one-frame-per-second contact sheets covering the recordings.

The review helper also extracts five-frame-per-second handoff contact sheets. Black padding tiles at the end of a contact sheet are unused tile positions, not black frames inserted into the recording. A local gallery server is available at `http://localhost:3002/` while this review session is running.

Recordings are silent browser captures. Their capture frame rate is not renderer FPS. Frame interval diagnostics measure RAF cadence; CPU draw timing measures submission, not GPU completion. Emulated mobile on a desktop GPU does not establish real-phone thermal/performance behavior. There is no comparable pre-existing room baseline, so a before/after room FPS claim would be fabricated.

### Measured production results — 7 October 2026

The main suite passes **19 checks**, with zero page exceptions and zero unexpected console errors. The deliberately disabled WebGL case emits expected context-creation errors, then exposes the usable portfolio fallback. Measurements use Chromium/ANGLE on Mesa Intel Iris Xe (TGL GT2):

The additional edge suite passes four checks: skip, resize and section-hash navigation during the monitor approach, plus intentional Replay after completion. Optional room audio activation is exercised there. Frame-by-frame recording review also caught an old identity fallback flashing before the black-hole shader initialized; bridge-only CSS now hides that unused coda immediately, including before effects run. Standalone non-bridge behavior is preserved.

Dense handoff review caught a second integration issue: React Three Fiber measured the CSS3D-transformed canvas bounds, shrinking its logical viewport and switching desktop composition to the mobile tier inside the monitor. The existing portfolio canvas now measures untransformed `offsetSize`. QA asserts its backing resolution remains identical through handoff. This is a one-prop integration correction, not a redesign of that scene.

| View | Render resolution | Draw calls | Triangles | Textures | Mean RAF interval | Mean CPU submission |
|---|---|---:|---:|---:|---:|---:|
| 1440 standing, no recording | 1440 × 900 | 56 | 40,059 | 30 | 16.67ms | 1.75ms |
| 1440 computer, recording | 1440 × 900 | 24 | 23,830 | 39 | 16.85ms | 1.39ms |
| 1024 computer, no recording | 1024 × 900 | 20 | 13,688 | 39 | 16.76ms | 1.23ms |
| 390 touch emulation, DPR 3, recording | 487 × 1055 | 20 | 15,986 | 36 | 16.67ms | 0.94ms |

These are short, single-machine samples, not minimum-frame guarantees or GPU timings. The final suite runs serially; the separate standing sample runs without recording. Mobile render resolution is deliberately capped independently of device DPR. Desktop has a 1.5-million-pixel budget; mobile/guided has a 600,000-pixel budget and DPR cap 1.25. Frustum culling explains the different view-dependent geometry/draw counts. Recovery disposes replaced monitor maps rather than accumulating them.

## Critical limitations / next improvements

The room is a functional authored place, but it does not yet have the material richness of the cited games or a large specialist team's environment work. The custom monitor/cabinet/artifacts are visibly simpler than the sourced furniture. Shelf textures are soft at inspection distance. Several prop positions have causal intent, but not every surface has bespoke wear: fingerprints, rewritten labels and layered repairs could be stronger without blanketing the room in grunge.

There is no simulated rain, distant future city, articulated standing body, door exploration or elaborate optional soundscape. These are deliberate scope limits, not completed features. Drawer animation and power restoration are lightweight authored responses, not physics or electrical simulation.

Three.js CSS3DRenderer officially supports 100% browser/display zoom. The final monitor-to-DOM approach needs broader real-browser/zoom testing, particularly mobile Safari; a mid-transition resize safely finishes the handoff rather than continuing a misaligned transform. Large DOM/browser-compositing work briefly overlaps the scene during that approach and deserves real-phone profiling.

The videos can be decoded and visually reviewed through contact sheets in this environment, but actual realtime human playback and real-device usability/performance remain review steps. Do not equate passing automation with final cinematic approval. First improvements should be baked contact/indirect lighting, a sharper hero shelf atlas and more convincing monitor/cabinet construction, followed by real iOS/Android handoff measurements—not additional narrative scenes or a portfolio redesign.

Final dense handoff frames show that the viewport-size pop at release is fixed. They also show the existing portfolio's static illustration changing to its loaded 3D world while still inside the monitor; cold/slow connections could make that activation more obvious. Prewarming that existing scene's asset/parser pipeline is a sensible next integration refinement. The QA video deliberately reloads the completed session after handoff to test bypass; the later website re-entry animation in the recording is that test navigation, not a second room transition.

## Local review links

- Full sequence: `http://localhost:3000/?replay=1&motion=full`.
- Room directly: `http://localhost:3000/?room=1`.
- Existing portfolio directly: `http://localhost:3000/#work`.
