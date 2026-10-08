# Animation research and provenance

The implementation uses existing Three.js plus one new dependency: Lenis 1.3.26 (MIT). No R3F, GSAP, Drei, or Theatre runtime was added. Our original imperative director is smaller than introducing a second renderer solely to track five images.

## Technical references inspected

- [14islands r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig), MIT: `useTracker`, pixel-unit perspective camera, shared global renderer. Adopted DOM-owned rectangles and one canvas; no library source copied.
- [14islands Codrops tutorial](https://github.com/14islands/codrops-scroll-rig-tutorial), MIT: inspected `Image.jsx` and progressive enhancement. Adopted native image fallback, not the lens design.
- [Codrops tutorial article](https://tympanus.net/codrops/2023/10/10/progressively-enhanced-webgl-lens-refraction/): studied image enhancement without rebuilding layout inside WebGL.
- [HAOQI technical case study](https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/): studied shared scroll snapshot, pointer state, rectangle cache, velocity attack/release, and the separate-RAF lag problem. Our director performs scroll advancement, DOM writes and WebGL rendering in one callback. Article code was not pasted.
- [Lenis](https://github.com/darkroomengineering/lenis), MIT: inspected installed documentation and manual-RAF integration. `autoRaf: false`; no separate GSAP ticker. Touch remains native.
- [React Three Fiber examples](https://github.com/pmndrs/react-three-fiber/blob/master/docs/getting-started/examples.mdx), MIT project: examined HTML/WebGL integration patterns; no R3F runtime added.
- [Drei View](https://drei.docs.pmnd.rs/portals/view), MIT project: evaluated shared-context viewport tracking. Unnecessary for a single scene containing image planes.

## Creative references

- [Unseen Studio](https://unseen.co/): image-led direction and restraint.
- [Inside Unseen Studio](https://tympanus.net/codrops/2026/07/20/the-craft-behind-memorable-digital-experiences-inside-unseen-studio/): revisited during elevation for concept-driven movement rather than effect accumulation. Article/design were studied, not copied.
- [Lusion Oryzo UI breakdown](https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations): material restraint, pacing and coherent transitions.

These are research references, not asset sources. No reference-site graphics, fonts, models, layouts or recognizable shots were copied.

## Shipped assets

- `public/media/personal/sources.json`: only the approved third/fourth photographs from the supplied WhatsApp folder. User-provided rights; no stock portraits. Metadata stripped, two WebP sizes each.
- `public/media/work/sources.json`: actual TracePilot and NetraNagar UI captures plus an explicitly identified Continuum documentation plate. TracePilot Apache-2.0; Continuum MIT. NetraNagar is the user's project representation, not a claimed third-party CC0 asset. OpenStreetMap attribution remains visible and linked.
- Existing room assets and audio retain their original provenance in `docs/asset-sources.md` and `docs/audio-sources.md`.

No Blender assets or soundtracks were added in the original editorial pass. The subsequent reliability/interactions pass adds an original synthesized optional soundtrack, documented in `docs/portfolio-repair.md`; no third-party audio samples were added.
