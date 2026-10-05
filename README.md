# Aditya Gayal — portfolio

An in-progress personal portfolio built around **The Folded Field**, a vivid editorial identity with tactile interaction and connected visual systems.

The identity-first homepage opens with the Reveal Key exploring five thought states, followed by Aditya’s approach to coding and collaboration, recurring curiosities, concise project links, and direct contact details. Continuum’s deeper experience remains available in an expandable section under Work. `DESIGN.md` documents the approved visual system and implementation boundaries.

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

Next.js App Router, React, TypeScript, Tailwind CSS v4, and React Three Fiber for the single hero artifact. Essential copy and project links remain in HTML; the WebGL object is a lazy enhancement with an SVG fallback.
