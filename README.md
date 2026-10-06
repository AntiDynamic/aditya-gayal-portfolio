# Aditya Gayal — portfolio

A personal portfolio built around **The Folded Field**, a vivid editorial identity with tactile interaction and connected visual systems.

The skippable **Unfold the Surface** entrance opens through native scrolling. Printed paper curls around a hinge, the thick enamel counterweight swings aside, and a restrained camera approach exposes a deeper cobalt space. Typography and shadows follow the actual deformed geometry. Wheel, touch swipes and keyboard scrolling share the same reversible passage; the opening control can play it automatically. No impact targets or repeated clicking are required. Sound is not enabled.

The same Reveal Key lives inside the opening and travels into the hero without creating a second renderer. Returning visits bypass the threshold during the session; append `?entrance=1` to replay it. Direct section links and reduced motion go straight to readable content. Behind the entrance, the identity-first homepage opens with the Reveal Key exploring five thought states, followed by Aditya’s approach to coding and collaboration, recurring curiosities, concise project links, and direct contact details. Continuum’s deeper experience remains available in an expandable section under Work. `DESIGN.md` documents the approved visual system and implementation boundaries. [Scroll-opening review](docs/unfold-passage.md) records this pass. The [Stage C.5 review](docs/entrance-stage-c5.md) and [Stage C review](docs/entrance-stage-c.md) preserve the earlier prototype and geometry pipeline.

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

`DESIGN.md` is the implementation contract. [Build and review](docs/experience-v2-build.md) records visual QA, accessibility, performance measurements, and limits. Current questions are presented as recurring interests, not invented live activity. Sound stays off. The [motion refinement](docs/motion-libraries.md) adds GSAP choreography, Lenis wheel scrolling and a bounded Vanta surface that responds to curiosity pairings.

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

Next.js App Router, React, TypeScript, Tailwind CSS v4, and React Three Fiber for a scoped entrance/hero world and a separate lazy build assembly. GSAP orchestrates structural motion and passage; Lenis smooths wheel input after entry; Vanta WAVES supplies one bounded, lazily loaded curiosity surface. Essential copy and project links remain in HTML; WebGL is a lazy enhancement with HTML/SVG fallbacks. Entrance geometry is removed after passage while the Key and renderer persist. The build assembly mounts near its section and is disposed offscreen.

## Signature geometry

Blender CLI authors only the enamel fragment, folded bracket, and rubber restraint. The rest remains procedural. With Blender 4.5 LTS installed locally, regenerate both responsive GLBs with:

```bash
blender -b --factory-startup --python scripts/blender/build-entrance-break.py
```

Append `-- --preview` for a neutral CPU render. Asset provenance and output sizes are recorded in [ASSETS.md](public/entrance/ASSETS.md). Blender is an authoring tool, not a website dependency.
