# Final prologue polish

## Scope and status

The approved single-room sequence is preserved. This pass does not change the black-hole renderer, add narrative scenes, introduce a puzzle, add collectibles, or redesign the portfolio. Freeze the prologue's content and architecture after this pass; future portfolio work must not reopen its scope casually.

This is a tested web-room polish pass, not a claim of photorealism or a substitute for human cinematic approval. Real-phone/Safari validation and subjective real-time audiovisual review remain outstanding. Those limitations prevent honestly certifying every visual stop condition.

## Materials and lighting

- Three original 256px grayscale finish maps differentiate painted surfaces, paper and molded plastic. They are static surface maps, not animated noise. Paint includes restrained roughness repair history; paper has small fiber variation. Color textures are not replaced with generic dirt.
- Upper plaster retains its source normal at 0.16 strength; the blue lower painted wall now receives restrained 0.06 normal response. Casing and paper reuse their finish maps for 0.3mm and 0.08mm bump amplitudes, respectively.
- The source metal desk retains its own scanned textures and 0.62 roughness. A world-space material adjustment creates modest polish at the keyboard and forearm contact zones, only on the desktop. The floor receives a restrained polished chair-use region. These affect light response, not just painted discoloration.
- Four floor contact patches are merged into one mesh/draw while retaining their individual UVs and placements. The source chairs retain scanned wear rather than receiving invented rubber casters or uniform new grunge.
- The cream model/sill geometry now casts into the existing cached desktop window shadow map, improving the city model's self-shadow/contact. No extra dynamic light, GI, SSAO, bloom, or postprocessing pass is added. The shadow map is still computed at initialization, not every frame.
- The neutral fluorescent, overcast window and warm desk lamp remain the motivated sources. The existing 7.7s normal wake, unequal tube ignition, exposure recovery and delayed orientation are preserved. Reduced motion retains its shorter 3s reveal without the normal stand-up sweep.
- Portrait wake framing widens temporarily to 68 degrees so the diffuser's housing does not disappear beyond both screen edges; it settles back to 52 degrees during the existing stand-up sequence. Desktop framing is unchanged.
- The lamp remains off until notebook inspection or recovery powers it. The desk's new roughness/material contrast becomes more visible under its existing warm light. No perpetual horror flicker is added.

## Placement and last session

Keep the existing coherent debugging session: open skewed notebook and pen, unplugged storage cable, partially open device and removed lid, screwdriver, pulled-forward print, drink ring, crooked second chair and imperfect cable routing. The source screwdriver was incorrectly upright; its placement is corrected and grounded using its actual transformed bounds. It now lies beside the opened device. Existing uneven books, partly open drawer and sparse shelf remain; no random clutter is added.

An actual exterior sill/drip lip now supplies modest near-window translation parallax, while the distant CC0 spherical panorama remains continuous. No finite cropped photo plane or exposed box edge is restored. This is limited foreground depth, not a newly built exterior world.

## Inspection and storytelling

The notebook now physically lifts 6cm and tips approximately four degrees during inspection, with damped return to its exact desk pose. Its pen is attached to the same group, so it no longer stays behind or becomes a separate obstructing target. Page roughness/fiber bump, existing curved geometry, gutter, layered edges, worn cover and readable framing work together. Both inspection/return and the other-page framing action receive a paper sound. The existing “Other page” action reframes the facing page; it is **not** a simulated paper-page turn.

The board's black route, cyan correction, small “this?” / “yeah”, crossed turn and old scraps remain understated. The terminal remains an ordinary `/home/aditya` filesystem and five work directories; no new narrative wording or filesystem mechanic is introduced. Existing city/timeline/map/frame/window artifacts remain foreshadowing, not added project exhibits. These already worked, so this pass does not claim to have rewritten them.

## Controls and UI

Desktop retains free WASD/arrow movement, deliberately entered pointer lock, E/click inspection and Esc release. Existing axis-separated collision, 1.65m eye height, 52-degree FOV, 1.32m/s speed, acceleration/deceleration and tiny movement-only sway are preserved instead of adding another controller. Keyboard movement continues after inspections even when an accessible button has focus.

Resume is a restrained, low-opacity “Mouse look” link rather than a persistent large instruction box. Escape guidance remains a one-time brief hint. Inspection chrome loses its border and becomes quieter. Keyboard focus outlines remain: disappearing UI must not mean inaccessible controls. Skip is always available.

As explicitly requested in the final brief, mobile no longer uses the previous held Walk button. It uses five authored views with 44px-minimum buttons, horizontal swipes and explicit Look closer actions. The same notebook, board, shelf and computer remain available. Reduced motion uses the same deliberate static views without pointer lock or WASD translation, avoids the normal forced wake sweep, and uses the existing short same-DOM handoff rather than forced monitor zoom. Desktop does not acquire a mode menu.

## Audio

The audio-only continuation requested after this visual lock supersedes this historical audio section. See `docs/sound-design.md` for the shared context, world-positioned equipment, licensed Foley and new QA. The approved visuals remain frozen.

No room music or enable-sound/enable-animation UI is introduced. Environmental sound remains default-on, subject to the browser's mandatory gesture policy. The natural Enter/tap/keyboard interaction unlocks it; JavaScript cannot promise audible autoplay on every browser.

Original synthesized ventilation, outside weather and fluorescent hum remain quiet. The seeded bed buffer is extended from 3s to 11s. Interaction sounds now use varied source offsets/envelopes rather than replaying an identical fragment; steps have a low decaying body, lamp/drive have restrained mechanical transients, and paper has a slower band-limited rustle. The recovered fan gets stereo placement and very small bearing-frequency drift. This is stereo panning, **not** a world-space HRTF spatial-audio system. There are no new third-party audio licenses. Contexts suspend when hidden and close on exit.

## Computer handoff

The already working physical-monitor → actual-portfolio-DOM approach is deliberately preserved. The same DOM is reparented, prewarmed, faded through the terminal and approached for 3.4s; the bezel leaves frame, reflection/scanline treatment fades, then DOM ownership and scrolling return. No new overlay, route or duplicate website is introduced. Resize updates the approach instead of completing it early. Reduced motion keeps its short camera-aligned fade. The website still begins “ADITYA GAYAL” and “I like making things and figuring out why they don't work yet.” The old slogan is not restored.

Frame review exposed a direct integration problem: ScrollTrigger interpreted the CSS3D monitor's transformed bounds as scroll progress, so the portfolio geometry/heading could change pose on return to document layout. The journey now holds progress at zero only while inside `data-monitor-surface`. Normal portfolio scrolling is unchanged. QA asserts the monitor pose is zero before the handoff completes. This is an integration correction, not a portfolio redesign.

## Assets and Blender

No new downloads, large textures, dependencies or source-model polygon increase. Existing CC0 Poly Haven models/materials/panorama and the OFL handwriting font retain their provenance in `docs/asset-sources.md` and `public/room/*manifest.json`. Original runtime maps/geometry/audio need no third-party attribution. The shipped scene files remain 3,327,264 bytes. Blender CLI is used to inspect the screwdriver's source axes; no new Blender model or bake is claimed in this pass.

## Validation and measurements

Run against the production server:

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm start
node scripts/room-walk-qa.mjs
node scripts/room-walk-review.mjs
node scripts/room-audio-qa.mjs
```

Current results and raw per-view CPU/RAF measurements: `visual-qa/room/lock/report.json`. Before-pass reference: `visual-qa/room/lock/before.json`. These are local Intel Iris Xe Chromium/ANGLE measurements with recording enabled, not GPU timings, an FPS guarantee, or real-device mobile performance. Mobile keeps the 1.25 DPR / 600k-pixel cap and disables realtime shadows/window area fill. Desktop keeps its 1.5 DPR / 1.5M-pixel cap and cached 1024px shadow map.

| Computer view | Render pixels | Calls before → after | Triangles before → after | CPU submission ms before → after | Mean RAF interval ms before → after |
|---|---|---|---|---|---|
| Desktop 1440 | 1440 × 900 | 32 → 32 | 25,770 → 25,776 | 2.13 → 1.98 | 16.85 → 18.33 |
| Desktop 1024 | 1024 × 900 | 27 → 27 | 15,530 → 15,536 | 1.59 → 1.82 | 16.85 → 16.76 |
| Touch emulation 390 | 487 × 1055 | 25 → 25 | 15,338 → 15,344 | 1.02 → 1.21 | 16.67 → 16.67 |
| Reduced motion | 1440 × 900 | 32 → 32 | 25,770 → 25,776 | 1.75 → 1.74 | 16.85 → 18.52 |

These are single-run comparisons, not a controlled benchmark: the new run also records actual Web Audio and explores more views. Do **not** claim a performance improvement. The observed 1440/reduced RAF intervals are worse under capture, despite unchanged visible call counts. Three finish textures, roughness-map samples, paper/plastic bump samples and a few static world-space wear operations increase shader work; no post pass is added. Texture counts are 50 desktop / 48 touch in the final explored run (baseline 47 / 34 after fewer views), so not all of that difference represents newly allocated assets. A real-phone thermal/profile pass is still needed.

TypeScript, ESLint and the production Webpack build pass. The five-path suite passes 21 named checks with no page or console errors. The final portrait-only recheck and fallback checks also pass; its separate report is `visual-qa/room/lock/portrait/report.json`, merged into the main report without replacing unaffected desktop recordings.

After the monitor scroll-pose integration fix, the entire five-path suite is rerun successfully, including zero-progress assertions before and after the normal handoff. The final main report/recordings supersede the earlier portrait-only merge. Separate audio signal analysis measures approximately −52.04dBFS RMS / −35.92dBFS peak, with no NaNs or clipping; this validates the captured signal, not subjective Foley quality.

The suite drives real desktop walking/raycast interactions, collision stops and all main discoveries; mobile uses its actual touch swipe/buttons, not injected renderer teleports. It also checks notebook lift/return, pointer release, recovery, same-DOM monitor identity, resize, reduced motion, session bypass, skip, section links, no-JS and denied WebGL fallback. Reproducible frames cover the requested sequence at 1440, 1024 and 390, with a separate resize recording and reduced-motion alternative.

Screenshots: `visual-qa/room/lock/`. Silent full-sequence videos: `visual-qa/room/lock/recordings/desktop.mp4`, `desktop1024.mp4`, `mobile.mp4`, `resize.mp4`, `reduced.mp4`. Actual captured Web Audio is muxed into the corresponding `*-with-room-audio.mp4`; alignment uses browser start timestamps and is approximate, not sample-accurate AV sync. Separate audio: `visual-qa/room/lock/audio/room-tone-0.webm`. The capture is of the real Web Audio graph, not a mocked soundtrack. The gallery is `visual-qa/room/lock/index.html`.

The recordings include an automated session-bypass reload at the end. The existing website entrance animation restarts on that explicit reload; it is not another room handoff. The resize recording deliberately changes viewport aspect and is letterboxed within its fixed capture dimensions.

Whole-video contact sheets at 2fps are inspected across the recordings, together with individual full-size frames. This tool environment does not provide human real-time playback or listening; do not misdescribe frame review and signal analysis as having watched/listened in real time. The gallery provides both silent and audio versions for that review.

## Remaining weaknesses / lock boundary

- Room lighting is direct + hemisphere + cached/fake contact, not baked indirect transport; some close shelf/model intersections remain flatter than the desk. It is not Control/Lusion-level rendering.
- Distant exterior remains a soft spherical photo with no true distant translation parallax. Only the near sill/lip has real depth. Glass uses a restrained alpha treatment, not physically accurate transmission/reflection.
- Notebook motion is a small in-world lift/reframe, without hands, limited rotation or a physical page-turn simulation. Its handwriting is font-based, and the paper corners still read cleaner than a heavily used real notebook.
- Synthesized Foley is lighter and less distinctive than carefully recorded physical sounds. Audio level/output-device and human listening review remain necessary.
- Existing portfolio geometry/animation continues inside the monitor. Its later animation is not redesigned to hide unrelated website issues.
- Chromium emulation does not establish Safari/iOS pointer, graphics, audio or thermal performance. Real-phone testing remains required.

No more prologue content or mechanics are planned. The next milestone is the actual portfolio. The implementation is frozen at this tested pass, with these quality limitations explicitly recorded rather than calling it photoreal or claiming every subjective criterion has been proven.
