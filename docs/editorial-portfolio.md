# Editorial portfolio

Current continuity improvements and critique: [editorial elevation](editorial-elevation.md) and [editorial depth](editorial-depth.md).

## Direction implemented

Cream, charcoal, deep red; oversized real typography, two approved photographs and three replaceable work entries. No sculpture, ribbon, ring or new narrative world. The sequence is Hero → About → Selected Work → personal photograph → Lately → Contact. The existing black hole, room rendering and audio were not redesigned.

## Motion architecture

`MotionDirector` owns the only animation callback for the actual portfolio: advance Lenis → snapshot scroll and spring pointer → read dirty rectangles → write typography/reveal transforms → update media and red rule → render Three.js. No frame-driven React state. Lenis is manual-RAF; mobile touch remains native. Anchors preserve real hashes/history and focus while requesting smooth target motion.

`RectSampler` uses ResizeObserver, cached document coordinates and shared scroll subtraction, not five independent layout-reading loops. Fonts and responsive source changes invalidate the necessary measurements. Reveal offsets are removed when measuring transformed ancestors.

`WebGLBridge` uses one transparent, non-interactive canvas and one pixel-unit perspective camera. DOM owns dimensions, links and alt text. Each image has a shared subdivided plane, one texture and a small original shader. Ready images enter spatial depth, edge deformation and a directional hover sheen; settled media return to native DOM. Portrait centers stay stable. Texture decode failure leaves the native image visible. Loss of the WebGL context restores DOM immediately; restoration rebuilds textures.

Typography uses the actual DOM font with staggered masks and CSS perspective; there is no mismatched rasterized font twin. Foreground/back typography layers straddle the canvas. This is selective spatial treatment, not a claim that every letter is a WebGL mesh.

The red rule interpolates length, angle and destination between actual layout anchors. It becomes a photograph edge, project rule and final underline. It does not become a wandering spline. Idle/hidden animation sleeps; input, image decode, resize and scroll wake the director.

## Prologue integration

The existing monitor physically contains the actual DOM page. While that surface is in takeover mode, the portfolio director does not measure or render the viewport canvas or advance Lenis. At completion, the existing gate removes the monitor transform and dispatches resize. The director samples the real page, preserves the already-visible typography, and enables normal scrolling. Only the preloaded module target in `experience-gate.tsx` changed; the room scene and camera remain intact.

## Media and licenses

Only WhatsApp photographs 3 and 4 were added. Four optimized responsive WebPs total 461,958 bytes. No retouching or fabricated portraits. Work media total 244,280 bytes: two actual UI captures and one explicitly labelled original rendering of real Continuum CLI documentation. Source/license caveats are in the shipped JSON manifests and `animation-references.md`.

Regenerate personal images with `node scripts/assets/personal-photos.mjs`. For work capture, serve the NetraNagar repository's published `dist` on 3011 and TracePilot's `scripts/tracepilot-workbench` on 3012, then run `node scripts/assets/project-media.mjs`. Override `NETRANAGAR_URL` / `TRACEPILOT_URL` for other local hosts. Browser capture retains offline/unavailable data instead of fabricating successful backend results.

## Mobile, reduced motion and accessibility

390px has authored one-column layouts, smaller type, reduced depth, fewer plane subdivisions and a 1.25 DPR cap. Desktop cap is 1.5; sustained slow frames reduce it to a minimum of 0.8. Hover is never necessary for content. Reduced motion removes perspective/velocity/pointer changes and staggered entrances. Native media, semantic headings, repository links, contact, direct anchors and keyboard focus remain without JavaScript or WebGL. No canvas captures pointer input.

## QA and limitations

Production build and lint pass. Full 1440/1024/390/reduced-motion recordings pass content, anchors, overflow, context recovery and no-JS checks. Existing desktop and mobile prologue regressions also pass: notebook/recovery, physical monitor takeover, cursor release, normal scroll restoration, completed-session bypass, skip, direct links and WebGL-failure fallback.

### Measured frame intervals

Headless Chromium on this workstation, during scripted full-page scroll:

| Viewport | Render resolution | Median | p95 |
| --- | --- | --- | --- |
| 1440 × 1000 | 1440 × 1000, DPR 1 | 16.7 ms | 16.8 ms |
| 1024 × 800 | 1024 × 800, DPR 1 | 16.7 ms | 16.8 ms |
| 390 × 844, emulated DPR 3 | 487 × 1055, capped DPR 1.25 | 16.7 ms | 16.8 ms |
| Reduced motion, 1440 × 1000 | 1440 × 1000 | 16.7 ms | 16.8 ms |

An additional isolated desktop scroll run samples 366 frames: median 16.7 ms, p95 16.8 ms, three intervals above 33.4 ms. Observed maximum: **3 draw calls / 2,304 triangles**; five textures loaded, no steady-scroll layout reads. Resting media return to DOM; the renderer then sleeps. See `visual-qa/editorial/performance/report.json`.

The preceding mechanism QA recorded 37 draw calls / 61,258 triangles, median 16.7 ms and desktop p95 33.4 ms. That baseline used a different scene and capture setup; it is not an apples-to-apples FPS gain claim. No isolated GPU-load or physical-phone measurement was available.

`scripts/editorial-qa.mjs` records 1440, 1024, 390 and reduced-motion runs; checks one canvas, approved image decoding, overflow, anchors, context loss/recovery and no-JS content. Screenshots and recordings are in `visual-qa/editorial/`. Measurements are browser frame intervals, not isolated GPU timings or physical-mobile-device claims. Room integration uses the existing regression runner.

- There is no depth-segmented portrait; that avoids cardboard cutouts and keeps the real photographs intact.
- Continuum has documentation media, not an invented application screenshot. TracePilot is offline; richer real project captures would improve Work.
- This first production implementation is restrained spatial editorial motion, not a literal reproduction of reference-site visual effects.
- Native touch can be composited independently of main-thread WebGL on physical devices; desktop-emulated mobile tests do not prove every phone's frame pacing.
- Shader color/decode continuity and camera alignment were visually checked, but broader Safari and physical-device testing remains necessary.
- No new soundscape was added: the existing optional prologue sound remains untouched; the page does not need music to function.
