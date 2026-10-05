# The Folded Field — Design System

**Status:** Approved creative direction; source of truth through Phase 3 (Continuum)\
**Owner:** Aditya Gayal\
**Current scope:** Home shell, hero, About, collaboration story, contact, and the first inline project experience for Continuum. Other project experiences remain future work.

This document is the governing design contract. Read it before every implementation phase. If an implementation choice conflicts with this document, change the implementation or update this document deliberately before proceeding.

---

## 1. Creative identity

### Concept

**The Folded Field** is a living editorial field where observations, ideas, and working systems overlap. A visitor moves a sculptural **Reveal Key** through that field and discovers how a strange question becomes a useful system.

The site brings together three qualities: the relational logic of connected signals, the vivid annotated perspective of a field study, and the tactile precision of objects that have been joined and made to work. It is its own identity; it is not a loom, an atlas, or a repair guide.

### Philosophy

- Show how Aditya thinks by letting people explore and connect things.
- Make engineering feel physical, curious, and human without hiding the real work.
- Treat interaction as an editorial tool: it reveals, aligns, connects, or changes state.
- Keep content legible and useful before any effect loads.
- Use a contemporary digital composition with subtle material character, never a static print imitation.

### Personality

Curious, capable, observant, experimental, direct, lightly playful. The site presents Aditya as a developer, builder, and experimenter whose work crosses AI systems, developer tools, agentic systems, creative software, browser/security ideas, civic technology, and collaborative engineering. It is not a conventional résumé.

### Five-word design DNA

**Layered · Tactile · Vivid · Observant · Connected**

### Approved hero copy

**STRANGE QUESTIONS.**\
**USEFUL SYSTEMS.**

Supporting line: “Developer / builder / experimenter working across AI systems, creative software, and the odd ideas between them.” Keep the wording human and concise. Do not add generic job-title claims.

---

## 2. Anti-patterns

Do not use:

- Generic SaaS layouts, bento grids as the primary composition, dashboard panels, or rounded-card stacks.
- Generic dark developer portfolios, purple/blue AI gradients, glowing orbs, ambient particle fields, or Matrix code.
- Cyberpunk, fake terminals, chrome sci-fi blobs, glassmorphism, or decorative futuristic UI.
- A generic profile-photo hero, résumé-first introduction, tech-logo wall, GitHub-stat widget, or “Hi, I’m Aditya, full-stack developer.”
- A literal loom, city atlas, repair manual, magnifier, industrial inspection frame, or workshop-tool branding.
- Texture-heavy vintage posters, newspapers, distressed packaging, scrapbook clutter, aged paper, ink splatter, or print effects that soften type.
- A WebGL-only page, text baked into canvas, a floating object with no job, scroll hijacking, hover-only content, or motion that has no semantic reason.
- Fade-up-on-everything, perpetual idle animation, auto-playing sound, or large cinematic transitions used repeatedly.
- Small low-contrast annotations, color as the only state cue, or interactions that make the page hard to understand when unavailable.

---

## 3. Color system

Use solid colors as the foundation. Color communicates a project’s world and state; labels, path shape, and position must reinforce it. Avoid gradients. The warm shared surface should remain a background, not a retro effect.

```css
:root {
  --color-paper: #F2EBDD;
  --color-paper-bright: #FBF7EF;
  --color-paper-shade: #E5DCCD;
  --color-ink: #22211F;
  --color-ink-soft: #55524C;
  --color-rule: #BEB6A9;
  --color-focus: #173FB8;
  --color-focus-on-dark: #F3CC4C;
  --color-selection-bg: #22211F;
  --color-selection-text: #FBF7EF;

  --project-continuum-deep: #173FB8;
  --project-continuum-electric: #3B7CFF;
  --project-continuum-pale: #C8D7FF;

  --project-tracepilot-crimson: #C62942;
  --project-tracepilot-warm: #EF5948;
  --project-tracepilot-pale: #F7CFCA;

  --project-netranagar-saffron: #E9A522;
  --project-netranagar-orange: #F16832;
  --project-netranagar-sun: #F3CC4C;
  --project-netranagar-ink: #2C261B;

  --project-video-acid: #C5E53C;
  --project-video-black: #181B15;
  --project-video-pale: #E8F4AE;

  --project-browser-cyan: #20BED0;
  --project-browser-cold: #3D7FB9;
  --project-browser-pale: #C6F0F1;
  --project-browser-ink: #155E68;
}
```

### Use and contrast

- Main text uses `--color-ink` on paper. Supporting text uses `--color-ink-soft` only where it maintains WCAG AA contrast.
- Keep all body text at **4.5:1** minimum; large text at **3:1** minimum. Non-text controls and meaningful graphic boundaries meet **3:1** against adjacent colors.
- Project colors may fill large fields. Choose dark ink or the listed project ink for text when contrast requires it; do not assume saturated color is an accessible text color.
- Focus uses a clearly visible 2px outline plus a 2px offset. Use cobalt on paper and sun yellow or paper on dark/project fills.
- Selection uses charcoal ground with paper text. Preserve browser selection behavior and readable contrast.
- Never communicate active project by hue alone: also update its label, shape/state, and semantic selected state.
- Verify final rendered pairs with a contrast checker during visual review; adjust project text treatment, not project identity colors, if a pair fails.

---

## 4. Typography

Typography is the primary image. It should feel authored and expressive while staying quick to read.

### Roles

- **Display:** Bricolage Grotesque variable. Use its lively forms for short headlines and project names, not long passages.
- **Body:** DM Sans variable. Use for navigation, supporting copy, descriptions, and accessible controls.
- **Technical annotation:** IBM Plex Mono. Use sparingly for small coordinates, state labels, and project metadata.
- Provide local/system fallbacks: `Arial, sans-serif` for display/body and `ui-monospace, SFMono-Regular, monospace` for annotation. Text must remain usable if font loading fails.

Use licensed, optimized font files through `next/font` or locally hosted subsets; do not create a render-blocking external font dependency. Keep only required weights and glyph subsets.

### Scale

| Role | Desktop | Mobile | Line height | Tracking |
|---|---:|---:|---:|---:|
| Hero display | `clamp(4.5rem, 8.8vw, 8.5rem)` | `clamp(2.75rem, 12vw, 3.65rem)` | 0.84–0.94 | -0.055em to -0.035em |
| Section display | 3–5.5rem | 2.4–3.4rem | 0.9–1.0 | -0.04em |
| Project title | 2–3.5rem | 1.8–2.6rem | 0.95–1.05 | -0.03em |
| Body | 1–1.125rem | 1rem–1.0625rem | 1.45–1.6 | -0.01em to 0 |
| Navigation/control | 0.875–1rem | 0.9375–1rem | 1.2 | 0 |
| Annotation | 0.75–0.8125rem | 0.75–0.8125rem | 1.25–1.4 | 0.04em–0.08em |

### Behavior and rules

- Treat “STRANGE QUESTIONS. / USEFUL SYSTEMS.” as a graphic block with deliberate line breaks. At narrow widths, break after “STRANGE” or “USEFUL” only when needed to avoid clipping; preserve the exact words and punctuation.
- Keep normal reading order in DOM. Animated displacement is decorative and bounded; the readable semantic headline remains stable to screen readers.
- Never animate letter-by-letter in a way that impairs reading. Use small group movement or a decorative duplicate layer.
- All caps is for the hero, short labels, and names only. Do not set paragraphs in uppercase.
- Annotations are secondary: concise, aligned to a meaningful line or object, and never below 12px.
- Avoid using mono as the dominant typographic voice.

---

## 5. Layout and spacing

### Grid

- Desktop (`≥1200px`): 12 columns, 24px gutters, 56–80px outer margins. Hero uses asymmetrical spans: display on the left (7–8 columns), Reveal Key through the lower center (5–6 columns), project index at the right edge (3 columns). Overlap is intentional and must not compromise reading.
- Tablet (`768–1199px`): 8 columns, 20px gutters, 32–48px margins. Keep the heading and index in separate regions; let the object occupy the lower third.
- Mobile (`≤767px`): compose on 4 columns with 20–24px side margins and 12–16px gutters. Stack the name/navigation, headline, interaction, and index. Do not scale or crop the desktop arrangement.

### Spacing tokens

Use a 4px base with named tokens:

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.5rem;
--space-6: 2rem;
--space-7: 3rem;
--space-8: 4rem;
--space-9: 6rem;
--space-10: 8rem;
```

- Protect negative space around the hero headline and Reveal Key. Empty area is part of the composition, not a missing card.
- Align key content to the grid; break the grid only to show physical overlap, path continuity, or a purposeful annotation.
- Avoid clipping essential content to create drama. Let the page scroll naturally. The first viewport should feel composed at common laptop and phone heights.
- Target tap areas of at least 44×44px.

---

## 6. Graphic and material language

### 2D vocabulary

- SVG signal paths, short paths with distinct endpoints, aperture masks, offset project layers, cut-paper silhouettes, editorial rules, ticks, and a few handwritten-style callouts.
- Keep SVG geometry crisp and simple. A path represents a relationship, trace, cut, or repair; it is not decorative spaghetti.
- Annotations connect to an object or state with one clear leader. Registration marks are sparse and functional, not repeated vintage ornament.
- Project imagery uses its own simplified grammar: time traces, repair paths, civic signal geometry, timeline cuts, or layered browser inspection windows.
- Primary shapes are flat, bold fields with occasional soft physical shadows at contact points.

### Surface and texture

- Paper is warm in color, not visibly aged. Use a subtle surface variation only if it survives at normal viewing size without reducing crispness.
- Texture contribution should read at roughly **2–4%** of the composition. Prefer restrained CSS/SVG grain or a very small optimized texture asset; avoid full-screen high-opacity noise.
- Material depth comes mainly from overlap, edge, light, and motion—not distress, stains, folds everywhere, or fake scanned-paper borders.

---

## 7. Reveal Key

### Object identity

An elegant, asymmetric aperture instrument: two offset enamel/ceramic petals meet at a compact brushed-aluminum pivot; one narrow sliding blade and a short dark rubber contact pad define an irregular kite-like opening. A small linen tension line may connect the pivot to a trailing piece. The silhouette is recognizable at icon scale and does not resemble a boxy frame, loupe, camera, weapon, gear assembly, or workshop tool.

The object belongs to the page composition. It rides a visible constrained path, overlaps the display typography, casts a small contact shadow, and changes what the SVG field reveals. No free-floating idle pose.

### Materials

- Main surfaces: matte enamel in a warm neutral with one saturated project-color plane.
- Pivot: restrained brushed aluminum, not mirror chrome.
- Contact: charcoal rubber, soft edge, no branding.
- Optional tension detail: one fine linen strand, used once and kept legible.
- Lighting is broad and studio-soft. The artifact must read without bloom, glare, or postprocessing.

### States

1. **At rest / incomplete registration:** readable headline with some secondary line fragments offset; object rests at the start stop.
2. **Searching:** artifact follows pointer/keyboard/touch along a bounded curve; aperture reveals hidden words, color blocks, and paths.
3. **Tension:** velocity creates bounded lag in the blade, slight layer separation, and modest glyph displacement. The main headline stays readable.
4. **Connected:** at an anchor the object settles; one project signal completes; its color enters an editorial strip; project index selection and direct link update.
5. **Reset:** return to the incomplete registration state with one deliberate keyboard/visible control action.

### Travel and anchors

- Use a normalized path from `0..1`, with five meaningful anchor positions. The exact rail can curve around the headline and end near the project index; do not cross body copy or block controls.
- Mouse drag may guide the object, but keyboard/touch controls and the project list provide the same outcome.
- Maximum motion range: object stays inside its reserved composition, SVG layer separation ≤16px, text decoration/glyph shadow displacement ≤8px. No content clips or overlaps in a way that harms reading.
- Snap to the nearest anchor after deliberate release or after keyboard selection. The active project is synchronized with its label and link.
- Each project link remains directly usable whether or not the object has moved.

---

## 8. Motion system

Motion has mass, friction, and consequence. It should communicate searching, joining, revealing, or settling—not decorate every element.

### Tokens

```css
:root {
  --duration-micro: 120ms;
  --duration-ui: 280ms;
  --duration-section: 620ms;
  --duration-discovery: 1500ms;
  --ease-settle: cubic-bezier(.2, .72, .2, 1);
  --ease-enter: cubic-bezier(.18, .82, .22, 1);
  --ease-release: cubic-bezier(.4, 0, .8, .4);
  --ease-linear: linear;
  --spring-stiffness: 180;
  --spring-damping: 25;
}
```

- **Micro (80–160ms):** focus, label, pressed, and small feedback states.
- **UI (220–420ms):** project selection, menu state, path reveal. Favor transforms/opacity and SVG stroke-dashoffset.
- **Section (450–750ms):** only when moving between meaningful hero states or large composition groups.
- **Discovery (1.2–1.8s):** one initial reveal sequence at most; no repeated cinematic choreography.
- Pointer response is immediate but damped. Use velocity only within bounded resistance; never create uncontrolled fling.
- Object inertia settles in about 280–520ms with a critically damped feel; spring token is the starting point, not a reason to overshoot past anchors.
- Typography displacement eases with the artifact but returns first, so the headline remains stable.
- Section entry uses small position/clip changes and opacity only when it explains hierarchy. No repeated fade-up stack.
- Native scroll remains in charge. No wheel interception or smooth-scroll hijack.

### Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Stop pointer tracking, inertia, looping, parallax, and reveal choreography.
- Show all words and project links in a stable composition; preserve the meaningful project-color state using direct controls.
- Replace drag with five explicit, keyboard-operable project buttons.
- Use immediate state changes or a subtle ≤100ms opacity change; preserve focus indication.
- Keep object silhouette or the SVG fallback static. No information may depend on movement.

---

## 9. Project worlds

Each project has a distinct color and graphic grammar within shared typography, paper/ink, annotation, and signal-path rules. Project links point directly to their public repositories in a new tab and include accessible names.

| Project | Color world | Graphic grammar | Interaction meaning |
|---|---|---|---|
| **Continuum** | Deep cobalt, electric blue, pale blue | Layered time traces, observation marks, memory fragments, lines that persist across depth | Follow repository-grounded context into observable run evidence and a human outcome; never imply access to private model reasoning |
| **TracePilot** | Crimson, warm red, pale red | Broken routes, diagnosis ticks, separated endpoints that reconnect cleanly | A visually interrupted path joins into a safer, clearer route |
| **NetraNagar** | Saffron, orange, sun yellow, dark civic ink | Abstract city blocks, civic nodes, drone observation arcs; schematic, not map tiles | Observation signals organize around a civic event; never present unsupported live data |
| **AI Video Editor** | Acid green, black, pale green | Timeline strips, clip boundaries, trim handles, sequence cuts | A scrub/cut gesture reorders or joins visual beats; primary language stays 2D |
| **AI4Browser** | Cyan, cold blue, pale cyan | Nested page layers, inspection windows, contextual highlights | A revealed layer clarifies a page/security state; do not imitate Chrome or browser chrome |

The hero interaction may preview each visual grammar in a compact SVG layer; detailed worlds belong to future approved project experiences.

---

## 10. Navigation and links

- Keep the header direct and light: **ADITYA GAYAL**, **About**, **Work**, **GitHub**, **LinkedIn**.
- `Work` jumps to the project index in the same page. GitHub and LinkedIn open in a new tab with `rel="noopener noreferrer"` and a screen-reader indication that they open externally.
- Social links are present as plain, understandable text. Do not hide them in an unlabeled icon-only control.
- Public profiles: [GitHub](https://github.com/AntiDynamic) and [LinkedIn](https://in.linkedin.com/in/adityagayal).
- The About section contains a prominent direct email link to `gayaladitya9@gmail.com` and repeats both social links in its contact ending.
- Project links: Continuum `https://github.com/AntiDynamic/Continuum`; TracePilot `https://github.com/priyanshuchawda/tracepilot-gemini-cli`; NetraNagar `https://github.com/AntiDynamic/NetraNagar-public`; AI Video Editor `https://github.com/AntiDynamic/video`; AI4Browser `https://github.com/AntiDynamic/browser4all`. The Continuum hero action enters its inline experience; the index's per-project arrow remains a direct repository link.
- Keep every in-page link connected to an existing section. Do not add empty links for future project pages.

---

## 11. Responsive composition

Mobile is an intentional alternate composition, not a smaller desktop.

### Desktop

- At approximately 1440×1000: name upper-left, direct nav upper-right, headline upper-left/mid, Reveal Key occupies lower-center and makes real contact with path/layers, project index sits in a narrow right-side rail, concise personal line near the headline, annotations sparse. Keep enough negative space to distinguish the object from the typography.
- Interaction prompt is visible but quiet (“Move the key to find a signal” or equivalent). The words communicate the action; do not require guessing.

### Tablet

- At approximately 768px wide: reduce headline size and side margins, move project index below or beside the art only when 8-column space supports clear reading. No overlap with nav or interactive targets.
- Reduce path travel and artifact scale before removing meaning.

### Mobile

- At approximately 390×844: 4-column vertical editorial sequence. Header/social navigation; 44–58px headline over 2–3 lines; personal line; small artifact/path module; explicit “Explore a project” step/selection controls; then complete vertical project index.
- Replace precise pointer drag with tap-to-select and optional touch drag inside a generously sized area. Every project can be activated with a 44px minimum target.
- Simplify 3D geometry, shadows, and tracking; clamp DPR. If the 3D is not ready, show the SVG artifact in the same area.
- Avoid a sticky full-screen hero, clipped headline, horizontal-only project index, or tiny side labels.
- About is an intentional second act: oversized statement first, readable first-person copy next, then open connected notes for curiosity, teamwork, and follow-through. Stack those notes on mobile instead of shrinking the desktop columns.

---

## 12. Implementation boundaries

### DOM / HTML

- Own all meaningful text: name, headline, personal framing, navigation, project names, descriptions, direct links, interaction instructions, and accessible status.
- Use semantic `header`, `nav`, `main`, `section`, ordered/unordered lists, buttons for state changes, and anchors for navigation.
- Keep the static shell and content in Next.js Server Components by default.

### SVG

- Own signal paths, project motifs, masks/aperture cutouts, registration/annotation marks, and the static Reveal Key fallback.
- Use `viewBox` coordinates and a single normalized interaction progress value for path/reveal alignment.
- Keep stroke widths and labels legible at mobile sizes. Decorative SVG is hidden from assistive technology; its meaning is represented in DOM.

### CSS

- Own layout, grid, color, typography, paper fields, contact shadows, responsive rearrangement, focus, and restrained transform/clip interactions.
- Prefer transform/opacity and SVG stroke changes. Do not animate layout dimensions on every pointer move.

### Canvas 2D

- Not needed for Phase 1. Add only if a specific visual cannot be delivered efficiently with SVG/DOM, and update this design contract before using it.

### R3F / WebGL

- Own only the sculptural Reveal Key model and its lighting. Keep one small canvas, simple custom geometry, a few materials, no postprocessing, no physics engine, no large texture map.
- Dynamically load the scene after useful HTML renders. Reserve dimensions to prevent layout shift.
- Keep interactive values in refs/Three objects inside the frame loop; React state changes only at project anchors and meaningful state boundaries.
- Avoid a full client-side page tree. Canvas is decorative/interactive enhancement; DOM content remains complete and actionable.

---

## 13. Accessibility

- Maintain semantic heading order, landmarks, descriptive links, button semantics, and screen-reader-readable project content.
- All navigation and project selection work from keyboard. Provide a visible focus state on every interactive element; do not rely on hover.
- Provide an interaction instruction and a non-drag route. Keyboard: focus the selector, use Left/Right (or Up/Down on vertical mobile list) to change project, Enter to open, Escape or a visible reset control to return to the unselected state.
- Touch receives direct project-selection controls and optional touch drag. Nothing essential depends on hover, pointer precision, or 3D readiness.
- Announce selected project changes politely with a small `aria-live="polite"` status. Do not announce pointer movement continuously.
- Respect reduced motion. Controls have at least 44×44 CSS-pixel touch area.
- Provide contrast requirements from the color section and non-color signals for selected/focused states.
- Mark decorative canvas/SVG `aria-hidden`; provide equivalent text and links outside them. Do not duplicate the full content in a noisy accessible tree.
- Provide WebGL and JavaScript failure fallbacks; direct project links remain in the DOM.

---

## 14. Performance and resilience

- Server-render the shell and all essential copy/links. The first paint should communicate the portfolio before any Three.js code loads.
- Lazy-load the single R3F scene. Do not put Three.js in the initial route chunk. Avoid postprocessing, Rapier, physics simulation, large images, and video in Phase 1.
- Prefer generated low-poly geometry and solid materials; no external model/texture requests are needed for the hero object.
- Aim for the lazy 3D chunk to remain below roughly **250 KB gzip** where practical; record actual bundle output and split further if this is exceeded. Keep initial route JS lean and measure production output rather than promising an unverified size.
- Cap device pixel ratio at **1.5 desktop** and **1.2 mobile**. Use the lowest sufficient geometry detail and minimal lights/materials.
- Pause or stop work when the hero is offscreen, tab is hidden, or reduced motion is requested. Prefer demand rendering/invalidation for settled scenes; avoid an always-running idle loop.
- Dispose geometry, materials, and listeners on unmount. Avoid per-frame React state updates, layout reads, and broad state-driven rerenders.
- If WebGL is disabled, unsupported, blocked, or fails to load, render the SVG Reveal Key with identical project controls and color/path state. If JavaScript is disabled, show the static headline, personal framing, and project links in natural document flow.
- Keep the page useful if fonts or decorative enhancements fail. Reserve media/canvas dimensions to prevent CLS; no autoplay video/audio.

---

## 15. Phase 1 boundary and review gate

Phase 1 is complete: it includes the project scaffold, global tokens/styles, typography, homepage shell, direct navigation, hero composition, Reveal Key, project index and links, mobile composition, reduced-motion behavior, and WebGL-disabled fallback. Phase 2 is complete: it includes the About / collaboration story and contact ending.

Phase 3 adds only the inline Continuum experience defined below. Other project experiences, site-wide transitions, and additional Easter eggs remain future work. Review design, UX, engineering, and real renders at **390, 768, 1024, and 1440px**, fix meaningful problems, and confirm the production build passes before moving to another project world.

---

## 16. Phase 2: About, collaboration, and contact

### Purpose and voice

- Make Aditya the subject of this section: a developer who loves technology and coding, follows unusual questions with creativity, works well with other people, and puts in the patient effort to finish.
- Write in a direct first-person voice. Sound curious, warm, and specific; avoid résumé claims, inflated adjectives, generic “team player” language, or unsupported career history.
- The approved copy direction is: **“I love the part between ‘what if?’ and ‘it works.’”** Supporting copy should explain why coding is fun, how shared perspectives improve a build, and how Aditya stays with difficult work through debugging and refinement.
- Do not invent collaborator names, team sizes, outcomes, awards, or project contributions. Show collaboration as a working value unless verified stories are supplied.

### Composition and visual language

- Place About directly after the hero. Make it a clear second act, not a bio card or photo-and-copy split.
- Use a large expressive statement on one side and readable short paragraphs on the other. Leave generous paper space; let one cobalt/red/orange connection line move between the ideas.
- Follow with three open editorial notes: **Curiosity**, **Better together**, and **Follow through**. Use rules, alignment, and a shared path; do not turn them into rounded cards, résumé skill tiles, or statistic counters.
- Keep the copy as real DOM text. Use SVG only for the connection path, and keep the path decorative with `aria-hidden="true"`.
- A restrained solid charcoal contact field may close the page. Use a short human invitation, a large direct `mailto:` link, and plain text GitHub / LinkedIn links. Avoid a generic form until one is needed.
- Keep texture at the same subtle level as the hero. Use color, scale, cut alignment, and a small reactive/hover response to keep the section contemporary and alive.

### Mobile and accessibility

- At mobile widths, stack heading, personal copy, the three notes, and contact in that order. Keep long email text wrapping safely and all links at least 44px high.
- Preserve semantic `h2` / `h3` hierarchy, visible keyboard focus, high contrast, and the exact email/social destinations. Contact must work without hover or animation.
- Reduced motion shows the full connected composition statically. No paragraph or social link is revealed only by interaction.

### Engineering boundary

- Keep About and contact in Server Components with static semantic text. Use CSS/SVG for the graphic relationship; do not add a new animation dependency or another canvas.
- No new imagery or font weights are needed. Keep the hero's existing R3F scene isolated and lazy-loaded.

## 17. Phase 3: Continuum project experience

### Product story and claims

- Present Continuum as a local-first, vendor-neutral context delivery and observability system for coding agents. It can prepare repository-grounded context, record evidence an adapter exposes about a run, and compare run evidence alongside a human outcome.
- Tell the story in three moments: **Prepare** (index a repository and assemble task context), **Observe** (retain exposed evidence such as tool events, Git changes, test exit codes, and provider usage when an adapter emits it), and **Assess** (inspect reports, compare runs, and record the human outcome).
- Be precise about the boundary: Continuum cannot inspect private model reasoning. Estimated context tokens are not provider billing totals, and current evidence does not establish provider savings or reliable task-success improvement. Keep this as one concise, legible note rather than a defensive disclaimer block.
- Do not promise every adapter emits every signal. Qualify usage as “when exposed” and evidence as adapter-dependent.

### Composition and graphic behavior

- Place the Continuum field directly after the hero, before About. Its entry continues the cobalt signal from the selected Continuum state, so the first project entry feels like a path resolving rather than a separate landing page.
- Use a full-bleed deep-cobalt field with paper-bright typography, electric-blue signal marks, and pale-blue evidence layers. Keep it typographic and editorial: no dashboard, metric cards, terminal imitation, or generic product screenshot.
- Lead with a short project statement such as **“THE CODE IS ONLY PART OF THE STORY.”** Supporting copy explains context delivery and observable run evidence in plain language. Include a direct repository link in the project field.
- Show three stages as one connected SVG time-trace: repository/context, agent-run evidence, human outcome. Use short accurate labels such as `REPOSITORY SNAPSHOT`, `RUN EVIDENCE`, and `HUMAN OUTCOME`; do not fabricate timestamps, metrics, success rates, or benchmark results.
- Let a native range control scrub the signal between **Prepare**, **Observe**, and **Assess**. The selected stage moves one visible trace marker and changes which line/layer carries visual emphasis. All stage names and their explanatory text remain visible without interaction; the control is an optional way to read the diagram, not a content gate.
- Draw project details in DOM and SVG. Do not introduce 3D or another canvas for this project: the meaning is sequence and evidence, which the connected 2D trace expresses directly.
- Keep texture barely perceptible. Use solid cobalt and precise overlap to make this contemporary and digitally alive.

### Motion, mobile, and accessibility

- Keep the scroll native. The hero's internal **Enter Continuum** action targets this section; the row arrow still opens the public repository.
- During range input, move the marker and reveal/strengthen a path with transforms or SVG stroke changes over 220–420ms. While the pointer is held, shorten settling to about 90ms so direct scrubbing follows promptly; keyboard changes settle within 180–300ms. Do not add perpetual motion or a cinematic interstitial.
- On mobile, recompose into a vertical editorial stack: section mark and title, concise explanation, a tall/simple trace with three clearly labeled stops, a full-width range control, scope note, repository link. Keep the stages understandable without dragging.
- Use a real `<input type="range">` with an accessible name, three keyboard stops, visible focus, and a 44px minimum interaction band. Expose the selected stage through its value text; do not announce each pointer pixel. The SVG is decorative and hidden from assistive technology because the same information is in DOM.
- Under reduced motion, move the marker immediately and leave all path layers visible; preserve selected-stage text and control semantics.

### Engineering and performance boundary

- Render the section copy and stage descriptions as a Next.js Server Component. Isolate the range state and SVG trace in one small Client Component; do not make the page or project content client-rendered.
- SVG owns the evidence path, stops, marker, and short diagram labels only when labels are also available as DOM text. CSS owns the cobalt field, layout, responsive stacking, focus, and state transitions.
- No R3F, WebGL, external assets, video, or new dependencies in this phase. The experience must remain clear with JavaScript disabled; the SVG shows a stable complete trace and the repository link remains a regular anchor.
- Pause decorative transition work when the section is offscreen if any ongoing animation is later introduced. No ongoing animation is expected in this phase.
