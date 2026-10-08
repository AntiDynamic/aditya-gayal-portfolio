# Window, walking-only controls and monitor handoff fixes

Historical fix report. The [final polish report](prologue-lock.md) supersedes the mobile/reduced-motion controls and QA output paths below. Desktop remains freely walkable; mobile and reduced motion now use deliberate authored views, as requested in the final-pass brief.

This supersedes the guided-mode controls and finite window backplate in the preceding refinement. It is a bug-fix pass, not a room/portfolio/black-hole redesign.

## Window

The previous cropped photograph was mapped onto a finite box behind the window. Looking down or approaching its edge exposed its bounds. The box is removed. The complete source 360-degree photograph is now a Three.js equirectangular scene background, aligned toward the bay. It has no finite edge, clipping plane or rectangular bottom to reveal. Window frame, sill and glazing remain physical geometry in front of it.

The same Philip Modin / Poly Haven CC0 source remains checksum-verified. `scripts/assets/room-exterior.mjs` now exports the full 2048 × 1024 panorama rather than a crop. The WebP is **102,980 bytes** instead of 36,388; total scene assets become **3,327,264 bytes**, up 66,592 bytes from the previous build. It is still a static photographic environment, not actual external geometry/parallax or HDR lighting. Three.js performs the background's one-time equirectangular conversion; no new reflection lighting or postprocessing pass is added.

## Walking is the only exploration mode

Removed guided/free mode selectors, desktop viewpoint menu and mobile authored-viewpoint navigation. Desktop uses WASD/mouse look, or drag look after Escape, with E to inspect. Pointer lock starts only after Enter room or Resume mouse look.

Mobile now also moves freely: drag the actual view to look, hold one **Walk** button to move forward, and aim at an object to inspect it. Turning allows movement in any direction. There are no dual sticks, inventory or quest UI. Touch movement uses the same damped velocity/collision as desktop and stops on release/cancel/lost capture/blur. Rendering remains in the cheaper touch quality tier; that no longer disables keyboard movement or ray interaction.

Reduced motion still reduces wake/inspection travel and body sway but does not replace walking with guided mode. Keyboard E/Back/Esc, object transcripts, skip, no-JS and WebGL fallbacks remain.

## Monitor handoff

Two paths could bypass the approach: any viewport resize called completion immediately, and reduced motion previously opened the website immediately. Neither is evidence that the physical-screen integration itself had been deleted, but both made it disappear for visitors.

Normal motion keeps the physical terminal → actual portfolio DOM crossfade and 3.4-second monitor approach. Resizing now updates the CSS3D viewport, same DOM dimensions, physical-screen scale and camera's remaining destination; it does not complete the room. The approach continues from the current pose with its remaining duration, avoiding a position jump. Skip/direct section navigation may still intentionally exit.

Reduced motion waits for the website readiness and uses an approximately 0.9-second same-DOM fade without forced zoom, instead of immediately cutting. Pointer lock and room controls end only on completion. There is no new route or duplicated portfolio.

## Validation

Production TypeScript, ESLint and Webpack build pass. The authoritative current regression command is:

```sh
QA_URL=http://localhost:3000 node scripts/room-walk-qa.mjs
node scripts/room-walk-review.mjs
```

The older guided-mode QA helpers document previous builds and assume controls that are intentionally removed; they are not claimed as passing against this walking-only UI.

The current suite passes **18 named checks**, with no page errors: free walking/collision, actual touch hold-to-walk, physically aiming at and inspecting the notebook/computer, file recovery, same-DOM monitor transition, resize during the approach, reduced-motion handoff, completed-session bypass, skip, direct link, no-JS and WebGL failure. Tests drive actual movement/aiming, not authored viewpoint buttons or injected camera teleports. It also asserts no guided buttons or viewpoint menus remain.

- Screenshots: `visual-qa/room/walking/`, including window-level/down/up views and desktop/mobile/resized/reduced handoffs.
- Recordings: `visual-qa/room/walking/recordings/desktop.mp4`, `resize.mp4`, `mobile.mp4`, `reduced.mp4`.
- Report: `visual-qa/room/walking/report.json`.
- Gallery: `visual-qa/room/walking/index.html`; preview served at `http://localhost:3002/`.
- Whole-recording review sheets: `visual-qa/room/walking/review/`, sampled at two frames per second. This is not claimed human real-time playback.

With capture active on Intel Iris Xe Chromium/ANGLE: computer view 1440 × 900 has 32 calls, 25,770 triangles, 2.13ms mean CPU submission and 16.85ms mean RAF interval; 1024 × 900 has 27 calls, 15,530 triangles, 1.59ms CPU and 16.85ms RAF; touch emulation renders 487 × 1055 with 25 calls, 15,338 triangles, 1.02ms CPU and 16.67ms RAF. These are single-run CPU/RAF measurements, not GPU time, phone performance or an FPS claim.

## Limitations

The panorama removes the visible box but cannot supply true outside depth or translation parallax. Close external detail is soft. The resize regression emulates viewport changes; actual Chrome fullscreen UI and Safari/iOS still need hardware/browser review. Mobile's single-button forward movement is simpler than a game controller and should be judged on a real touchscreen. The room's earlier material/prop-quality limitations remain; this pass does not claim a photoreal environment.
