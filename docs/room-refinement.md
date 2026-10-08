# Walking choice and future-workspace refinement

Historical refinement report: [walking-only/window/handoff fixes](room-walking-fixes.md) supersede its mode selectors, finite backdrop and QA commands.

This continues the approved single room. The black-hole experience, notebook/board/computer discoveries and monitor-to-DOM handoff are preserved. No additional location or mechanic is added.

## Exploration stays optional

Desktop walking is no longer disabled solely because the browser window is narrow. A touchscreen laptop with a fine pointer is not automatically treated as a touch-only phone. Touch-only devices and reduced-motion users still default to authored guided views.

Both modes remain explicitly selectable. Entry offers walking or guided exploration, and the restrained exploration utility exposes **Walk freely** / **Guided views** after entry. Changing mode clears held movement and inertia; switching to walking cancels the authored camera move and synchronizes look angles. A deliberate click activates pointer lock; Escape still releases it. Inspection and handoff never expose the mode switch.

Reduced-motion users may deliberately choose keyboard walking without enabling forced camera transitions or body sway. Mobile retains swipe/tap guided views, with no dual-stick overlay. Keyboard walking on a phone requires an actual keyboard; the option does not imply WASD touch controls. The initial render quality tier stays conservative when switching from guided mode.

## Art direction

The aim is a quieter, prettier future workspace after people have left, rather than a destroyed bunker. The outside supplies the abandonment cue; the desk stays recognizably human.

- Muted blue-slate lower-wall paint and fine rails give the shell a clearer architectural palette against warmer plaster, paper and desk light.
- A small practical service hatch/vent and electrical conduit imply infrastructure with history, not decorative sci-fi wall panels.
- The window no longer faces two featureless boxes. A 1024 × 512 photographic crop shows an abandoned concrete slipway, overgrown vegetation and an overcast bay. The first procedural silhouette treatment was rejected during visual QA because it looked like illustrated wallpaper. The final source is Philip Modin's CC0 **Abandoned Slipway** on Poly Haven, with modest cool haze/desaturation. It is a photographic background, not a fully modeled city.
- An original 256 × 512 transparent glazing map adds sparse dried-rain streaks and edge deposits. The window stays readable; no moving rain particles or transparent fog stack is introduced.
- Cool window illumination becomes more directional; ambient fill is lower so the room has more depth. Desktop receives a rectangular window fill using the existing area-light infrastructure. Mobile retains the cheaper directional/hemisphere combination.
- Warm notebook/lamp activation, repair details and original material wear remain. No neon, orange apocalypse sky, explosions, horror lighting, soundtrack changes or extra narrative is added.

## Assets and cost

One new third-party asset, no new dependency: Philip Modin's [Abandoned Slipway](https://polyhaven.com/a/abandoned_slipway), [CC0](https://polyhaven.com/license). The 5,160,993-byte tonemapped source is checksum-verified and cropped/compressed to a **36,388-byte WebP**. Provenance and modifications are in `public/room/exterior-manifest.json`; `scripts/assets/room-exterior.mjs` reproduces the pipeline. The original 256 × 512 glazing map remains Canvas artwork in `room-surfaces.ts`. Architectural geometry is original Blender work, merged into existing material groups.

The custom shell increases from 501,692 to **594,512 bytes**. Shipped scene assets total **3,260,672 bytes**, up 129,208 bytes (4.1%) from the preceding polish. The glazing Canvas map adds GPU texture memory, not a separate download. Desktop's additional window area light increases per-fragment lighting cost; it adds no shadow pass or postprocessing pass. The exterior uses one background draw instead of three primitive background draws. Exact measured draw counts/timing are retained in the QA report, not inferred FPS.

## Validation

`scripts/room-mode-qa.mjs` checks narrow desktop, simulated coarse-plus-fine touchscreen laptop and reduced-motion entry. Each must move with WASD and switch both directions between guided and walking modes. It captures `visual-qa/room/modes/window-exterior.png` plus mode screenshots and a JSON report.

The existing selection, complete desktop/mobile flow, handoff, session and accessibility suites are rerun against the production build. Full screenshots and desktop/mobile recordings remain in `visual-qa/room/final/`; the review gallery runs at `http://localhost:3002/`. Recordings are reviewed through whole-duration contact sheets and denser handoff samples, not claimed human real-time playback.

Production TypeScript, lint and Webpack build pass. Three new mode checks plus the existing 30 named checks cover walking, input focus, pointer lock, collisions, inspection, mobile, reduced motion, direct links, skip, replay, WebGL/no-JS fallback and handoff. The gallery includes 58 main screenshots and four mode/window views.

### Measured rendering

Chromium / Intel Iris Xe ANGLE Mesa; guided phone size is desktop emulation, not phone hardware. Previous-build measurements are preserved at `visual-qa/room/modes/before-refinement.json`. These are single-run averages, not GPU time or statistically established speedups. Desktop 1440 computer and guided mobile captures have video recording active.

| View / render resolution | Calls before → after | CPU render submission before → after | Mean RAF interval before → after |
| --- | ---: | ---: | ---: |
| Standing, 1440 × 900 | 67 → 68 | 2.28 → 2.08ms | 16.67 → 16.67ms |
| Computer, 1440 × 900 | 30 → 31 | 1.84 → 1.72ms | 16.85 → 17.59ms |
| Computer, 1024 × 900 | 25 → 26 | 1.36 → 1.40ms | 16.67 → 16.76ms |
| Guided computer, 487 × 1055 | 23 → 24 | 1.18 → 1.32ms | 16.67 → 16.67ms |

Standing triangles increase 41,175 → 42,459 and textures 36 → 38. Guided computer triangles increase 14,090 → 15,326 and textures 42 → 43. Desktop computer textures increase 45 → 47. The recorded desktop computer interval is slightly worse even though CPU submission is slightly lower; no FPS improvement is claimed. A cached desktop shadow map remains the only shadow pass; mobile has no dynamic shadows.

## Remaining limitations

The outside backplate is deliberately cheap and has no true external parallax. It should read as atmosphere through weathered glass, not as a playable landscape. It is a real present-day derelict location, not a photograph of a future world; more distinctive restrained hardware would strengthen the future-era cue. The ordinary-workspace balance should not be lost. The keyboard/project artifacts remain simpler than the source furniture. Real phone and Safari performance, subjective audio listening and cinematic real-time approval remain unverified.
