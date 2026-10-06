# Aditya Gayal — portfolio

A personal portfolio built around **The Folded Field**, a vivid editorial identity with tactile interaction and connected visual systems.

The homepage now begins with one **continuous identity journey**: question → observation → connections → persistence → another perspective. A perspective camera travels through four physical stations. Thick Blender-authored ribbon forms separate, rearrange and align; physical print belongs to their UVs. Large HTML typography moves from the same scroll value. Wheel, touch and keyboard scrolling are enough; direct navigation to Work is always available.

There is no default click/destruction gate. Work, recurring questions, email, GitHub and LinkedIn follow the personal story. Reduced motion and no JavaScript receive a normal chapter stack; WebGL failure retains the authored SVG illustration. Sound remains off. The former entrance, Reveal Key and personal widgets are preserved in source, but not mounted on the default homepage. Historical `?entrance=1` no longer selects the archived gate.

## The playable notebook

The earlier [Experience Architecture V2](docs/experience-architecture-v2.md) remains a record of the previous pass. The current direction and remaining work are documented in:

- [Current problems](docs/CURRENT_PROBLEMS.md): recording-grounded audit and reference comparison.
- [Resource map](docs/RESOURCE_MAP.md): tools, source references and ownership.
- [Experience roadmap](docs/EXPERIENCE_ROADMAP.md): scene storyboards and future work.
- [Journey build/review](docs/JOURNEY_REVIEW.md): actual desktop/mobile images, motion sequence and measured performance.

`DESIGN.md` §21 is the current implementation contract. Historical [build and review](docs/experience-v2-build.md), [scroll-opening review](docs/unfold-passage.md), and [Stage C.5](docs/entrance-stage-c5.md) preserve earlier work. Current questions remain recurring interests, not invented live activity.

## Run locally

```bash
pnpm dev
```

Open `http://localhost:3000`.

If you see a still illustration and stacked chapters, your browser may be requesting reduced motion. Use **Enable animation** above the headline to opt into the 3D scroll journey. **Pause animation** returns to the reading view. The website respects the system preference by default; no system setting needs to change.

## Checks

```bash
pnpm lint
pnpm build
```

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS v4 and one lazy React Three Fiber identity world. GSAP/ScrollTrigger orchestrate numeric motion; CSS sticky supplies the bounded stage without scroll interception. Lenis smooths wheel input, with native touch/anchors. Essential copy and links remain server-rendered HTML. Vanta and old build scenes remain installed/in source but are not mounted by this homepage. Rendering sleeps after motion settles.

## Signature geometry

Blender CLI authors the three named curved parts of the Question Relay. Regenerate with:

```bash
blender -b --factory-startup --python scripts/blender/build-question-relay.py
```

Provenance and geometry sizes are recorded in [model assets](public/models/ASSETS.md). The historical break script and [entrance assets](public/entrance/ASSETS.md) remain reproducible. Blender is an authoring tool, not a website dependency.
