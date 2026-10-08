# Information Collapse — implementation review

Historical review of the printed-sheet prototype. The current interior replaces its panels with fractured letter geometry; see `reality-fracture.md`. Measurements and recordings below describe the earlier prototype, not the revised interior.

## Scope and architecture

The isolated `/lab/event-horizon` route remains the approval surface. Homepage sections, destruction entrance, and project pages are untouched. Existing Schwarzschild ray integration, native scroll driver, lazy renderer loading, quality reduction, Skip/Escape, reduced-motion preference and context-loss fallback remain.

One WebGLRenderer owns two passes: the existing fullscreen spatial black-hole shader, then an instanced 3D archive. No second canvas/context. No new dependency, Blender asset, physics engine or downloaded texture.

## Timeline

- 0–.59: existing exterior, remapped into a shorter approach.
- .575–.69: overlap with archive; subdivided sheet vertices stretch into depth while their ink stays registered.
- .665–.73: two authored depth anomalies: a receding sheet and a returning earlier sheet. These are deliberately limited, not a full causality simulation.
- .69–.77: camera travels through the archive. 240 desktop / 96 mobile thin sheets; only 20 carry readable authored content. Shared canvas atlas, material and instanced draw. Far sheets stay subtle.
- .77–.853: sheets align and contract into a common 3D location; colors disappear before the ink.
- .855–.885: darkness, then point emergence.
- .89–.95: existing spatial point approach and whiteout.
- .951–.978: camera retreats from an inked plane, revealing enormous ADITYA/GAYAL letterforms.
- .979–1: registered DOM identity assembles; GPU rendering sleeps after .986.

The interior is expressive spatial art, not a relativistic model of conditions inside an event horizon. Geometry passes the perspective camera; depth attenuation, curls, yaw, and scale create the archive. Typography is sampled from a single locally generated atlas, not hundreds of text meshes. Semantic narrative remains in HTML.

## Performance budget

Archive: 80 triangles per sheet, 19,200 desktop / 7,680 mobile / 1,280 reduced, plus one fullscreen triangle. Maximum two draw calls per rendered frame. Two additional generated atlases: 2048² archive and 2048×1024 identity, roughly 24 MiB uncompressed RGBA GPU allocation combined, no network texture bytes. No mipmaps. Existing internal resolution cap and ray-step tiers remain. This GPU memory is a meaningful cost, despite small JS growth.

All transforms derive from scroll uniforms. No idle animation loop and no per-frame React state. Geometry/materials/textures dispose on unmount or context loss. Dataset instrumentation now exposes draw calls, triangle counts, textures, frame count and internal resolution.

## Audio

See `audio-sources.md`. Three CC0 ambient layers replace the runtime trailer selection. Explicit activation only, actual zero gain at singularity/white point, existing homepage music retained. Approximately 4.8 MB new optional audio. Subjective audition remains outstanding.

## Critical limitations

- Causality anomalies are subtle; their intended impossibility is not yet guaranteed perceptually obvious.
- The sheets are stylized translucent surfaces, without volumetric lighting or physical cast shadows.
- Sheet blending uses one instanced transparent pass, not per-sheet sorting; the acetate treatment tolerates overlaps but is not physically exact.
- Reformation still crossfades printed name into the final DOM composition; it is continuous on one route but not a perfect letter-for-letter registration.
- The final fragment phase compresses the collective archive rather than a fully authored individual DEVELOPER → BUILDER → ADITYA removal sequence.
- Fallback preserves content and basic dark/white sequence, not the full archive story. Reduced motion uses 16 static-depth sheets and immediate progress, with no plunge/stretch.
- Audio needs human listening review and loop seam audition.

Do not call this visually approved based on compilation. Review the contact sheets and recorded motion before expanding scope.

## Recorded QA — 2026-10-07

- Production webpack build, TypeScript and focused ESLint passed.
- Desktop motion study: Intel Iris Xe / ANGLE OpenGL ES 3.2, headless Chromium, 1440×1000, capture active. 2,199 RAF samples: median 16.7 ms, p95 16.8 ms, p99 33.4 ms, maximum 233.4 ms. 2,049 rendered frames; zero additional draws in the idle observation. These are browser delivery timings with screencast overhead, not a universal hardware FPS guarantee.
- Initial SwiftShader recording was much slower (p95 1,533 ms). It is retained as `software-render-report.json`; do not cite it as representative native-GPU performance. Software-only graphics remain a weakness.
- Archive instrumentation: two draw calls / 19,201 triangles desktop; two / 7,681 mobile. Outside archive: one fullscreen triangle. Three atlas textures total, including the existing exterior type atlas.
- Responsive captures: 1440, 1024, 768, 390, 320. No horizontal overflow found. Portrait printed-name camera distance corrected after inspection.
- Escape moved focus to `identity-title`; forced context loss entered fallback without uncaught exceptions. No-JS and reduced-motion captures included. Phone widths are emulated, not real-device touch/performance testing.
- Audio browser assertions: zero initial requests; successful explicit activation; all four Web Audio gains exactly zero at .885; only light layer audible at reformation; all media paused after off. No uncaught errors.
- Dependency change: none. Added optional audio: 4,805,951 bytes. Combined changed-source gzip increased 3,104 bytes (not a compiled route-bundle measurement). Current all-chunk JS gzip total 612,765 bytes; no like-for-like production baseline build was retained, so exact bundle delta is not claimed.
- Artifacts: `visual-qa/information-collapse/` (gitignored local QA). `motion-study.mp4`, `motion-contact-sheet.jpg`, `motion-report.json`, `responsive-report.json`, `audio-report.json`, width/progress PNGs, reduced/no-JS captures. Motion was inspected through full-duration sampled frames; this is not a claim of a human playback audition.

Final portrait polish: the cheap post-whiteout ink-plane pass raises internal pixel ratio up to 1.5 (1.5-million-pixel cap) so the reconstructed name is sharper. Reversing scroll restores the expensive exterior's lower resolution. This does not raise the ray-tracing budget.
