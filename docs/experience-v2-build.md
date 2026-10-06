# Experience V2 — build and review

Built against the approved [architecture](experience-architecture-v2.md) and [DESIGN.md](../DESIGN.md). The homepage remains about Aditya: questions, persistence, coding, and another person's perspective. Work is supporting evidence later in the story.

## What changed

| Scene | Visitor action | Response / meaning | Medium |
| --- | --- | --- | --- |
| Threshold | Pressure the existing enamel corner; hold for a stronger hit; enter or skip | Persistent structural damage opens the cobalt cavity. The same Key waits inside and arrives in the hero. | Existing Blender GLBs, R3F, DOM/SVG fallback |
| Hero | Drag the Key, use arrows/Home/End, or select a thought | Bounded inertia, articulated blade, changing solid color, decorative typography displacement, and a thought visible through the aperture. Five states describe thinking, not projects. | DOM/SVG + shared R3F renderer |
| Thinking | Choose a route and follow a clue | An authored dead end, loop, or upstream change. The answer develops through investigation. | DOM/SVG |
| Curiosity | Arrange topics with the mouse, or select two topics by tap/keyboard | Eight authored relationships reveal a specific question and inspection, city, or execution graphics. Whole words respond to proximity; arbitrary pairs do not generate invented connections. | DOM/CSS/SVG |
| Messy Middle | Tap/press a material piece or test a support; rebuild at any time | Fifteen physical pieces remember damage; three dependencies redistribute load. Rebuilding produces a different arrangement and reconnects the trace. | Lazy R3F, DOM controls and fallback |
| Collaboration | Introduce another view by button or bounded drag | A tracing overlay crosses out an assumption and redirects the route. “My first pass” becomes “Our better version.” | DOM/SVG/CSS |
| Work | Select one of five projects; open its repository | One shared visual stage changes between time traces, repair, city signals, timeline cuts, and browser layers. | DOM/SVG |
| Now | Turn over or arrange a note | Three recurring questions expose a related thought. These are open questions, not claims about today's work. | DOM/CSS |
| Contact | Focus or hover the email | The loose trace resolves into an arrow. Email, GitHub, and LinkedIn stay direct links. | DOM/SVG/CSS |

The main copy remains “STRANGE QUESTIONS. USEFUL SYSTEMS.” Project data and repository links are preserved. Continuum's existing deeper experience remains in a native expandable Work section. No new project pages were created.

## Architecture and resources

- `src/app/page.tsx` remains a Server Component. Semantic headings, descriptions, navigation, project links, and contact information are HTML.
- `EntranceGate` owns meaningful entrance phases. A stable `WorldContext` binds hero bounds, thought state, and transient motion through refs.
- Entrance and hero share one lazy renderer and one original Reveal Key. The passage uses the actual fracture polygon centroid and a common opening transform, so the sculpture expands around the same destination object. The canvas is not exposed as the hero until its first hero frame has rendered.
- A direct `#work`/`#contact` visit bypasses the entrance. The hero scene waits until the visitor returns toward it. The physical build scene mounts near its section and releases its scene resources offscreen.
- The build's visual poses and HTML hit regions use the same authored pose functions. Printed label atlases belong to their moving material groups.
- Transient transforms, velocities, camera movement, and springs never use per-frame React state. Meaningful damage, selection, repair, and entry use application state.
- Styles are scoped CSS modules. No new scene styling was added to `globals.css`. Generic page-wide fade-up was removed; `PageMotion` now tracks native navigation only.
- The Trace uses scene-local SVG/Three graphics with a common visual grammar. It is not a continuously running pointer line spanning the entire document.

### 21st.dev

The earlier architecture audit used the CLI authenticated as `gayaladitya9`, reviewed ten mechanic searches, and inspected two full sources. This execution adapts proximity falloff and magnetic behavior into an original whole-word implementation with cached bounds. It does not import a template, inherit a component's styling, or install its dependencies. The available free source-fetch quota was exhausted; no paid request was made.

### Blender and assets

The existing reproducible Blender 4.5.14 LTS pipeline is retained for the signature entrance fragment, bracket, and restraint. It was not used to model ordinary text, UI, or entire scenes. Existing responsive GLBs are 37,704 bytes desktop and 35,656 bytes mobile. No new external model, HDRI, material pack, audio, or texture was downloaded.

New geometry is original repository-native code: the articulated Key and the fifteen-piece build assembly. Twelve 512×128 print atlases and three 128×128 support marks are generated on mount, attached to their material groups, and disposed with the scene. Their base RGBA storage is approximately 3.19 MiB before mipmaps; they have no network transfer weight. See [ASSETS.md](../public/entrance/ASSETS.md).

**Dependencies added: none.** No Rapier, GSAP, Motion, Lenis, postprocessing, or component library was necessary. Existing Foley remains unloaded; the website is silent.

## Files

- World / geometry: `entrance-gate.tsx`, `entrance-scene.tsx`, `entrance.module.css`, new `world-context.tsx`, `world-instrument.tsx`, `world-layout.ts`, `reveal-instrument.tsx`, and updated `reveal-key.tsx`.
- Personal scenes: `question-branches.tsx`, `curiosity-connections.tsx` and its module, `curiosity-field.tsx`, `build-sequence.tsx` and its module, new `build-scene.tsx` / `build-poses.ts`, `collaboration-switch.tsx`, new `now-notes.tsx` and `personal-scenes.module.css`.
- Work / shell: new `work-stage.tsx`, updated `project-index.tsx`, `about-section.tsx`, `page-motion.tsx`, `page.tsx`, and new `experience.module.css`.
- Contracts / documentation: `DESIGN.md`, `README.md`, `experience-architecture-v2.md`, this report, and `ASSETS.md`.

## Reviews and fixes

### Design review — ui-ux-pro-max

The hero stays calmer than the break, personal sections use strong color, and each interaction has a distinct mechanic. The curvature/aperture of the Key, dense enamel edges, cast shadows, and registered material print give depth without a postprocessing chain. The build assembly has dominant paper/enamel forms, thinner rails, and supports instead of equally weighted cards. Work uses a shared art-directed stage rather than five repeated layouts.

Fixed during rendered review:

- Shared-canvas stacking initially covered readable headline text. Essential type now stays above the Key; decorative layers cross behind it.
- A mobile handoff initially exposed the old entrance for a frame. A first-frame readiness handshake preserves the SVG fallback until the hero is actually rendered.
- The passage originally positioned the Key beside the cut. Its source is now the cut's area-weighted centroid; the surface and Key use the same opening transform.
- A long curiosity label broke into a stray letter on phones. Its small-screen type sizing was corrected.
- Physical build label proportions, cast shadows, and HTML hit-area ownership were corrected after real screenshots. Thin-rail print is constrained by face height; support letters have square atlases. The final repair statement sits below the sculpture, never over its labels.
- “Now” is deliberately quieter; no invented dated activity or collaborator evidence was added.

### UX review — ui-design

All core information remains readable without the toys. Skip/Escape bypass the threshold and transfer focus after clearing inert content. Native controls have visible focus. Hero selection is available through buttons and slider keys. Curiosity pairs use two taps/keyboard activations. Build pieces support light activation and optional hold, with a separate support-testing control and always-available rebuild. Notes support tap/Enter to turn over and arrow keys to arrange. Collaboration and Work expose their selected state.

Reduced motion removes passage flight and kinetic repair/debris; meaningful damage, final geometry, copy, and selection remain. Native scrolling is preserved. No health bar, score, achievement, weapon, forced completion, or sound gate was added. Mouse and touch checks at 1440/390/320 verify stress → fracture → detach, two successful resets per size, and both direct Work and Contact returning from zero canvases to one hero canvas. All five settled thought states have matching DOM copy, pressed controls, field colors, and contrasting ink.

### Engineering review — React / Next.js / Tailwind / Vercel practices

Interactive islands remain separate from the server page. Heavy scenes use dynamic imports. There are no per-frame React updates, perpetual decorative render loops, or unnecessary dependencies. Bounds are cached outside pointer frames. Scene resources and gesture/listener/RAF lifecycles have explicit cleanup. Quality is capped by viewport; no postprocessing or expensive full-scene transmission was introduced.

Fixed during QA:

- Orthographic positioning used stale viewport data; projection now uses camera bounds directly.
- Hero and build settling previously stretched on low frame rates. Hero integrates bounded real elapsed time with substeps; build damping uses elapsed time rather than a tiny fixed cap.
- Hero material updates now track thought selection, including a tap that leaves rail progress unchanged.
- Focus transfer now occurs after the portfolio is no longer inert. Section anchor offsets keep the sticky header from clipping identity copy on small screens.
- A canceled/keyboard build gesture could suppress the next activation. Gesture cancellation and click suppression were separated.
- Build rendering checks both angle axes and position before sleeping.

## Visual / interaction QA

Production renders were captured at **1440, 1024, 768, 390, and 320 pixels**, including the entrance, hero, Thinking, Curiosity, Messy Middle, Collaboration, Work, Now, and Contact. Extra captures cover the entrance first hit/opening/passage/arrival, connected curiosity, damaged/repaired assembly, changed collaboration route, and browser project stage.

Checks include keyboard activation/selection, pointer/touch pressure, Skip/Escape, reset, focus transfer, reduced motion, forced WebGL failure, JavaScript disabled, direct anchors, overflow, and uncaught exceptions. These were performed in headless Chromium using software WebGL. Phone viewport checks are responsive emulation, not physical-device testing.

Local artifacts (ignored by Git to avoid committing every QA frame):

- `visual-qa/experience-full/report.json` — five-width layout results.
- `visual-qa/experience-full/modes-report.json` — accessible modes, renderer settling, and entry checks.
- `visual-qa/experience-full/bundle-report.json` — aggregate local gzip estimate.
- `visual-qa/experience-full/input-report.json` — actual CDP mouse/touch tap, 550ms hold, repeated reset, and return from direct Work/Contact anchors.
- `visual-qa/experience-full/palette-report.json` — computed colors, selected controls, slider value, and copy across all five thought states.
- `visual-qa/experience-full/hero-1440.png`, `hero-390.png`, `hero-320.png`.
- `visual-qa/experience-full/assembly-1440.png`, `broken-1440.png`, `repaired-1440.png`, plus mobile counterparts.
- `visual-qa/experience-full/passage-1440.png`, `arrival-390.png`, `shared-390.png`, `work-browser-390.png`, `now-320.png`.
- `visual-qa/experience-full/experience-v2.mp4` — 38.52-second actual browser screencast, 224 captured frames, silent (3,011,692 bytes). Captured frame timing is preserved; it is not a hardware FPS benchmark.
- `visual-qa/experience-full/desktop-scenes.jpg` and `motion-contact-sheet.jpg` — layout rhythm and sampled recording frames.

## Performance measurements

All production JS chunks together: **468,229 bytes gzip**, compared with the saved baseline **463,448 bytes**: **+4,781 bytes**. This is a local gzip estimate of all twelve static JS chunks, not an initial page payload or measured HTTP transfer. Three/R3F remains in a separately loaded vendor chunk, approximately 242 KB gzip. No new external asset transfer was added.

Entrance renderer statistics sampled during the first hit / final break:

| Viewport | Draw calls | Triangles |
| --- | ---: | ---: |
| Desktop first hit | 44 | 9,326 |
| Desktop detached | 53 | 9,786 |
| Mobile first hit | 44 | 8,886 |
| Mobile detached | 53 | 9,346 |

These are entrance samples; its dataset is not a live metric after the entrance field unmounts. Hero/build draw totals were not inferred from it. Build has fifteen physical pieces and fifteen print planes, with a small trace and ground. Entrance keeps one major fragment and a small bounded chip set.

- DPR: desktop cap 1.5, phone 1. Screenshots at device scale 1 used DPR 1.
- Shadow maps: existing entrance 2048 desktop / 1024 phone; hero and build 1024 / 512.
- After settling, instrumented draw counters reported **zero additional draws over 1.1-second idle windows** for hero, damaged build, and repaired build at desktop and phone widths.
- No real-device 60fps claim is made. Software rendering and screenshot capture are unsuitable for that claim. Physical phone GPU/frame-pacing testing remains advisable.

`pnpm lint` and `pnpm build` pass. The homepage is statically prerendered.

## Remaining limits

1. The build assembly uses authored material motion and support dependencies, not collision-driven rigid bodies or full material fracture simulation. This is deliberate; its repeatable repair matters more than a large physics engine.
2. Headless browser checks cannot establish actual low-end phone performance, tactile touch feel, or prove absence of every memory leak. Disposal/reset paths are implemented and exercised without recorded uncaught exceptions.
3. Sound is absent. Existing licensed Foley is reserved for a future explicitly enabled audio pass.
4. Native scroll still connects the scenes. This is a personal interactive notebook, not a continuously navigable 3D game world.
5. Current questions are recurring themes based on established interests. Replace them with specific live notes only when Aditya supplies those facts.
6. The public GitHub repository is updated; no new hosting deployment is configured by this change.

Next useful work: review the captured motion with Aditya, test on an actual phone, then refine only the interaction that looks weakest. Do not add another WebGL scene or feature merely to increase the count.
