# Continuous accretion motion

This records the first continuous-motion pass. Subsequent art direction increases the opening black-hole size and disk contrast and replaces the panel interior; see `reality-fracture.md`. The independent simulation clock and shared lensing/material sampling described here remain in use. The measurements below belong to the earlier composition.

## Scope

This pass changes only `black-hole-shader.ts`, `black-hole-renderer.ts`, and `event-horizon-scroll.tsx`, plus this report. It retains the existing camera trajectory, exposure curve, palette, ray integration, shadow, archive, singularity, white point, whiteout and identity choreography. Earlier uncommitted Information Collapse changes remain in the workspace.

## Clocks and lifecycle

Scroll progress still determines observer distance, camera basis, exposure, tidal typography and all story transitions. A separate effect-local simulation clock advances from active animation-frame deltas and updates `uTime` directly. It neither depends on scroll position nor rewinds when scrolling backward. Individual time increments are capped at 100 ms to avoid an abrupt material jump after a long browser stall.

The animation loop continues while the exterior shader is visible, including when scrolling stops. At progress .655 the shader enters its existing interior branch and idle rendering stops; the original scroll-driven loop continues to serve the later sequence. Document visibility and intersection observers pause rendering and reset the frame timestamp. Time therefore excludes hidden/offscreen time. Handoff sleeps, reverse scrolling resumes, and context loss disposes the renderer and returns to the existing fallback. No new React state, renderer, layer or camera drift was introduced.

Reduced motion advances the clock at 12% speed, reduces deformation/temperature variation to 25%, and reduces hot-region strength to 35%. It retains the existing fixed observer and shortened reduced-motion sequence. Changing motion preference does not reset the simulation clock or jump the disk phase.

## Material flow

The existing local angular velocity is retained:

`omega(r) = orbitDirection * sqrt(0.5) / (r * sqrt(r) + spin * sqrt(0.5))`

Current spin is zero. At radius 4.1, matter advances approximately 48.8 degrees over ten simulation seconds; at 8.3, approximately 16.9 degrees; at 13, approximately 8.6 degrees. There is no approach-dependent speed multiplier. The visible increase in motion comes from the existing camera approach.

Every disk hit samples `flowAngle = theta - omega(r) * uTime`. The existing periodic polar noise, new narrow filaments, dark lanes and fine inner material all use that material coordinate. Angular frequencies are periodic across the polar seam. Small deformation of the comoving coordinates evolves slowly, weighted toward the inner disk; it is not a global noise translation. Slow local temperature variation is also weighted by density and radius.

Three desktop / two mobile hot regions are extended arcs around radii 4.1, 6.2 and 8.3. Radial Gaussian falloff and a periodic angular envelope avoid particle-shaped points. Their angular phase uses the same radius-dependent flow coordinate, so each arc shears across its width. Independently varying low-frequency strengths keep them from pulsing together. Their contrast recedes to a weak residual rather than fully disappearing. Added heat changes temperature by at most a small fraction of the density enhancement.

All direct and secondary lensed disk intersections call the same `shadeDisk`, using the same hit position, radius and simulation time. There are no independently animated decorative rings. The existing geodesic-dependent Doppler/redshift calculation, orbit direction and beaming are preserved. This uses simultaneous emission samples, not a new simulation of photon travel-time delays or magnetohydrodynamics.

Stars are unchanged. The shader's directional sky lookup has no time dependence; apparent movement comes only from the existing observer motion and lensing. The shadow geometry is also time-independent.

## Rendering cost

| Tier | Ray steps | Base noise octaves | Extra fine noise sample | Hot arcs | Exterior draw calls |
| --- | ---: | ---: | ---: | ---: | ---: |
| Desktop before | 224 | 4 | 0 | 0 | 1 |
| Desktop after | 224 | 4 | 1 | 3 | 1 |
| Mobile before | 144 | 4 | 0 | 0 | 1 |
| Mobile after | 144 | 3 | 0 | 2 | 1 |

Per disk intersection, desktop noise interpolation samples increase from four to five (16 to 20 corner-hash evaluations); mobile decreases from four to three (16 to 12). New analytic structure adds two small coordinate-deformation trig evaluations, two filament/lane trig evaluations and one cosine plus one exponential per hot region. Slow temporal envelopes are computed once per rendered frame on the CPU and supplied as seven scalar uniform components, rather than recalculated per fragment. Ray integration is unchanged. There are no additional textures, network assets, geometry, draw calls or postprocessing passes. The archive retains its existing second draw call when reached.

Continuous exterior rendering intentionally increases idle GPU work compared with the former static frame. That energy cost is real even when measured frame delivery stays unchanged.

## Measurements

Same-machine comparison: Chromium 151, headless, ANGLE Intel Iris Xe / Mesa OpenGL ES 3.2, development webpack server, DPR 1. Each measurement is five seconds. The clean after measurement ran without screenshots, screencasting, encoding or building in the measurement window. These are browser RAF delivery intervals, not GPU timer-query measurements or a claim of real-phone performance.

| Scenario | Before median / p95 | After median / p95 | Before / after rendered frames |
| --- | --- | --- | --- |
| Desktop idle, progress .14 | 16.7 / 16.7 ms | 16.7 / 16.7 ms | 0 / 300 |
| Desktop slow approach, .14–.49 | 16.7 / 16.7 ms | 16.7 / 16.8 ms | 299 / 300 |
| Mobile viewport idle, progress .14 | 16.7 / 16.7 ms | 16.7 / 16.8 ms | 0 / 300 |
| Mobile viewport slow approach, .14–.49 | 16.7 / 16.8 ms | 16.7 / 16.8 ms | 299 / 299 |

Desktop viewport: 1440×1000, internal render size 1169×812, 224 ray steps. Mobile viewport: 390×844, internal size 273×590, 144 ray steps. Resolution caps and adaptive quality rules are retained. All clean-run p99 values were approximately 16.8 ms; the mobile approach had one 33.4 ms maximum interval. These short, vsync-limited runs do not establish GPU headroom or sustained battery/thermal behavior.

## QA artifacts

Local, gitignored directory: `visual-qa/black-hole-motion/`.

- `baseline/report.json`: measurements of the pre-animation implementation.
- `performance/report.json`: clean after measurements, including reduced motion.
- `after/report.json`: recording-run metrics and lifecycle probes. Its hidden/resume RAF distributions are not used for timing comparison; the first sampler could overlap callbacks between those probes. Draw counts and simulation-time pause/resume observations remain useful.
- `after/verification.json`: assertions for the sequence, idle time advancement, fixed camera, reduced-motion rate, mobile/desktop shader tier resizing, interior/handoff sleep, and context-loss fallback.
- `after/{desktop,mobile,reduced}-{distant,close}-{0,2,5,10}s.png`: fixed-scroll captures at progress .14 and .40. Times are elapsed capture-session times, not absolute simulation zero.
- `after/distant-idle.mp4`: 12.44 seconds with no scroll.
- `after/slow-approach.mp4`: 12.48 seconds from progress .14 to .49.
- `after/horizon-approach.mp4`: 12.44 seconds from progress .49 to .66, through the existing exterior/interior overlap.
- `after/regression-*.png`: later-phase captures through the final handoff.

The videos retain screencast frame timestamps and variable delivery intervals. Visual review used decoded chronological frames and full-duration contact sheets; a realtime video playback viewer was unavailable. This does not claim a human playback review. Fixed desktop 0/10-second samples returned zero pixel difference in a selected distant-star region (x30,y100,260×200) and shadow-core region (x710,y465,50×35). Disk samples changed. These selected regions support stability, but do not constitute a tracked measurement of every contour or filament.

The recorded desktop lifecycle probes showed zero idle draws at .7 and at 1, zero draws and unchanged simulation time during a synthetic document-hidden transition, and renewed draws after becoming visible and after reverse scrolling. Escape still focused `identity-title`. Later verification additionally exercises shader-tier recompilation and context loss. Visibility probing is synthetic; real OS minimization and physical-phone testing remain outstanding.

## Critical visual limits

- The existing bright approaching side clips detail into near-white. This limits how clearly an individual hot arc can be followed into its lensed image. Shared shader sampling guarantees temporal consistency, but captures do not prove a viewer can track every source/image correspondence.
- The darkest opening state at progress zero deliberately has very low exposure. Motion is easier to perceive after the existing reveal begins; no exposure/composition redesign was made.
- The density field is still procedural polar material. Continuous shear and weak comoving evolution give directional movement, but long-duration filming may reveal repeated small-scale motifs. The 12-second clips do not establish absence of repetition over minutes.
- Narrow analytic filaments are restrained enhancements to the existing texture, not physically simulated plasma reconnection. Hot regions vary around fixed preferred radii rather than being independently generated and destroyed fluid structures.
- Software WebGL, genuine mobile GPUs, thermal throttling and extended playback have not been benchmarked in this pass. Native desktop viewport emulation cannot certify mobile smoothness.

TypeScript, focused ESLint and a production webpack build passed. The evidence supports continuous coherent exterior motion and lifecycle correctness; exhaustive optical-flow correspondence, realtime playback audition and real-device approval remain open.
