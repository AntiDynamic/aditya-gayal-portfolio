# Prologue sound design

The subsequent mouse-look/smoothness request changes interior audio: text and singularity are now silent from progress 0.575 to 0.943. See `docs/prologue-smoothness.md` and `visual-qa/smoothness/audio/report.json` for current behavior; the captures/levels below document the previous audio pass.

Audio-only continuation of the approved prologue. Room layout, black-hole rendering, gameplay and the same-DOM monitor handoff are preserved. No new sound/animation enable screen. Audio is default-on after the first browser-permitted click, tap or key; browser autoplay rules and device mute cannot be overridden.

## Sonic direction

The black hole is an authored sonification, not a claim that space transmits these sounds. Three low, slightly detuned mass tones sit beneath two different-speed, band-limited accretion flows. Slow stereo orbital modulation and slow spectral evolution run on AudioContext time independently of scrolling. Existing scroll progress controls proximity, spectral narrowing during the plunge, collapse into near-silence and the white-point electrical harmonics. The existing music is ducked so it does not obscure the soundscape. No impact explosions, alarms or generic portal whooshes.

The white point's 100/150 Hz harmonics rhyme with the fluorescent fixture. The room inherits the already-unlocked context rather than asking for a second activation. Starter clicks and the hum follow the existing fixture ignition; reduced motion keeps a settled fixture instead of replaying flicker sounds. The room has no musical score.

| Source | Sound and trigger |
| --- | --- |
| Ceiling fixture | Positioned 50/100/150 Hz hum; starter transients during actual wake ignition; no ongoing horror flicker |
| Window | Soft filtered exterior weather, positioned at the window |
| Ventilation | Low filtered air at the high room vent |
| Desk lamp | Licensed switch transient when the existing warm lamp turns on |
| Notebook | Three licensed paper variants for inspection, reframing and placement; small playback-rate variation |
| Walking | Four extracted real footfalls, alternating foot positions, floor-adapted EQ; actual movement-distance events, not a clock continuing when stationary |
| Drawer | Authored sliding friction/body when the existing drawer opens or closes |
| Storage | Authored short seek/friction envelope during recovery |
| Computer | Four licensed keypress variants on recover/open, power relay and a gradually emerging filtered fan with mechanical body |
| Monitor handoff | Room bus follows the existing camera approach to silence; shortened fade matches reduced-motion timing; portfolio ambience resumes afterward |

Stationary shelf artifacts, disconnected tools and unmoved chairs do not emit arbitrary sounds. No hover bleeps, quest confirmations or forced noise from every prop.

## Mix and architecture

One shared AudioContext preserves gesture permission across the black hole, room and website. Shared master gain, 28 Hz high-pass and dynamics compression provide headroom and restrained low-end. This is protective compression, not a certified brick-wall loudness limiter.

Equipment uses world-space equal-power PannerNodes with distance attenuation. The listener follows the actual camera position, forward and up vectors at at most 30 Hz, imperatively; no per-frame React state. Equal-power panning is deliberately cheaper than HRTF on mobile. A single quiet 38 ms, low-passed early reflection suggests this small room without a large convolution impulse or long cinematic reverb. It does not simulate geometry-aware acoustic occlusion.

Sources fade through AudioParam time constants and bounded transient envelopes. Interaction voices are capped at 12, with per-type debounce and source/node cleanup. Room nodes stop/disconnect on exit; cosmic sources stop after their exit fade. The shared context closes only when its owning provider unmounts. Hidden documents suspend it and pause media; natural visibility recovery resumes it. Inactive musical tracks pause instead of streaming four loops continuously. Failed or unsupported Foley decoding falls back to the authored synthesis; it never blocks navigation.

## Assets and reproducibility

All new downloaded material is CC0-1.0, verified on the creator's OpenGameArt page:

- unicaegames: [Keyboard Soundpack #1](https://opengameart.org/node/122745), four single Cherry KC 1000 keypresses.
- Luckius: [Various Paper Sound Effects](https://opengameart.org/content/various-paper-sound-effects), three ordinary paper clips; ripping/crushing clips are not used.
- StarNinjas: [10 Clicks and Switches](https://opengameart.org/content/10-clicks-and-switches), two switch clips.
- mikeask: [Steps in wood floor](https://opengameart.org/content/steps-in-wood-floor), four 0.36 s footfall extracts, low-passed for the existing floor rather than retaining a strong wooden resonance.

`public/audio/foley/sources.json` records creator, source and download URLs, CC0 license URL, original/archive/optimized sizes, modifications and SHA-256 for each of 13 shipped samples. Total encoded sample payload: **82,742 bytes**. The runtime also uses one shared 13 s mono noise buffer (approximately 2.50 MB at 48 kHz), plus short decoded samples. No room model, texture, dependency or draw call is added. No Blender work is needed for this audio-only pass.

Reproduce with `node scripts/assets/prepare-audio.mjs` (Node, FFmpeg and unzip required). Downloaded archives remain in `/tmp/portfolio-audio`, not in shipped public assets. Previous music provenance remains in `docs/audio-sources.md` and `public/audio/ASSETS.md`.

## Validation and review

Run `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`; serve that finished build before QA, rather than rebuilding beneath a running production test.

`node scripts/sound-design-qa.mjs` captures the actual post-compressor Web Audio output, not an added soundtrack. It probes distant/approach/interior/singularity/fluorescent levels, finite samples, one context across stages, source events, default-on natural activation, mobile/reduced interactions and simulated document visibility suspend/resume. Output: `visual-qa/audio/report.json`, screenshots and `visual-qa/audio/recordings/`.

`QA_OUTPUT=visual-qa/audio/walk node scripts/room-walk-qa.mjs` verifies free desktop walking/collision, inspection, touch exploration, reduced motion, monitor handoff, session bypass, direct links, no-JS and WebGL fallback, and records existing renderer timing/draw-call telemetry. Those timings include browser video/audio capture overhead; they are not GPU timings, physical-phone FPS or a controlled A/B audio-cost benchmark.

Subjective listening and real-device headphone/speaker/iOS review are still necessary. Signal analysis and code review cannot justify “best audio ever.” Recorded keyboard, paper, switches and footsteps are more distinctive than the previous generic noise-only transients; the drawer, drive, weather and fan remain synthesized approximations. Acoustic occlusion and a captured real fan/room-tone library would be sensible future improvements, not reasons to reopen the approved visuals.

### Captured signal results

The audio-specific production run passes six named checks with no page errors, one context throughout each scenario, and finite output at every measurement. Its complete captured mixes measure:

| Capture | RMS dBFS | Peak dBFS | NaNs / infinities |
| --- | ---: | ---: | --- |
| Cosmic / fluorescent / skip | -30.63 | -9.06 | 0 / 0 |
| Room / notebook / recovery / shortened handoff | -35.71 | -5.81 | 0 / 0 |
| Mobile guided / notebook / recovery / shortened handoff | -35.69 | -6.66 | 0 / 0 |

These whole-recording levels include quieter and silent intervals; they are not perceptual loudness certification. The previous room-only synthesized capture was approximately -52.04 dBFS RMS / -35.92 dBFS peak, but it contains different actions and duration, so it is not a controlled loudness A/B. No captured mix clips. A separate production test returning 404 for every Foley URL verifies that synthesis, notebook interaction and skip still work without page errors.

`node scripts/sound-design-review.mjs` encodes actual captured audio into `visual-qa/audio/recordings/cosmic-with-audio.mp4`, `room-with-audio.mp4` and `mobile-with-audio.mp4`, validates peaks/finite signal, and creates `visual-qa/audio/index.html`. Full-video one-frame-per-second contact sheets are inspected for sequence continuity; this is not real-time listening. Local review gallery: `http://localhost:3002/`. Experience: `http://localhost:3000/?replay=1&motion=full`.

The final production gameplay suite passes **21 named checks**, with no page or console errors, at 1440, 1024, resize, 390 mobile emulation and reduced motion. Its before/after room telemetry is below; “before” is the approved previous prologue capture, not an audio-disabled simultaneous benchmark. Draw calls, triangles and texture counts are unchanged. CPU draw submission and RAF intervals vary with capture/host load, so these numbers do not establish an isolated audio overhead or physical-phone performance guarantee.

| View | Backing render size | Calls | Before CPU draw / RAF ms | After CPU draw / RAF ms |
| --- | --- | ---: | --- | --- |
| Desktop | 1440 × 900 | 32 | 1.98 / 18.33 | 2.20 / 19.44 |
| Desktop 1024 | 1024 × 900 | 27 | 1.82 / 16.76 | 1.60 / 16.67 |
| Mobile emulation | 487 × 1055 | 25 | 1.21 / 16.67 | 1.29 / 16.67 |
| Reduced motion | 1440 × 900 | 32 | 1.74 / 18.52 | 1.93 / 18.89 |

Full walking screenshots/measurements: `visual-qa/audio/walk/`. `QA_OUTPUT=visual-qa/audio/walk node scripts/room-walk-review.mjs` generates five full videos and a gallery, including `recordings/desktop-with-room-audio.mp4`. These automated regression videos end with an intentional session-bypass reload; the final website's existing entrance animation on that reload is not a broken monitor handoff. The dedicated sound-design videos omit that reload.
