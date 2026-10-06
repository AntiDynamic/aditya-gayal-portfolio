# Aditya Gayal — portfolio

An in-progress personal portfolio built around **The Folded Field**, a vivid editorial identity with tactile interaction and connected visual systems.

The skippable **Break the Surface** entrance now has one breakable enamel corner. Tap/click for pressure, or hold and release for a stronger hit; keyboard users can use Enter or hold Space. The printed fragment carries its typography into the break, revealing a deeper cobalt cavity. Reset restores the surface. Sound is not enabled.

Behind the entrance, the identity-first homepage opens with the Reveal Key exploring five thought states, followed by Aditya’s approach to coding and collaboration, recurring curiosities, concise project links, and direct contact details. Continuum’s deeper experience remains available in an expandable section under Work. `DESIGN.md` documents the approved visual system and implementation boundaries. [Stage C review](docs/entrance-stage-c.md) records the prototype’s scope, measurements, and remaining limits.

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

Next.js App Router, React, TypeScript, Tailwind CSS v4, and React Three Fiber for sequential entrance and hero scenes. Essential copy and project links remain in HTML; both WebGL scenes are lazy enhancements with SVG fallbacks. The entrance unmounts before the hero scene loads.
