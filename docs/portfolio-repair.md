# Visible media, loading, and interactions

## Image reliability

The supplied TracePilot screenshot showed an empty image surface. A fresh headed Chromium session on this workstation displayed the image, so the exact state of the user's existing tab was not reproduced. The architecture nevertheless had a real weakness: it set every enhanced HTML image to opacity zero after WebGL claimed ownership, leaving no visible backing if the GPU surface was absent or failed to present.

The native image now remains visible beneath enhancement, including during media travel. A shared projection matrix maps that real HTML image to the same four spatial corners as the WebGL sheet, avoiding a second flat image peeking behind the tilted surface. During a transfer, both source and destination HTML images move to those same corners and crossfade with a combined opacity of one: they do not leave duplicate images in their original locations. All five compressed portfolio images load eagerly and decode from their existing HTML elements; the GPU no longer fetches a second detached copy. Texture uploads and shader compilation happen during preparation. Shader/render failure restores the functional DOM path and hides the failed canvas. This favors visible, clear content over exclusive canvas ownership.

Readiness no longer starts as a hard-coded SSR success. It waits for fonts and image decoding, with a bounded fallback. The room monitor waits up to six seconds while these resources prepare, keeping the existing monitor composition rather than displaying a loading overlay. The black-hole and room scene design are unchanged.

## Interactions

- A small trailing cursor ring uses the existing pointer bus and animation clock. It grows over links and shows “Open” over project media. It compresses on press, does not replace the normal pointer, never captures input, and disappears for touch/reduced motion.
- Project images open an accessible native dialog. The image grows from its actual on-page rectangle into a clear full-size preview. Escape/Close returns focus to the originating link; repository links remain available, including without JavaScript. Native dialog focus containment and background scroll blocking are retained.
- The personal pause now reads “Taking a minute.” The ambiguous “Outside the screen” wording is removed; the two approved photographs are unchanged.
- Direct entry keeps the already-visible semantic hero steady instead of hiding it and revealing it again when the director initializes. Scroll-driven type depth is unchanged. Startup sampling at 1440 and 390 measured minimum letter opacity of one throughout initialization.

## Music

`public/audio/work-in-progress.mp3` is an original 45.714-second, 84 BPM composition synthesized by `scripts/assets/compose-portfolio-music.mjs`. Warm electric-key-like tones, a simple bass line, light brushed-noise percussion, and short stereo delays suit the cream/charcoal editorial page. Notes and delay tails wrap around the phrase boundary. No sampled recordings, copyrighted songs, downloaded loops, or third-party music assets were used. There is no separate third-party music license to clear; the reproducible composition source is part of this project.

Music is off by default. The visible “Music off/on” control starts playback through a deliberate gesture, fades the level, and provides mute. It pauses when the page is hidden or a prologue is active and does not replace or overlap the existing black-hole/room audio. Audio is downloaded only when requested. The reduced-motion version does not animate the level bars.

## Remaining limits

Keeping a native backing can expose a thin image edge during nonlinear velocity deformation; its planar perspective is synchronized, but CSS does not reproduce the shader's curved vertices or UV crop. It is an intentional reliability tradeoff. The project imagery is still static. These additions do not establish parity with Lusion's bespoke visual production. The music is an original synthesized loop, not a recorded live performance. Physical-device Safari and an existing browser profile with stale assets still need user-side verification.

## Validation and measurements

`pnpm lint` and `pnpm build` pass, including TypeScript. Headed Chromium using its default GPU path passes picture visibility, shader/native transfer alignment, project previews, Escape and focus return, slow image delivery, and music play/mute at 1366, 1024, 390, reduced motion, and WebGL failure. Full-page QA also passes at 1440, 1024, 390, and reduced motion, including anchors, contrast, context loss/restoration, overflow, and no-JavaScript access. All four media transfers enter, reverse, align, and release at each of the three widths.

Desktop walking and mobile guided exploration still complete notebook inspection, recovery, physical monitor takeover, unlocked cursor, scroll activation, and completed-session bypass. The final mobile rerun adds an explicit assertion that every hero letter is visible after takeover. Direct, skip, session, default-reduced, and explicitly requested full-motion entry paths pass idle-wheel activation tests.

| Production Chromium sample | Median / p95 frame interval | Intervals over 33.4 ms | Maximum draws / triangles |
| --- | --- | --- | --- |
| 1440 × 1000, recorded scripted scroll | 16.7 / 16.8 ms | 1 / 509 | 5 / 3,076 |
| 1024 × 800, recorded scripted scroll | 16.7 / 16.7 ms | 0 / 452 | 5 / 3,076 |
| 390 × 844, emulated and recorded | 16.7 / 16.7 ms | 0 / 431 | 4 / 774 |
| Reduced motion, recorded | 16.7 / 16.8 ms | 0 / 413 | 0 / 0 |
| 1440 × 1000, headed wheel input without recording | 16.7 / 16.8 ms | 1 / 599 | 5 / 3,076 |

The preceding pass's unrecorded desktop sample measured 16.7 / 16.8 ms, with three long intervals over 495 samples. Its recorded desktop sample measured 16.7 / 33.3 ms, with 16 long intervals over 513 samples. This repair keeps geometry/draw budgets. An initial overlapping room/full-page QA run reached 33.4 ms p95 and 45 long intervals over 655 samples; the final isolated recorded rerun is the steadier table above. This variability demonstrates capture/workstation load sensitivity, not an isolated GPU improvement. These results are workstation-specific, not a universal 60 FPS claim. Five WebGL textures and zero steady-scroll layout reads are reported. Reduced motion now eagerly prepares those same five textures even though it draws no media; skipping their upload would be a useful future memory optimization. Native image compositing and GPU memory bytes were not independently measured.

## Review evidence

- Local gallery: `http://localhost:3002/`.
- Screenshots, image/loading/preview/music checks: `visual-qa/repair/final/`.
- Full-page checks and desktop/laptop/mobile/reduced recordings: `visual-qa/repair/full/`.
- Ordinary wheel/hover recording, down and back: `visual-qa/repair/ordinary/ordinary.mp4`.
- Unrecorded pacing sample: `visual-qa/repair/ordinary/frame-pacing.json`.
- Complete desktop handoff: `visual-qa/repair/room-final/recordings/desktop-with-room-audio.mp4`.
- Latest mobile handoff: `visual-qa/repair/room-mobile-final/recordings/mobile-with-room-audio.mp4`.
- Motion activation and steady-type checks: `visual-qa/repair/motion-final/report.json`, `visual-qa/repair/startup.json`.

The complete ordinary-scroll capture and monitor approach were reviewed as sequential frame sheets; this exposed and corrected the duplicate native flow images and direct-entry hero flash. Headed Wayland screencasts had padding/compositor artifacts despite correctly sized screenshots, so the shared recording review uses headless captures. Main-site browser videos omit audio; the original composition can be auditioned independently in the gallery or through the live Music control. Playback, fade, pause, and mute were tested; subjective musical suitability was not established through agent listening. Room audio recordings retain their approximate capture synchronization.
