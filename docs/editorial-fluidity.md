# Everyday motion and main-route activation

This pass keeps the current editorial design and all prologue scene assets. The reference reviewed was `/home/anti/Videos/screenrecording-2026-10-08_22-04-19.mp4` (79.5 seconds). Its useful ordinary motion is sustained image travel, staggered masks, small perspective changes, responsive interaction, and clean settling. No reference artwork, camera shots, models, or code were copied.

## Activation

The direct, completed-session, and skip paths initially ran motion, but an idle-input deadlock was reproduced: wheel input after the renderer slept left scroll at zero. Lenis intercepted the wheel event, while the director waited for a scroll event that required Lenis to advance first. The shared director now wakes from Lenis's `virtual-scroll` event. Its bounded animation clock also prevents a long idle pause from becoming a large first-frame jump.

A second mismatch existed for visitors using `motion=full`: the room honored that explicit choice while the portfolio still applied the operating system's reduced-motion setting. The director and CSS now share the resolved preference. Default reduced motion remains respected; an explicit full-motion choice carries into the portfolio.

The director also wakes and invalidates its layout cache when the monitor surface changes, on the prologue lifecycle event, and on page restoration. It no longer relies only on a resize event to resume after takeover. The observer watches the surface attribute, not per-frame style changes.

## Motion changes

- About, Work, project titles, and the personal interlude reveal through separate line masks. Entry starts a short damped sequence that can finish after scrolling stops. Text stays semantic DOM with no visual duplicate.
- Media retains shallow depth over more of its visible passage. Portraits stay restrained; project hover adds a small lift, internal image scale, and settling response.
- A small UV drift creates movement within the image while the layout remains stable. Traveling surfaces inherit the source and destination image transforms so handoffs do not reset their crop.
- Link arrows and image actions use longer deceleration rather than a uniform short transition. Keyboard focus reveals masked text immediately.

The same director still owns Lenis, pointer state, rectangle sampling, DOM transforms, and the single WebGL canvas. No dependencies, texture assets, draw calls, or per-frame React updates were added.

## Production validation

Lint, TypeScript, and the production build pass. Targeted browser checks pass for direct access, completed sessions, skip, default reduced motion, and explicit full motion while the OS requests reduction. The complete portfolio suite passes at 1440, 1024, 390, and reduced motion, including navigation, image decoding, overflow, context loss/recovery, and no-JavaScript content access.

Headless Chromium, scripted scroll with video capture:

| Viewport | Median / p95 interval | Long intervals >33.4 ms | Max draws / triangles |
| --- | --- | --- | --- |
| 1440 × 1000 | 16.7 / 33.3 ms | 16 / 513 | 5 / 3,076 |
| 1024 × 800 | 16.7 / 16.8 ms | 4 / 440 | 5 / 3,076 |
| 390 × 844, emulated | 16.7 / 16.8 ms | 3 / 421 | 4 / 774 |
| Reduced motion | 16.7 / 16.7 ms | 1 / 463 | 0 / 0 |

The preceding pass measured 16.7 / 16.8 ms at desktop with nine long intervals over 472 samples. The final recorded desktop run has a worse p95 and more long intervals; that is a remaining frame-pacing concern, not evidence of universally smooth 60 FPS. Capture load and sample lengths differ, so this is not an isolated GPU regression measurement. Five textures and zero steady-scroll layout reads remain unchanged. No physical phone, Safari, isolated GPU timing, or hardware-independent 60 FPS claim is implied.

A separate 1440 × 1000 wheel-input sample without video capture measures 16.7 ms median, 16.8 ms p95, and three intervals over 33.4 ms across 495 samples. It reaches scroll position 5,999 from an idle start. Evidence: `visual-qa/fluidity/ordinary/frame-pacing.json`. This separates normal input behavior from some capture overhead, but is still one workstation, not a device-wide performance guarantee.

Evidence: `visual-qa/fluidity/production/report.json`, `visual-qa/fluidity/portfolio/report.json`, portfolio screenshots and recordings under `visual-qa/fluidity/portfolio/`, and the ordinary wheel/hover review under `visual-qa/fluidity/ordinary/`.

The complete desktop prologue regression also passes notebook inspection, recovery, physical monitor takeover, pointer release, and wheel-only portfolio scrolling after the director has gone idle. Completed-session bypass, skip, direct links, no JavaScript, and WebGL-failure access pass. Evidence: `visual-qa/fluidity/room-verified/report.json` and its recorded playthrough.

All four media handoffs pass forward/reverse alignment and release at 1440, 1024, and 390. Evidence: `visual-qa/fluidity/flow/report.json`. The complete ordinary wheel/hover recording was inspected as sequential frames, including the return from Contact; the return now resumes after stillness rather than waiting for pointer movement.

## Remaining limits

This improves the existing system's ordinary motion, not its entire art direction. The portrait-to-project wipe can still read as a collage. Work media is mostly static, so it lacks the independent internal motion of a well-produced product reel. Better real project footage would improve that more than another shader. Emulated mobile testing does not establish physical touch smoothness. Large text moving behind the portrait intentionally occludes a few characters during its spatial state; body copy remains unobstructed.

A cold direct load can briefly show the semantic hero before its enhanced masked entrance starts. The monitor path skips that entrance to preserve its exact visual handoff. Eliminating the direct-load enhancement flash without hiding fallback content is still a separate loading-choreography refinement.
