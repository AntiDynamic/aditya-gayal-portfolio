# Repository cleanup

The active import graph was traced from both App Router pages and the root layout, including dynamic imports and CSS modules. Room models, texture templates, generated Foley filenames, and Next.js metadata icons were checked separately.

## Removed

- 48 unused source files: retired entrance, identity journey, personal widgets, Reveal Key, old build scenes, stylesheets, and the Vanta declaration.
- Four obsolete asset/Blender helpers and 15 design reports for retired experiments.
- Unmounted sound-control UI, its context/toggle state, and audio elements whose gains were permanently zero. The two audible prologue media layers retain the same selection and gain envelopes.
- Four unused direct dependencies: React Three Fiber, GSAP, Lenis, and Vanta. The lockfile was updated with the project's existing pnpm store.
- 21 unused public assets, three old documentation images, and 2,696 obsolete QA artifacts. Total removed asset bytes: **1,129,837,096** (about 1.13 GB decimal).
- Unused global styles and tokens: **1,819 → 68 lines**. Shared reset, typography, focus, selection, and screen-reader styles remain.

No standalone personal photographs were found. Removed images were retired textures, reference screenshots, and generated QA imagery.

## Retained

The current mechanism portfolio, black-hole and room renderers, room asset pipeline, required licensed assets, provenance records, project data, and current regression evidence remain. Instructions, Git metadata, environment files, and unrelated user changes were not reset.

README and DESIGN now describe the current experience. The content provenance document is named `docs/portfolio-content-sources.md`.

## Verification

Production build and lint pass. The source import audit finds no missing local modules. Responsive portfolio checks pass at 1440, 1024, and 390 pixels, including reduced motion, anchor navigation, and content without JavaScript. The full desktop room-to-monitor regression passes. A focused production audio check verifies the remaining black-hole mix and silent interior/singularity after removal of the muted tracks.

Evidence: `visual-qa/mechanism/report.json`, `visual-qa/mechanism/room/report.json`, and `visual-qa/audio/cleanup/report.json`.
