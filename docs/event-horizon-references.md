# Event Horizon of a Question — references and adaptation

Current presentation and pacing are documented in `clean-pull.md`. The original adaptation notes below include earlier exterior typography, scroll-derived time and sound controls that have since been replaced or removed.

The experiment lives at `/lab/event-horizon`. The homepage is unchanged. Worktree was clean at the start; baseline was `0d2625f`. No reset, clean or re-clone of the portfolio was performed.

## NASA SVS 14576 — visual/camera reference

[Black Hole Visualization Takes Viewers Beyond the Brink](https://svs.gsfc.nasa.gov/14576/) — NASA Goddard, Jeremy Schnittman and Brian Powell, 2024. Studied the explanatory material, disk/photon-ring relationship, observer approach, narrowing visual field and restrained disappearance of information. The nonrotating model is a useful scope precedent.

Adapted: black shadow, an inclined luminous disk wrapping above/below it, apparent secondary imagery, scale changing with observer distance. Did not copy: NASA movies, imagery, music, scientific labels, multi-orbit trajectory or simulation data. No NASA asset ships. The white point and identity are an authored metaphor; they are not a claim about escaping a physical singularity.

## 0xydev/blackhole — renderer/math/performance

[Repository](https://github.com/0xydev/blackhole), MIT, copyright 2026 Furkan. Reviewed commit `af8b892eb3e8e280da193c63f3b3b2edb0460cff`.

Adapted source: Schwarzschild null-geodesic RK4 integration in the ray's orbital plane, local observer impact parameter, disk-plane crossings, thermal disk profile/blackbody spectrum, relativistic beaming, procedural sky direction projection, ACES/display encoding. License is preserved in `public/event-horizon/THIRD_PARTY_LICENSES.txt`, with attribution in the shader.

Changed: removed the Kerr integration branch and nebula; made the sky sparse; added a moving, tidally compressed typography plane intersected by the same curved ray; authored scroll-dependent observer position/basis; replaced time-driven orbit controls with reversible scroll; added emissive-sphere whiteout and a DOM identity handoff. Disk texture evolution uses scroll-derived time, so returning to a position returns to the same image.

Studied: sustained frame-time adaptation and early termination. Our adapter uses active-frame samples, 90-sample warmup, downward-only resolution changes with a 240-active-frame cooldown. It excludes first/idle frame gaps and never exposes a settings GUI.

Did not copy: application, GUI, Vite scaffolding, orbit controls, bloom pipeline, automatic rotation, scientific debug modes. No dependency from this repository was installed. Some unused helper/debug functions in the initial adaptation were removed before delivery.

## vaguemit/BlackHole — plunge and integration reference

[Repository](https://github.com/vaguemit/BlackHole), MIT, copyright 2026 Mayank. Reviewed commit `7f8baab1935f768359de406f08a190c0463e365f`, especially `useCamera.ts`, `OblivionOverlay.tsx` and performance architecture.

Adapted as a design principle: distinct hesitation/commitment/failure beats, explicitly bounded phase ownership, a clean transition out of the renderer. Did not copy source. Its click/time-driven camera changes, React updates during motion, recovery orbit, white-flash overlay, WASM/physics subsystem and control UI are not used. Our camera follows native scroll; whiteout is a sphere/ray intersection rather than an opacity overlay.

## Supplied recordings — pacing and art direction

- Lusion reference: `/home/anti/Videos/screenrecording-2026-10-06_01-03-50.mp4`.
- Latest portfolio: `/home/anti/Videos/screenrecording-2026-10-06_21-53-18.mp4`, 50.2 seconds.

Reviewed full-duration sampled contact sheets and the repository's previous timing audit. This is sampled frame inspection, not a claim of playing every reference frame in a video player. The useful principles are strong subject separation, a confident camera, one visual cause carried through a transition, and calm intervals. The supplied Lusion reel includes filmed/rendered material; it does not establish that every shot is realtime WebGL.

Our response: one optical phenomenon, sparse type, peripheral disk passages, diminishing information, a black pause, then a single white point. No Lusion imagery, assets or branding is reused.

## Medium choices

- Three.js: a thin WebGL2 host for one fullscreen triangle. R3F adds no value to a single imperative shader surface here, so the existing Three package is imported lazily directly.
- GLSL: actual 3D camera rays, curved trajectories, disk/typography intersections, procedural sky and emissive-sphere projection.
- DOM: identity, semantic headline, links, skip, motion choice, focus. Essential text never depends on the shader.
- CSS module: sticky viewport, the white identity composition, small reveal transforms and focus styles.
- Native browser scroll: one normalized progress value, 85ms exponential response, reversible. No wheel interception, scroll lock, or hundreds of observers.
- The scalar controller uses native scroll without a separate smoothing library.
- Blender: inspected existing pipeline, not used; mathematical lensing does not benefit from a mesh asset.
- 21st.dev: existing project reference audit was inspected. No component solves geodesic rendering or improves this simple scroll/controller boundary; no new templates or packages imported.
- No new dependencies, physics engine, environment download or background video. Opt-in music uses two locally hosted CC0 tracks; provenance and processing are in `public/audio/ASSETS.md`.

## Scope of physical correctness

The exterior integrates nonrotating Schwarzschild null geodesics with a static observer outside the horizon. The ray equations produce the lensed disk and secondary imagery. The observer stops just outside the mathematical coordinate singularity. The perceived crossing, tidal typography, information loss, white point and reformation are deliberate artistic extrapolations, not a horizon-penetrating Kerr simulation or a scientific model of the interior. This boundary is important: the prototype should be judged as cinematic spatial rendering, without claiming NASA's scientific simulation fidelity.

## Local asset

`public/event-horizon/fallback.webp`: captured from this locally adapted realtime renderer at a distant approach frame; optimized to 1200px width. Used only if WebGL fails. It is not the main experience or a NASA image. The renderer license notice remains shipped alongside it. Typography atlas is generated in memory from the existing approved display font; no downloaded type texture.
