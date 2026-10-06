# Aditya Gayal — portfolio

A personal portfolio built around **The Folded Field**, a vivid editorial identity with tactile interaction and connected visual systems.

The skippable **Break the Surface** entrance now has one breakable enamel corner. Tap/click for pressure, or hold and release for a stronger hit; keyboard users can use Enter or hold Space. The printed fragment carries its typography into the break, revealing a deeper cobalt cavity. Reset restores the surface. Sound is not enabled.

The same Reveal Key lives inside the opening and travels into the hero during a skippable 1.1-second passage. Behind the entrance, the identity-first homepage opens with the Reveal Key exploring five thought states, followed by Aditya’s approach to coding and collaboration, recurring curiosities, concise project links, and direct contact details. Continuum’s deeper experience remains available in an expandable section under Work. `DESIGN.md` documents the approved visual system and implementation boundaries. [Stage C.5 review](docs/entrance-stage-c5.md) records the geometry pipeline, motion phases, measurements, and remaining limits. The previous [Stage C review](docs/entrance-stage-c.md) is preserved.

## The playable notebook

The approved [Experience Architecture V2](docs/experience-architecture-v2.md) is implemented across the homepage:

- **Reveal:** an articulated aperture changes thought states, color, and typography.
- **Trace:** authored wrong turns and clues in a branching question.
- **Connect:** ten interests, eight authored relationships, magnetic words, and distinct inspection/city/agent graphics.
- **Break / rebuild:** a lazy physical assembly with fifteen material pieces, three supports, registered print, persistent damage, and a different repaired arrangement.
- **Change:** another perspective enters as a tracing overlay and reroutes the idea.
- **Open:** five projects share one graphic stage; GitHub links remain direct.
- **Move:** recurring questions on notes that can be arranged and turned over.
- **Send:** the final trace resolves toward email, with GitHub and LinkedIn alongside.

`DESIGN.md` is the implementation contract. [Build and review](docs/experience-v2-build.md) records visual QA, accessibility, performance measurements, and limits. Current questions are presented as recurring interests, not invented live activity. Sound stays off; no sound system or additional dependency was added.

## Run locally

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Checks

```bash
pnpm lint
pnpm build
```

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS v4, and React Three Fiber for a scoped entrance/hero world and a separate lazy build assembly. Essential copy and project links remain in HTML; WebGL is a lazy enhancement with HTML/SVG fallbacks. Entrance geometry is removed after passage while the Key and renderer persist. The build assembly mounts near its section and is disposed offscreen.

## Signature geometry

Blender CLI authors only the enamel fragment, folded bracket, and rubber restraint. The rest remains procedural. With Blender 4.5 LTS installed locally, regenerate both responsive GLBs with:

```bash
blender -b --factory-startup --python scripts/blender/build-entrance-break.py
```

Append `-- --preview` for a neutral CPU render. Asset provenance and output sizes are recorded in [ASSETS.md](public/entrance/ASSETS.md). Blender is an authoring tool, not a website dependency.
