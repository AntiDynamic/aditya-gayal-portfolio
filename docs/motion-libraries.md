# Motion refinement — GSAP, Lenis and Vanta

## Visible changes

- The single enamel break now has a GSAP timeline: load, resistance, restraint release, readable outward separation, accelerating flight and departure. The front face moves left into cleaner space before dropping, exposing thickness and its registered print. Paper sags farther, the metal bracket rotates, rubber recoils, and the enamel body redistributes its load.
- Pointer presence has greater restrained depth. Removed competing transform writers on the metal/rubber joint.
- The cavity is deeper: continuous sidewalls extend from approximately 1.15 to 2.65 scene units, with a dark recess, staggered angled cobalt structure, a small distant Trace and the Reveal Key inside.
- The entrance-to-hero passage uses GSAP over 1.35 seconds, foreground rotation/enlargement, a lateral camera arc and a 24% camera depth change. Skip remains available and gains a dark backing during passage.
- The curiosity field has a clipped Vanta WAVES surface. Selecting an authored pairing changes its color, height and speed through GSAP. A container ResizeObserver keeps the surface aligned when mobile connection content changes height. Broad lights reveal the folds; the default legacy point-light intensity was visually ineffective with current Three.js. Duplicate in-field note copy was removed where it overlapped topic labels; the readable note stays below the field.
- Lenis begins after entry and smooths wheel input with lerp 0.085. Touch remains native. Native anchors/history/focus stay intact, and anchor intent clears pending wheel inertia.
- Reveal Key initialization depends on a stable shared-world flag rather than the changing world context object, preventing ready-state changes from cancelling its introduction.

## Dependencies and boundaries

| Library | Installed version | Responsibility | Lifecycle |
| --- | --- | --- | --- |
| GSAP | 3.15.0 | Numeric structural choreography, passage, curiosity material transition | Local timelines killed on reset/unmount; break timeline pauses when hidden |
| Lenis | 1.3.26 | Wheel response after entrance | Lazy import; destroyed for reduced motion; RAF suspended when hidden |
| Vanta | 0.5.24, pinned | One folded curiosity surface | Lazy import only in view; freeze after a short response; destroyed offscreen/hidden/reduced motion |

Three.js 0.186.1 is explicitly supplied to Vanta. No second Three version, physics engine, postprocessing package, animation framework wrapper, model, audio sample, HDRI or texture was added. The existing Blender-authored signature assembly and generated print atlases remain.

Vanta has no public pause API. The version-specific adapter cancels its `req` RAF handle after 3.4 seconds without input/transition updates, then resumes the existing effect on interaction. On destruction it also explicitly disposes the renderer and releases its context, which upstream `destroy()` omits. Keep this adapter encapsulated and recheck it when upgrading. Context loss leaves the static SVG available until reload.

GSAP uses elapsed time without lag recovery for this portfolio. The first software-rendered check exposed artificially stretched events when a render stalled; disabling ticker lag smoothing prevents a brief passage becoming several seconds. This is not a hardware FPS claim.

## Rendering and performance

- Aggregate JavaScript gzip before this pass: **468,229 bytes**. After: **510,588 bytes**, approximately **42.4 KB / 41.4 KiB growth** across all generated JavaScript chunks. This is not the initial-route network payload or a Core Web Vitals measurement.
- GSAP dedicated chunk: approximately 27.6 KB gzip. Vanta effect: approximately 3.9 KB gzip. Lenis has a separate lazy chunk of approximately 5.5 KB gzip. Shared application chunks account for the remaining difference.
- Vanta's stock 100×80 subdivisions are replaced with 40×32 desktop (2,560 triangles) or 28×22 mobile (1,232 triangles), preserving dimensions and its deformation/camera mechanism. No shadows or postprocessing on this surface.
- Vanta DPR cap: 1.25 desktop / 1 mobile. Entrance DPR remains at most 1.5 desktop / 1 mobile; shadow maps remain 2048 / 1024.
- One major detachable fragment; supporting chips remain bounded at four desktop / two mobile.
- Sampled settled entrance renderer: 55 calls, 9,810 triangles, 32 geometries, 8 textures and 13 programs at DPR 1. Counters include shadow work and are specific to the sampled pose, not a universal scene total.
- Settled draw instrumentation reports zero additional draws for the entrance and frozen curiosity surface. Offscreen curiosity has no Vanta canvas or active renderer. Lenis still has a lightweight visible-document RAF; it does not invalidate the Three scenes.
- Headless Chromium uses software rendering here. Captured video frame rate reflects that capture environment; native device frame pacing and Core Web Vitals still need hardware measurements.

## Input verification

- Native mouse click: stress; 550ms hold: fractured; another hold: detached.
- Native timestamp-controlled 30ms touch tap: stress, with one synthesized click (`detail: 1`); no duplicate impact. An initial untimestamped software-rendered input acquired enough latency to count as a hold, so it was rechecked with explicit browser event times.
- Two reset/failure cycles at desktop and mobile restored pristine state.
- Lenis wheel sample progressed from scrollY 97 to 417, rather than immediately jumping. Navigation during wheel inertia reached `#work`, with its heading visible below the fixed header.
- Native touch scrolling moved scrollY to 365. Keyboard pairing selected `browser-security` on desktop and mobile.
- Context loss returned the curiosity surface to SVG while retaining all ten topics.
- Live reduced-motion toggles removed Lenis and Vanta, and restoring motion recreated them. Direct `#work` initially mounted no canvas; no-JS retained email/project links.
- No uncaught runtime exceptions in the completed QA/input campaigns. Five widths had no horizontal overflow. Both settled WebGL scenes had zero additional draws in instrumented idle windows; offscreen Vanta had no canvas.

## Reviews

### Design — ui-ux-pro-max

The cavity now has separate foreground, middle and deep planes; the broken silhouette changes rather than only swapping a crack graphic. Folded material gives curiosity a spatial layer that responds to authored relationships. Kept solid fields, matte surfaces and editorial type. Removed overlapping duplicate note text. No new dashboard, particle cloud or template section.

### UX — ui-design

All essential text and direct links remain HTML. Skip/Escape, focus transfer, native anchor navigation, keyboard impact/pair selection, mouse/touch hold, reset and reduced motion remain independent of WebGL. Vanta is decorative and pointer-transparent. Its static SVG preserves the composition without motion or WebGL. Skip remains readable through the camera move.

### Engineering — React / Next.js / Tailwind / Vercel practices

Server-rendered page structure retained. Libraries are scoped to client interaction islands; Lenis and Vanta load lazily. Meaningful store transitions remain immutable; GSAP tweens refs/numeric objects rather than React state. Reset uses explicit channel names to avoid overwriting GSAP's own target metadata. Timelines, events, observers, renderers and timers have cleanup. No scene styles added to globals.css; only Lenis's required stylesheet is imported in the layout.

## Visual QA artifacts

Local, intentionally excluded from Git:

`visual-qa/motion-libraries/`

- `before-entrance.png`, `before-curiosity.png`
- `pristine-{width}.png`, `first-hit-{width}.png`, `detached-{width}.png`
- `passage-{width}.png`, `hero-{width}.png`
- `curiosity-{width}.png`, `connected-{width}.png`
- Widths: 1440, 1024, 768, 390, 320.
- `reduced-curiosity.png`, `no-webgl-curiosity.png`, `no-js.png`
- `motion-preview.mp4`, `motion-contact-sheet.jpg`, timestamped source frames
- `qa-report.json`, `qa-mobile-report.json`, `input-report.json`

The motion preview was captured before removing duplicate in-field note copy and adding the Skip backing; final stills show the finishing changes. Previous Stage C/C.5 recordings remain preserved.

## Remaining limits

This remains one authored break, not general procedural destruction. Vanta adds a visible folded substrate; it does not make every topic a physically simulated object. The scene transitions and silhouette are stronger, but this pass does not establish parity with Lusion's fully authored object scenes. The large paper/enamel masses still carry much of their identity through print and edge depth. Hardware frame pacing, live device touch behavior and renderer context recovery warrant further device review.

## Primary implementation references

- [GSAP timelines](https://gsap.com/docs/v3/GSAP/gsap.timeline())
- [Lenis source and API](https://github.com/darkroomengineering/lenis)
- [Vanta WAVES and renderer lifecycle source](https://github.com/tengbao/vanta)
