# Event Horizon Lab — review

**Route:** `/lab/event-horizon`
**Scope:** an isolated threshold prototype. The production homepage remains untouched.

## Narrative and scroll phases

| Progress | Phase | Visible consequence |
| --- | --- | --- |
| 0.00–0.08 | Prelude | Near-black field and a faint spatial anomaly. |
| 0.08–0.24 | Reveal | The shadow, warped stars and accretion disk become legible. |
| 0.24–0.48 | Approach | The observer moves inward; lensing and disk wrapping intensify. |
| 0.48–0.64 | Strong lensing | The disk takes peripheral space and semantic type starts to warp. |
| 0.64–0.76 | Tidal type | Text and traces stretch along the same gravitational direction. |
| 0.76–0.82 | Collapse | Visual information simplifies toward darkness. |
| 0.82–0.865 | Silence | A restrained near-black hold. |
| 0.865–0.89 | Point | One controlled white point restores orientation. |
| 0.89–0.95 | Whiteout | The observer reaches the point; white spatially overtakes the viewport. |
| 0.95–1.00 | Reformation | Rules, name, role and headline regain order. |

## Rendering boundary

The black-hole field is a fullscreen WebGL fragment render, not a video, sprite, SVG, or CSS radial treatment. It receives a three-dimensional observer position and ray direction, bends rays toward a gravitational center, intersects a disk plane along those rays, and uses the path to shade the warped disk, black-hole shadow, background field, and decorative typography. The white-point transition is also spatial: a projected ray-sphere reach grows as observer travel progresses.

Semantic text, navigation, skip control, focus target, and identity remain in DOM. The canvas is decorative enhancement.

## Quality and lifecycle

- One native-scroll scalar drives the scene; no scroll-linked React rendering.
- The renderer uses a fullscreen triangle, procedural stars, an in-memory type atlas, and no model or texture downloads.
- Initial internal scale is capped by an approximately 950k-pixel budget: desktop targets 0.85, mobile 0.70, then clamps further as needed by viewport area.
- Shader work uses 224 maximum steps on desktop and 144 on mobile. Sustained slow frames can step the active scale down once; it does not continuously oscillate.
- Rendering pauses when the document/experience is hidden and stops after the identity handoff settles.
- Reduced motion uses a shorter semantic route without rapid plunge, tidal stretching, or camera impulse.
- Optional music starts only on explicit activation. The space score rises through approach, fades during collapse, and hands off to the calmer portfolio loop at the white point. The control is part of the intro navigation. Both local CC0 tracks are listed in `public/audio/ASSETS.md`.

## QA record

Visual review was captured at 1440, 1024, 768, 390, and 320 pixels, including desktop and mobile contact sheets. Tested interaction paths include native scroll, mouse/touch input, keyboard skip, Escape, direct `#identity` navigation, reduced motion, a forced WebGL failure fallback, and no-JavaScript semantic content.

The final desktop motion study recorded 38,615 ms with 2,317 animation-frame samples: median 16.7 ms, p95 16.7 ms, p99 16.8 ms, max 16.8 ms. This is a local Intel Iris Xe browser capture, not a claim of universal device performance. The capture ended with zero idle draws, no reported exceptions, and no reported console errors in the normal path.

Local, ignored QA artifacts:

- `visual-qa/event-horizon/contact-sheet-desktop.jpg`
- `visual-qa/event-horizon/contact-sheet-mobile.jpg`
- `visual-qa/event-horizon/event-horizon-motion.mp4`
- `visual-qa/event-horizon/motion-report.json`
- `visual-qa/event-horizon/qa.json`

## Remaining limitations

- The finest photon-ring and type-filament detail can shimmer at the lowest mobile quality tier.
- The interior crossing is an intentional art-directed collapse after the exterior ray integration. It is not a research-grade horizon-piercing general-relativity solver.
- The capture validates the local browser/GPU path; cold-load and physical-device profiling remain work for a later integration pass.

See [event-horizon-references.md](./event-horizon-references.md) for reference boundaries and attribution.
