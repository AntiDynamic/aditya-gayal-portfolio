# Aditya Gayal — portfolio

An in-progress personal portfolio built around **The Folded Field**, a vivid editorial identity with tactile interaction and connected visual systems.

The current site includes a responsive homepage, the interactive Reveal Key, a Continuum project experience, an About section centered on how Aditya thinks and collaborates, and direct contact links. `DESIGN.md` documents the approved visual system and implementation boundaries.

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
