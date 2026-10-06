# Stage C — one structural break

Reviewed 2026-10-06. Scope: the enamel corner adjoining the cobalt seam only.
The approved homepage and later sections are preserved. Full entry choreography,
all-material destruction, sound playback, rebuild physics, and a global renderer
are deliberately outside this prototype.

## Behavior and visual review

Click/tap or Enter gives a normal impact. A hold of approximately 500ms, or held
Space, loads the face and gives a stronger impact on release. Damage persists
through stress, hairline, fracture, and detachment. Four normal hits suffice;
strong impacts advance two steps. Contact selects the nearest authored fracture
branch; subsequent hits retain it. Open space cannot accumulate damage.

The approved uncut silhouette remains visible until the first hit. Complementary
extruded polygons then introduce a real cut, sidewall thickness, and printed
enamel fragment. All printed faces share one registered font atlas: the fragment
takes its letter with it. Semantic text remains in HTML. A short loaded pause
precedes release; the bracket turns, rubber relaxes, paper sags, and one fragment
rotates forward and falls out of frame within approximately 1.3 seconds. Four
small chips (two on phones) support the event and expire within 700ms.

The missing corner exposes nested cobalt planes and two authored openings into
a darker recessed floor, with tiny pale-blue and saffron trace marks. This was
refined after the first render looked like a blue strip. No portal, bloom,
ambient particles, camera shake, or idle animation was added.

Design review: preserve the large paper mass/enamel counterweight, restrained
materials, and negative space. Print ownership, bevels, shadow response, and a
recessed opening provide the physical language. The fracture is intentionally
stylized; it is not a procedural ceramic simulation. Mobile retains a separate
vertical composition. The surviving semantic headline remains intact even when
its decorative letter leaves with the fragment.

## Engineering review and measurements

- One shared immutable external store owns meaningful transitions. Refs and
  Three transforms own charge, impulse, fragment movement, and joint response.
  No per-frame React updates or new dependency.
- Native input timestamps measure hold duration, preventing a delayed event
  handler from interpreting a short tap as a heavy impact.
- Demand rendering during movement, then zero instrumented idle draw calls.
  Hidden-tab work pauses; returning uses elapsed time rather than catch-up steps.
- Reuse procedural maps, font atlas, and lighting. Dispose generated geometry,
  textures, listeners, and pending animation frames on cleanup.
- Aggregate generated chunk gzip: **441,575 → 448,368 bytes**, an increase of
  **6,793 bytes**. This is a whole-build comparison, not route transfer size.
- Pristine/settled renderer calls: **48**, including shadow passes. Triangles:
  desktop **2,734 / 2,894**, mobile **2,438 / 2,598**. A sampled mobile impact
  reached **56 calls / 3,050 triangles**.
- Device DPR 2 test: desktop **1.5**, mobile **1.0**. One shadow-casting key;
  existing VSM shadows remain the main render-target cost. No postprocessing.
- Four repeated reset cycles plateaued at **21 geometries / 8 textures /
  8 programs** after warmup. This is a bounded-resource observation, not a
  comprehensive heap-leak proof.
- Test environment: Chromium headless software WebGL. No hardware 60fps claim,
  real-phone frame-time measurement, or final adaptive-quality system.
- Damage preloads the hero module only. It does not mount another canvas,
  precompile hero shaders, or implement the future passage transition.

## UX and accessibility review

Production checked at **1440, 1024, 768, 390, and 320px**:

- Mouse click/hold, native touch tap/hold, keyboard Enter and held Space.
- Visible focus; Tab cycle through Skip, pressure control, and reset.
- Reset restores pristine and focuses Skip. Skip/Escape focus the hero heading.
- Reduced motion changes cracks/reveal immediately without flight or debris.
- Forced WebGL failure preserves an interactive SVG fracture/reveal.
- No JavaScript hides the entrance and leaves ordinary portfolio reading usable.
- Direct anchor links bypass the entrance. No horizontal overflow or recorded
  uncaught runtime exception.
- Pointer, touch, and keyboard are equivalent ways to apply pressure; precision
  aiming is optional. Content and Skip never require damage completion.

## Assets

Six short CC0 Kenney Foley selections total **25,875 bytes**, trimmed and encoded
as mono 22,050Hz Vorbis. They are **not loaded or played**. Exact mix/material
matching needs later audition. No texture pack, HDRI, GLB, physics engine, audio
engine, or decoder was introduced. Full filenames, provenance, processing, byte
sizes, and generated graphics are in [ASSETS.md](../public/entrance/ASSETS.md).

## QA artifacts

Local artifacts live in ignored `visual-qa/entrance-stage-c/`, not the production
bundle. `report.json` records interaction checks and renderer counters.

- `pristine-{1440,1024,768,390,320}.png`
- `first-{1440,1024,768,390,320}.png`
- `settled-{1440,1024,768,390,320}.png`
- `near-1440.png`, `hairline-1440.png`, `fractured-1440.png`
- `detached-1440.png`, `detached-390.png` — fragment in flight
- `reduced-first-390.png`, `reduced-final-390.png`
- `fallback-first-390.png`, `fallback-final-390.png`, `no-js-390.png`
- `hero-after-skip-1440.png`
- `destruction-motion-study.mp4` — controlled-time renders for inspecting motion
  and print ownership; **not a recording or measurement of hardware FPS**.

## Future renderer recommendation

**Hybrid**, when the full entrance passage is approved: consider a shared
entrance/hero renderer for asset reuse, camera continuity, and shader warmup.
Keep most personal sections DOM/SVG and mount later expensive experiences only
when visible. A persistent global canvas would introduce scene ownership and
coordinate complexity before it has a demonstrated benefit. No refactor now.

## Remaining limits

Only one corner breaks. Its trajectory is authored, with an exit rather than a
collision/settle simulation. Fracture branches respond to contact region, but
are not physically solved; recorded surface normals/direction are authored
front-face values rather than raycast results. Approach speed is recorded for
future tuning, not used to increase damage. No camera impulse is needed for the
current local response. No audio playback, actual HTML visible through the hole,
or entry-through-hole transition is implemented. Static SVG fallback conveys
state and depth with flat color rather than PBR shading. The next decision is
visual review of this one break before expanding its scope.
