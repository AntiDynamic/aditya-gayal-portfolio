# Editorial depth pass

This pass keeps the existing layout, copy, two approved portraits, three featured work entries, and monitor handoff. It adds depth and background motion to the actual website without adding content, dependencies, textures, or another canvas.

## Changes

- The page gradually moves from cream to charcoal through Selected Work, then returns to cream before the personal interlude. Foreground text, muted text, red accents, media knockouts, and divider colors change together. The return settles faster so direct navigation does not leave Contact briefly charcoal. A contrast check samples the transition as it scrolls.
- The existing red handoff briefly produces a soft background wash. The wash follows the traveling media and disappears when the media settles. It does not run as a separate animation.
- Active images cast a soft shadow through one instanced WebGL draw. Native images retain a CSS shadow when WebGL is inactive, reduced motion is requested, or the context fails.
- Work handoffs carry two small crops from the actual destination image behind the traveling sheet. The crops reuse the destination texture and shared geometry; they only appear on desktop while a project image is moving.
- Portrait handoffs wipe from the bottom or top so the seam crosses clothing or scenery before it reaches a face. Project-to-project handoffs keep their horizontal red seam.
- A short red rule continues into Lately. The three existing links respond a few pixels to pointer position, then settle. The contact composition remains still.

## Architecture

`MotionDirector` remains the single animation clock. It advances Lenis, samples the shared scroll and pointer state, updates semantic DOM, sets the palette, moves existing media, then renders the one transparent canvas. `Atmosphere` precomputes 101 color states and writes CSS variables only when the state changes. `SheetShadows` uses a single instanced quad batch. `MediaFlow` uses two pooled preview planes and existing image textures. No per-frame React state or extra layout reads were added.

The room and black-hole renderers were not changed for this pass. The monitor handoff still reveals the same semantic portfolio DOM.

## Validation

Production lint and build pass. Full page browser QA passes at 1440, 1024, 390, and reduced motion: content, links, image decode, overflow, context loss and restoration, no JavaScript, and static dark Work styling. The four media handoffs enter, reverse, align, and release at all three viewport widths. At the sampled transition states, the lowest observed body text contrast is 4.69:1 and muted text contrast is 4.50:1.

Headless Chromium on this workstation, during scripted scroll:

| Viewport | Median / p95 frame interval | Maximum draws / triangles | Textures | Long intervals over 33.4 ms |
| --- | --- | --- | --- | --- |
| 1440 × 1000 | 16.7 / 16.8 ms | 5 / 3,076 | 5 | 9 of 472 |
| 1024 × 800 | 16.7 / 16.8 ms | 5 / 3,076 | 5 | 3 of 411 |
| 390 × 844, emulated | 16.7 / 16.7 ms | 4 / 774 | 5 | 3 of 410 |
| Reduced motion, 1440 × 1000 | 16.7 / 16.8 ms | 0 / 0 | 0 | 0 of 423 |

The preceding elevation pass reached 3 draws / 2,304 triangles at desktop maximum, with a 16.7 / 16.8 ms median / p95. This pass adds one shadow batch and at most two cropped preview draws during handoffs. The 1440 capture sampled nine long intervals versus five before; the sample duration and capture load differ, so this does not establish a regression or an improvement in real device FPS. Steady-scroll layout reads remain zero. No physical phone, Safari GPU, or isolated GPU timing was measured.

The mobile room regression also passes notebook, file recovery, physical monitor takeover, completed-session bypass, skip, direct links, no-JavaScript access, and WebGL failure recovery. It reports no page or console errors. Evidence: `visual-qa/depth/room/report.json`.

Portfolio evidence: `visual-qa/depth/locked/report.json`, screenshots and full recordings in `visual-qa/depth/locked/recordings/`, and transition frames in `visual-qa/depth/flow-portrait/`.

## Remaining weaknesses

- The portrait-to-project handoff still changes between two very different image types. The seam avoids the face, but the transition can read as a collage at a paused midpoint.
- Continuum uses a labelled rendering of real CLI documentation rather than a product capture, and TracePilot's real UI capture is offline. Better real work media would add more than another effect.
- The soft red wash is intentionally brief. If it distracts on a physical display, reduce or remove it before adding any more motion.
- Browser emulation verifies layout and interaction behavior, not physical touch compositor timing or Safari rendering.
