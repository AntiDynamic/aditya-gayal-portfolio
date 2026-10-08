# Work-room polish pass

The newer walking-choice and future-workspace refinement is documented in [room refinement](room-refinement.md). The measurements below describe the preceding polish build, not that newer build.

This pass preserves the existing room, black-hole renderer, discovery systems and portfolio. It improves the first playable rather than adding another experience. The approved sequence remains black hole → white point → ceiling light → room → computer → existing website.

## Review and scope

Reviewed the existing dirty worktree and diffs before editing, the running room, desktop/mobile captures, current collision and interaction code, and the latest available local QA recordings. The recordings were decoded across their whole duration into one-second contact sheets, with denser five-frame-per-second handoff sheets. This is not a claim of human real-time video playback. No newer user-supplied video file was available in this workspace.

The supplied screenshot's stuck-selection issue was reproduced with focus left on a viewpoint button. Game keys now work after selection, without forcing canvas focus. A second regression was caught during this pass: the interactive reticle intercepted drag-look and opened inspection. The reticle is now a pointer-transparent visual indicator; drag gestures cannot become inspection clicks.

No new room, quest, inventory, physics engine, full-body player, game framework or black-hole effect was added. The lower portfolio is unchanged apart from the requested opening copy and integration behavior.

## Layout and unfinished work

- The 6.4 × 5.6 × 3.15m shell and approximately 0.77m desk remain. Adult eye height is 1.65m; the natural 52° camera remains.
- The second chair turns away from the first, with an extension cable nearby. Uneven books occupy a lower shelf while another shelf stays mostly empty.
- The open notebook is skewed rather than squared. A pen crosses its page. A storage device is partially opened, its removed lid beside it, its short cable unplugged into an ugly adapter.
- A small folded route print, source screwdriver, paper shim and drink ring suggest an interrupted repair/debugging session. No added caption explains this.
- The drawer is slightly ajar. No random prop scatter or uniformly dirty material was introduced.
- Physical support was audited against actual imported geometry: desk top 0.7698m, shelf tops 0.715m and 1.371m. Notebook, pen, print, device, keyboard rubber feet and atlas patches now meet the surface. City model and timeline plates meet their shelves; elevated plates have spacers. Tape touches the printed diagram, and board scraps have pin heads.

## Materials and motivated lighting

The desk and shelf retain their CC0 source models. Their hero maps increase from 512 to 768 pixels, with conservative roughness and four-times anisotropy. The shelf normal-map strength is reduced instead of exaggerating its grain. Small rounded geometry is limited to the monitor casing, keyboard, notebook cover and storage/adapter parts.

One original 1024px causal-wear atlas supplies nine merged surface patches: restricted forearm rubbing, hardware scratches, drink/contact marks, chair-path scuffs and a bezel fingerprint patch. These are not a blanket dirt layer. The notebook has curved page geometry, merged thin page edges, gutter shading and uneven paper tones. The handwriting is authored Canvas copy using the licensed Caveat font, not Aditya's actual handwriting.

The fluorescent is a down-facing rectangular area light, not a ceiling point-source halo. Its custom Blender housing has a thick, beveled diffuser and metal clips. A tiny original map adds restrained ribbing and edge dirt. Startup settles rather than endlessly flickering. Cool overcast window illumination supplies depth; the desk lamp starts off, then warms the notebook and desk after inspection with a small relay sound. Monitor light remains modest until approach. There is one cached 1024px desktop shadow map, no mobile shadow map, and no added bloom, SSAO, realtime GI or postprocessing chain. This still lacks high-quality baked indirect/contact lighting.

## Reveal, movement and inspection

The white hold, imperfect ignition and exposure settling are retained. Standing movement now begins later, leaving more time to recognize the ordinary diffuser before orientation changes. Full wake lasts approximately 7.7 seconds; reduced motion retains its short static reveal.

Movement is slower at 1.32m/s with separate acceleration/deceleration damping and predictable axis-separated collision. Movement-only sway is at most 1.5mm, disabled for reduced motion. Footsteps follow actual distance traveled rather than running continuously when blocked. There is no idle camera shake or strong head bob.

Camera/inspection easing uses a C2-continuous quintic curve. Notebook inspection remains a physical scene framing, not an inventory overlay. Its pen is part of the same interaction target; paper handling is brief and quiet. Back/E/Esc returns once without immediately reopening. The existing guided views and readable transcripts remain keyboard alternatives to aiming.

The desktop reticle is just a dot and tiny E when relevant. The Escape instruction appears briefly once. Permanent movement instructions, sound switches and animation-enable/pause switches are removed. Skip remains visible and keyboard reachable; the unlocked navigation alternative is collapsed by default. Mobile keeps its deliberately accessible authored-view controls rather than imitating pointer lock.

## Discoveries and copy

- **Notebook:** ordinary failed fixes, unfinished diagrams, crossed text, blank space and a partly useful second page. Sparse math and incomplete notes keep it from being all exposition.
- **Working board:** smaller skewed route print, black original line, cyan correction, tiny “this?” / “yeah,” an old red crossed turn, and unrelated little scraps. The second chair reinforces the inference; there is no collaboration label.
- **Computer:** `/home/aditya`, `notes/`, `work/`, `old/`, `screenshots/`, `misc/`; “some files are damaged”; ordinary recovery. The recovered work directory has `continuum/`, `tracepilot/`, `netranagar/`, `video-editor/`, `ai4browser/`. No invented dates or reconstruction lore.
- **Project remnants:** cream city with street gaps/courtyard/dock, supported timeline plates, stacked acrylic window planes, route paper and frame strip. They remain unlabeled work artifacts rather than project exhibits.
- **Optional:** cable drawer, older adapters, uneven books, kept prototype and sparse personal scraps. No discovery count or mandatory collection gate.

The old slogan is removed from the website opening. It now says **ADITYA GAYAL**, with “I like making things and figuring out why they don't work yet.”

## Audio and automatic motion

Room audio is original Web Audio synthesis: restrained electrical hum, filtered ventilation, a soft exterior-weather layer, fan tone, paper handling, relay/drive clicks and distance-triggered footsteps. There are no third-party samples or added room music. Existing licensed music pauses during room exploration. Audio and animations default on; there are no enable-sound or enable-animation controls.

Browsers still require user activation for audible autoplay. The existing Enter room interaction, or another natural pointer/key gesture, resumes audio without a separate prompt. Sound cannot honestly be guaranteed before that gesture. System reduced-motion preferences remain honored; “always on” does not override accessibility. Audio suspends while hidden and disposes on exit. The soundtrack's deferred cleanup avoids binding one media element to multiple AudioContexts during Strict Mode or hot reload.

`scripts/room-audio-qa.mjs` records the actual browser Web Audio output, including entry, movement, notebook, lamp and recovery. This is a separate audio capture, not a soundtrack fabricated for a silent QA video. The synthetic bed still needs subjective listening on speakers/headphones; it is not equivalent to location-recorded Foley.

The captured clip is stereo Opus at 48kHz, approximately 14.1 seconds. FFmpeg analysis confirms non-silent output (overall RMS approximately −51.85dBFS, peak −37.23dBFS), no NaNs/Infs and no clipping. These figures verify a restrained signal, not the subjective quality of its sound.

## Computer becomes the website

The actual existing portfolio DOM is mounted inside the physical monitor with CSS3DRenderer. Its existing model is prewarmed while the room loads. The terminal stays visible until the portfolio renderer reports ready, with a bounded timeout for failure resilience. Terminal and real DOM crossfade over 0.65 seconds; the physical screen map is not abruptly cleared.

A 3.4-second eased camera approach carries the bezel outside the viewport. A screen-local reflection/scanline treatment fades during approach. At the end, the same DOM returns synchronously to its persistent React-owned holder, pointer lock releases, game controls stop and ordinary scrolling resumes. No route navigation, duplicated portfolio, screenshot substitute, full-frame transition overlay or loading screen is used. The CSS3D scene is cleared before DOM restoration to preserve ownership/order.

The existing portfolio canvas measures offset dimensions rather than transformed bounds, preventing a backing-resolution jump during the monitor approach. QA checks that it keeps the same dimensions across release. Model prewarming avoids the earlier uncompiled-graphics pop but cannot eliminate every browser's first-use shader behavior.

## Assets and optimization

Source provenance, creators, URLs, licenses, sizes and modifications are documented in `docs/asset-sources.md` and the public manifests. Seven existing Poly Haven models and four material maps remain CC0; Caveat retains its complete SIL OFL notice. No new third-party asset or sample is required by this pass.

Blender work: thick diffuser/clips, city street/courtyard refinement, timeline support spacers, accurate shelf support, grouped material exports and atomic model replacement. Runtime custom geometry handles the notebook/terminal/keyboard/adapter details without remodeling every source prop.

| Asset budget | Before | After |
| --- | ---: | ---: |
| Shipped scene assets, including font | 2,908,116 bytes | 3,131,464 bytes |
| Optimized sourced models | 2,116,944 bytes | 2,336,640 bytes |
| Custom shell | 498,040 bytes | 501,692 bytes |
| Sourced-model triangles | 32,975 | 32,975 |

The total increases by 223,348 bytes, 7.7%. Source models still shrink from 16,689,753 bytes to 2,336,640, and 130,035 to 32,975 triangles. Hero maps are 768px; normal props remain 512px. Generated Canvas maps add GPU storage but no downloaded files. WebP/JPEG are download compression, not GPU KTX2 compression. There are no 4K props, new decoder or expensive extra render passes.

## Performance and QA

Final measurement values are recorded in `visual-qa/room/final/qa-report.json`; baseline is `visual-qa/room/before-polish/qa-report.json`. Measurements use Chromium on Intel Iris Xe ANGLE/Mesa, not an actual phone. Mean animation-frame intervals and JavaScript render-submission durations are distinct from GPU frame time; no FPS claim is made. Browser video capture also affects timing.

| Matched view / render resolution | Calls before → after | Triangles before → after | CPU submission before → after | Mean RAF before → after |
| --- | ---: | ---: | ---: | ---: |
| Standing, 1440 × 900 | 56 → 67 | 40,059 → 41,175 | 1.69 → 2.28ms | 16.67 → 16.67ms |
| Computer, 1440 × 900, recording active | 24 → 30 | 23,830 → 24,522 | 1.34 → 1.84ms | 16.67 → 16.85ms |
| Computer, 1024 × 900 | 20 → 25 | 13,688 → 14,282 | 1.05 → 1.36ms | 16.67 → 16.67ms |
| Guided computer, 390 CSS px / 487 × 1055 render | 20 → 23 | 15,986 → 14,090 | 1.01 → 1.18ms | 16.67 → 16.67ms |

Standing texture count rises 30 → 36, computer 39 → 45, guided 36 → 42. The area-light shader adds its LTC evaluation/tables; it does not add another scene render pass. There is a real cost increase, especially standing CPU submission; these single-run averages are not a statistically controlled benchmark. Frame intervals remained paced in this desktop run, but that does not establish phone performance or absence of occasional transition hitches. Final mobile culling sees fewer triangles in the repositioned composition despite slightly more draw calls.

Production validation: TypeScript, ESLint and `pnpm build` using the existing Webpack configuration. The QA suite covers viewpoint-focus regression, drag/click separation, movement/collision, deliberate pointer lock, Escape, physical monitor UV clicks, completion/session repeat, skip, replay, direct section URLs, mobile guided scroll, reduced motion, no-JS, WebGL failure, handoff resize/hash and injected visibility pause/resume. Audio activation is checked after normal entry gestures. Hardware/browser background throttling is not proven by an injected visibility event.

The full suite passes 30 named checks: seven selection/control regressions, nineteen main flow/fallback checks and four handoff/session edge cases. It captures 58 screenshots, plus separate actual audio output. Main QA reports no page errors or unexpected console errors; deliberately denied WebGL contexts produce expected diagnostics. Recordings run approximately 67 seconds desktop and 51 seconds guided mobile at a 25fps capture setting, which is not renderer FPS.

- Screenshots: `visual-qa/room/final/`, at 1440, 1024 and 390 CSS pixels.
- Stable video paths: `visual-qa/room/final/recordings/prologue-desktop.mp4` and `prologue-mobile.mp4`.
- Actual audio: `visual-qa/room/final/recordings/room-tone.webm`.
- Whole-recording and dense handoff sheets: `visual-qa/room/final/review/`.
- Review gallery: `visual-qa/room/final/index.html`.
- QA helpers: `scripts/room-qa.mjs`, `room-selection-qa.mjs`, `room-edge-qa.mjs`, `room-audio-qa.mjs`, `room-review.mjs`.

Desktop preserves movement and mouse look. Mobile has scroll/swipe/tap viewpoints without virtual sticks, capped 1.25 render DPR, no dynamic shadows and fewer active details. Reduced motion avoids forced travel and ignition flicker. Direct links, skip, completion memory and failure paths continue to reveal the original accessible portfolio; no-JS does not depend on the game.

## Critical assessment

The warm desk, physical repair details and quieter interface are substantially more believable than the earlier playable. That does not make this photoreal or equivalent to Tacoma/Control material quality. The room is still sparse and several custom props, especially project artifacts and keyboard, read as simple geometry. Shelf grain is still soft very close up; contact/bounce lighting could be stronger. Notebook copy uses one font and could look less typeset with a small set of authentic handwritten scans. The source chairs have no casters, so the nearby cable is plausible clutter, not an implemented trapped caster story.

The next quality improvement should be targeted desk contact/baked indirect lighting and a few better close-up hero surfaces, not more architecture or mechanics. The monitor handoff needs final subjective review in real-time playback and real Safari/iOS/Android hardware, including browser zoom. This pass does not claim that all cinematic success criteria are approved from screenshots or emulation alone.
