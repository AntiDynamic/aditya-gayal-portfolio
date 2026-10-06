# Experience Architecture V2 — Under the Surface

**Date:** 2026-10-06  
**Status:** Approved by “build everything”; implemented homepage experiences. See [build review](experience-v2-build.md).
**Identity:** Aditya Gayal. Layered · tactile · vivid · observant · connected.

`DESIGN.md` remains the approved implementation contract. The audit and selection reasoning below are preserved from the checkpoint. The subsequently approved medium and handoff changes are recorded in DESIGN.md §18.

## Evidence and reference standard

Reviewed the repository on `main` at `44f5390`, the running production site at desktop/mobile sizes, its Stage C/C.5 reports and motion studies, and the Lusion recording `screenrecording-2026-10-06_01-03-50.mp4`. Browser captures for this audit are in the local, ignored `visual-qa/experience-v2/` directory. Existing five-width entrance QA remains in `visual-qa/entrance-stage-c5/`.

Applied the installed ui-ux-pro-max, ui-design, react, nextjs, tailwind, and vercel-react-best-practices guidance. No dedicated installed Blender, Three.js, R3F, shader, audio, or creative-coding skill was found. The actual stack is Next 16.3.8, React 19.2.8, R3F 9.8.1, Three 0.186.1, and Tailwind 4. React 19.3-only skill examples are not available in this installed React version.

### What the Lusion recording teaches

- **18–22 seconds:** overlapping physical forms have readable foreground, middle, and background. Silhouette and occlusion convey depth before motion does.
- **44–52 seconds:** the illustrated/physical subject survives the change from a bounded composition to a full-screen environment. The transition preserves a recognizable anchor.
- **52–64 seconds:** typography changes scale relative to the subject and camera. The composition changes spatial relationships; it does more than animate its opacity.
- **122–126 seconds:** the stack unfolds into readable information. Interaction changes the structure of the interface.
- Quieter work and ending moments give the intense scenes somewhere to land.

The recording establishes a visual standard. It does not establish which renderer, physics engine, or input algorithm Lusion used. We should borrow subject continuity, depth, responsive timing, and pacing while retaining Aditya's materials, colors, copy, and interaction verbs.

**First priority:** make the Reveal Key visibly exist inside the entrance cavity, then bring the visitor toward that same object. The opening needs a destination.

## A. Repository audit

KEEP preserves a useful system. EVOLVE retains its data or responsibilities while changing its presentation. REPLACE changes the interaction model or representation. DELETE applies only after confirming call sites during an approved implementation phase.

| Current component/system | Decision | Evidence and next treatment |
| --- | --- | --- |
| `src/app/page.tsx` | EVOLVE | Keep server-rendered content and identity-first order. Compose scenes around their interactive subjects rather than repeating heading/copy/widget blocks. |
| `src/app/layout.tsx`, font setup | KEEP | Bricolage Grotesque, DM Sans, and IBM Plex Mono already provide character, reading clarity, and annotation contrast. |
| `globals.css` | EVOLVE | 1,817 lines, with legacy selectors and successive hero overrides. Keep tokens, resets, fonts, focus, and shared primitives; move local styling into modules as each scene changes. |
| `EntranceGate`, entrance context | EVOLVE | Preserve Skip, Escape, focus transfer, inert handling, direct-hash bypass, and no-JS access. Current completion unmounts the entrance before loading the hero; replace that discontinuity with a scoped passage. |
| Entrance manifest/geometry | KEEP / EVOLVE | Separate responsive manifests, registered print, real thickness, and one weak seam are valuable. A camera change requires one explicit projection adapter, not duplicated coordinate formulas. |
| `entrance-break.ts` store | KEEP | Persistent semantic damage and immutable snapshots are a strong foundation. Keep transient physics/motion outside React. Add entry readiness only when the passage phase is approved. |
| `entrance-break-motion.ts`, presence | KEEP / EVOLVE | Material-specific authored motion, bounded settling, and sleeping renderer should survive. Preserve the existing single-break scope. |
| Entrance scene/materials | EVOLVE | Keep narrow asset ownership, shader preparation, small normal maps, and controlled lights. Reuse the world through passage; avoid resource disposal while its Key is still needed. |
| Entrance controls/fallback | KEEP / EVOLVE | Keyboard and SVG failure behavior remain first-class. Add an explicit entry action beside existing Skip; reduced motion gets immediate handoff. |
| Blender scripts and entrance GLBs | KEEP | Reproducible manifest-driven export, meaningful pivots, modest bevels, and responsive geometry already earn their place. |
| `thought-states.ts` | KEEP | Five specific approaches to thinking, including experimentation, persistence, and another perspective. These are identity data, not project tabs. |
| `RevealKey` | EVOLVE | Preserve native slider/button semantics and thought data. Replace independently computed DOM/SVG/world poses with a shared pose. Cache measurements; the current frame update reads width during motion. |
| `RevealScene` | EVOLVE | Keep demand rendering. The current flat shadow, broad lighting, and petal-like silhouette do not yet sell a physical reveal instrument. Improve aperture, attachment, light, and typography registration before deciding on Blender. |
| `AboutSection` / Thinking shell | EVOLVE | Keep specific personal copy. Make the question and its route the section's focal composition. |
| `QuestionBranches` | EVOLVE | Three authored choices and follow-ups are useful. A single active index and three fixed curves cannot represent dead ends, loops, or exploration history. Expand into a small authored graph. |
| `CuriosityField` | EVOLVE | Keep established interests and color. Its current `id="now"` conflates recurring curiosity with current activity; separate these concepts and preserve old links deliberately. |
| `CuriosityConnections` | EVOLVE | Keep ten topics, eight authored pairings, discovery state, and selection equivalents. Desktop proximity resolves at release; the shared rectangular field and generic curve make discoveries visually similar. |
| `MessyMiddle` / `DestructionLab` in `build-sequence.tsx` | EVOLVE | Keep 15-piece data, five materials, three support dependencies, and damage/rebuild meaning. Replace the flat polygon-board representation. Current rebuild changes positions slightly and overlays a statement; it does not clearly construct a better system. |
| `CollaborationField` | EVOLVE | Keep its personal premise and lack of fabricated team evidence. Give the second perspective a physical-looking authored intervention. |
| `CollaborationSwitch` | REPLACE representation | Its boolean reroute explains the idea, but the before/after curves are too shallow. Keep the premise while adding an introduced overlay that changes an assumption and then a route. |
| `projects.ts` | KEEP | Five concise metadata entries and existing direct repository URLs. Do not infer roles or contribution counts from a repository URL. |
| `ProjectIndex` | EVOLVE | Keep semantic list/direct links. Add one shared visual stage with five authored states; selection and opening a repository remain separate actions. |
| `ContinuumSection` / `ContinuumTrace` | KEEP | Optional native disclosure already keeps the deeper story under Work. Preserve accurate evidence boundaries and usable DOM/SVG controls. |
| `PageMotion` | EVOLVE | Keep navigation/visibility responsibilities. Retire repeated generic section reveals as the primary motion language; each scene owns its meaningful behavior. |
| `ContactSection` | EVOLVE lightly | Email, GitHub, LinkedIn, and natural closing copy are already right. Add only the final Trace-to-arrow behavior. |
| `project-events.ts` | DELETE after call-site check | Search finds its declarations but no consumers. Avoid a second global event bus alongside the experience state. |
| Dedicated Now scene | CREATE later | It does not exist separately today. Require supplied current facts; recurring interests are not evidence of what Aditya is learning this week. |

### What the actual renders reveal

The entrance has physical thickness and convincing printed-face ownership. The hero returns to a frontal floating object with an oval shadow. Thinking becomes a three-option editorial menu; Curiosity a bounded word field; Messy Middle a board of polygons; Collaboration an alternate curve. Each has useful meaning, but their visual behavior repeatedly stops at the widget boundary.

At 1440px the four personal sections measure roughly 1,045–1,442px tall each. At 390px they remain roughly 1,069–1,363px tall. There is room to tighten static preambles and let the interaction occupy the main composition. This is not a request to remove calm space: give it a subject and a purpose.

Current desktop/mobile audit captures show no horizontal overflow or recorded uncaught exceptions. These checks do not establish frame rate, device performance, or complete accessibility coverage. Existing Stage C.5 QA provides the broader entrance-mode checks.

## B. Resource map

| Scene | Primary medium | Selective enhancement | Why |
| --- | --- | --- | --- |
| Threshold — BREAK | DOM + SVG fallback; R3F physical assembly | Existing Blender signature pieces | Actual thickness, print ownership, and a fragment moving in depth are the point. |
| Passage | Same scoped R3F world + DOM controls | Shared camera/pose timeline | A recognizable destination must survive the opening. |
| Hero — REVEAL | DOM/SVG thought content + existing R3F Key | Blender only if silhouette remains limiting | The artifact has to affect the same composition as the typography. |
| Thinking — TRACE | DOM + SVG | CSS/WAAPI path emphasis | Authored investigation choices need routes and consequences, not a 3D renderer. |
| Curiosity — CONNECT | DOM typography + CSS transforms + SVG motifs | Rewritten proximity/magnetic principles from 21st references | Whole phrases can pull, snap, and expose relationships efficiently. |
| Messy Middle — BREAK/REBUILD | DOM meaning/controls + scoped R3F | One Blender-authored assembly, existing damage schema | Mass, joints, and a visibly different repair justify physical geometry. |
| Collaboration — CHANGE | DOM + SVG + CSS tracing overlay | Bounded perspective transform | A second view changes an assumption and opens a route. |
| Work — OPEN | DOM list + one SVG/DOM stage | R3F only after a stage prototype proves added value | Time traces, repaired paths, city marks, clips, and page layers are naturally 2D. |
| Now — MOVE | DOM + CSS | Simple bounded pointer drag/flip | Small readable notes are sufficient. |
| Contact — SEND | DOM + SVG | Local line tension/arrow snap | The email is the endpoint. |
| Sound, later | Web Audio | Existing documented Foley | Short tactile responses, enabled explicitly. |

No new runtime library is recommended at this checkpoint. Existing refs, CSS, SVG, browser animation APIs, and R3F cover the proposed first phases.

## C. 21st.dev audit

Used the official `@21st-dev/cli` through `npx`, completed browser login, and verified the saved identity **gayaladitya9**. Searched ten mechanics queries. Retrieved two component implementations using `get`; the returned free source quota is now **0/2** until its next reset. No components, MCP configuration, templates, or project dependencies were installed. CLI behavior is documented by the [official CLI skill](https://github.com/21st-dev/skill/blob/main/skills/21st-cli-use/SKILL.md).

**Audit depth is explicit below.** Full source was inspected for the first two rows. Other rows use CLI metadata and public component pages where available; their complete internals are not verified. Preview CDN downloads returned HTTP errors in this environment, so those previews were not visually validated. Further shortlisted source/preview inspection belongs before adopting a mechanic, after quota resets. This is a selection audit, not a claim that every example passed accessibility/performance QA.

| Reference | Mechanic / scene | Dependencies observed | Concern | Decision |
| --- | --- | --- | --- | --- |
| [Mouse Following Line](https://21st.dev/@ravikatiyar162/components/mouse-following-line), ID 6272 — full source | Cursor-directed line field; pointer-response study | `framer-motion`, `next-themes`, local `cn` | Default 40×40 grid; keeps RAF running while hovered even when stationary. Mouse-only handlers, no reduced-motion path. It is not a single meaningful Trace. | STUDY ONLY: borrow immediate target updates and bounded response, discard field. |
| [Text Cursor Proximity](https://21st.dev/@danielpetho/components/text-cursor-proximity), ID 548 — full source | Distance falloff; Hero/Curiosity | `motion/react`, custom mouse hook; demo uses `next-themes` | Measures container and every letter each frame. Hooks are called within maps/reductions, creating hook-order risks when label/styles change. No motion preference or touch behavior in component. | ADAPT / REWRITE: cached whole-word bounds, refs, bounded transforms, sleep after settling. |
| [Svg follow scroll](https://21st.dev/@reuno-ui/components/svg-follow-scroll), ID 7288 — public page/metadata | Scroll-aligned SVG; Thinking/Trace | Public page lists `framer-motion` | Source timing, cleanup, and mobile strategy not yet verified. A tall page-wide line would become decoration. | STUDY ONLY: local endpoint continuity. |
| [Magnetic](https://21st.dev/@ibelick/components/magnetic), ID 649 — public page/metadata | Attraction toward pointer; Curiosity | Public page lists `motion`, MIT | Need to verify measurement and loop lifecycle. Magnetic behavior must not move a focused control away from the user. | ADAPT / REWRITE: proximity principle, stable semantic hit area. |
| [Stacked Panels Cursor](https://21st.dev/@moazamtrade/components/stacked-panels-cursor-intereactive-component), ID 11468 — public page/metadata | Distance-weighted layer lift; Key/overlay study | Public page lists `motion` | Continuous mouse response and many simultaneous layers could cost more than the result warrants; internals unverified. | STUDY ONLY: apply to at most two meaningful layers. |
| [Interactive Scrolling Story](https://21st.dev/@minhxthanh/components/interactive-scrolling-story-component), ID 6265 — public page/metadata | Scroll changes left copy/right imagery | Full dependencies not verified | Its described fade/slide feature presentation recreates the section pattern we are replacing. | REJECT as layout; study selection timing only if needed. |
| [3D Parallax Unfurling Gallery](https://21st.dev/@piyushxdev/components/3d-parallax-unfurling-gallery), ID 20039 — public page/metadata | Perspective/layer unrolling; Work study | Public page lists `framer-motion`, MIT | Multiple columns, image weight, and scroll transforms may overwhelm a concise five-project stage. | STUDY ONLY: one object changing orientation into readable content. |
| [Canvas Reveal Effect](https://21st.dev/@manuarora700/components/canvas-reveal-effect), ID 1218 — public page/metadata | Dot-matrix hover reveal | Public demo imports `framer-motion`; full component dependencies unverified | Dot field, gradients, hover-only demo behavior conflict with the identity. | REJECT. |
| [Feature Showcase](https://21st.dev/@ruixen.ui/components/feature-showcase), ID 9309 — CLI metadata | Shared display selected by list | Full dependencies unverified | Stats, CTA, and feature-container styling would look like a product site. | STUDY ONLY: separate selection from link activation. |
| [GSAP Draggable Rope](https://21st.dev/@isaiahbjork/components/gsap-draggable-rope), ID 7453 — CLI metadata | Tension/drag mechanics | GSAP mentioned by listing; full dependency list unverified | No rope simulation is required for the authored Trace. | STUDY ONLY; no GSAP installation justified. |

There is no whole-component REUSE recommendation. The useful result is a small set of interaction principles adapted to our own geometry, typography, lifecycle, and accessibility. Do not copy source without confirming its license and preserving required attribution. Account credentials stay outside the repository.

## D. Blender map

Blender 4.5.14 LTS CLI already works, including headless generation/export and neutral CPU preview. Keep its use narrow.

| Object | Decision | Visible reason / pipeline |
| --- | --- | --- |
| Entrance fragment, bracket, restraint | KEEP existing Blender output | Bevels, normals, thickness, and pivots improve the readable release. `scripts/blender/build-entrance-break.py` remains the source. |
| Entrance paper, cavity walls, simple rails | KEEP procedural | Responsive silhouettes and common layout coordinates matter more than offline modeling. |
| Reveal Key | CONDITIONAL | First refine its aperture and pivot in the current scene. Add `build-reveal-key.py` only if edge quality or sculptural shape still limits the result. |
| Messy Middle central joint/repair assembly | LIKELY, later | One signature object may need intentional sockets, bevels, and repair alignments. `build-messy-object.py` is a proposal, not a script to create now. |
| Work stage | NOT initially | SVG layering can express all five project grammars. Consider one object only after a specific visible benefit is demonstrated. |
| Thinking, curiosity labels, collaboration, Now, Contact | NO | These are readable typography, paths, planes, and controls. |

Every introduced GLB must expose semantic mesh names, deliberate pivots, correct normals, bounded triangles, useful material slots, and documented export commands. No full-scene migration or Blender runtime on the website.

## E. Renderer architecture

| Option | Continuity | Cost/complexity | Mobile and failure | Decision |
| --- | --- | --- | --- | --- |
| Independent islands everywhere | Simple local ownership, but camera/context discarded at passage | Lowest refactor cost; repeated context creation and separate coordinate systems | Easy scene-by-scene fallback | Retain for distant optional experiences, insufficient for entrance → hero. |
| Hybrid by locality | Entrance and Hero share a world; distant sections retain appropriate DOM/SVG or isolated 3D | Moderate, bounded changes; share assets only where useful | Local fallback, low mode can omit later 3D | RECOMMENDED. |
| One persistent global canvas | Maximum theoretical camera/resource continuity | Global coordinate projection, scroll ordering, focus, resize, and memory management become much harder | Context loss affects every physical scene; unnecessary viewport/memory scope | REJECT for current needs. |

### Concrete hybrid contract

1. Keep the homepage/server copy outside a small client orchestration boundary.
2. Introduce a **scoped EntranceHeroWorld** only for the passage. The existing break store remains local; it does not own curiosity or every pointer on the page.
3. Meaningful states: `threshold`, `opening-ready`, `passing`, `hero`, `suspended`. Track asset readiness separately. Pointer, camera, fragment, and spring positions remain runtime refs.
4. The scene owner retains shared source geometry/materials across handoff. Entrance-only resources are released after passage; shared Key resources remain until the hero world unmounts. Resets reuse loaded resources.
5. Define one `ScenePose`/projection contract for camera, artifact, aperture, and typography anchors. SVG receives projected endpoints from that pose. Cache viewport/bounds with ResizeObserver and font readiness; do not read DOM layout inside every animation frame.
6. The current entrance is orthographic. Test a restrained perspective camera (starting evaluation around 28–35° FOV) matched to the approved resting framing. A scale/zoom alone cannot create a convincing journey through depth. Camera choice stays provisional until actual 1440/390 comparisons preserve the static art direction.
7. Keep one actively rendering WebGL scene. Pause/offscreen-release later islands through visibility and an explicit activity coordinator. Start with one allocated canvas at a time; introduce a second sleeping retained context only if measured re-creation hitches justify it.
8. No WebGL draw loop while settled. Short transitions, inputs, and material settling request frames. Visibility loss cancels motion; resume from a stable pose.

The controller coordinates activity and handoff, not every scene's data. Local interaction stores stay local. Subscribe to semantic snapshots narrowly using the existing external-store pattern; do not broadcast pointer updates through React context.

## F. The Trace architecture

The Trace is a recurring **relationship**, not a single path stretched through 9,000 pixels of page.

| Scene | Trace meaning | Visual owner | Handoff |
| --- | --- | --- | --- |
| Entrance | Evidence of a world underneath | Small Three line in cavity | Project its endpoint into the hero's SVG plane during passage. |
| Hero | A thought exposed by the Key | Local SVG; short shared-world segment when occluded | Selected thought gives Thinking an entry emphasis. |
| Thinking | Investigation route | SVG + DOM labels | Exit endpoint points toward a curiosity connection. |
| Curiosity | Authored relationship between topics | SVG behind DOM words | Confirmed pair creates a short visual connection; never requires collecting all pairs. |
| Messy Middle | A system's functioning connection | Three curve during physical motion; SVG/DOM fallback | Breaking disconnects it; repair restores a genuinely different route. |
| Collaboration | Another perspective changes the route | SVG plus tracing overlay | Shared route becomes the Work selection stroke. |
| Work | Current project selection | SVG/DOM indicator | Finishes as a quiet open end; Now remains calm. |
| Contact | The question reaches a person | SVG | Resolves into the arrow beside the real email link. |

A small semantic payload may retain selected thought, explored branch, last discovered pair, repaired route, and selected project for the current session. Geometry stays scene-local. Use stable normalized entry/exit anchors, derived on resize, and explicit projection only where 2D and 3D meet.

Each scene can initialize independently on a direct anchor. Skipping the threshold, leaving halfway through an interaction, or reloading a URL must not require reconstructing the whole journey. Memory is optional continuity, not progression gating. No global pointer loop is needed.

## G. Scene storyboards

### 1. Threshold — BREAK

**First frame:** retain the large paper/enamel sculpture and registered headline. The seam leads into a dark cobalt recess. A small recognizable part of the Reveal Key is visible deeper inside, not a bright decorative stripe.

**Action → response:** approaching loads the restraint; existing hits leave persistent damage. The representative fragment releases with its print and shadow. The cavity now reveals the waiting object more clearly.

**Payoff / meaning:** the polished surface gives way to questions and an instrument for looking closer. Breaking demonstrates curiosity about what is hidden.

**Next:** offer **Come through** once the representative opening is ready, retain immediate Skip, and pass toward that Key. Do not require full destruction or expand breakable materials in this phase.

**Mobile / reduced motion:** dedicated reachable seam and shorter fragment travel; reduced mode changes states and enters immediately. Full HTML remains accessible with no JS.

### 2. Passage → Hero — REVEAL

**First frame:** the destination object is already present in the cavity. Its position, lighting, and Trace establish continuity.

**Action → response:** Come through starts a roughly 800–1,200ms bounded camera passage. Sidewalls enlarge and move past the viewport, rather than fading away. The Key remains visible while its surrounding space opens; DOM title alignment follows the shared pose. Input remains responsive, and Skip/Escape can finish immediately.

**Payoff / meaning:** arrive at a quiet instrument bench. The title remains **STRANGE QUESTIONS. USEFUL SYSTEMS.** A small identity line establishes Aditya as a developer/builder who follows odd details, persists through debugging, and builds with people.

**Hero action:** move the Key along its authored rail or select a thought. Its aperture exposes a note; a decorative type plane separates 20–40px locally, then registers again. The printed/semantic headline stays readable. One action reveals one thought, not five simultaneous effects.

**Next:** a revealed question leads naturally toward Thinking through a short PULL gesture tied to native scroll.

**Mobile / reduced motion:** explicit thought buttons and a short slider/tap interaction; reduced mode swaps states immediately. No precision hover requirement. Direct hash/return visit can land on the calm hero.

### 3. Thinking — TRACE

**First frame:** **WHY DID IT BEHAVE THAT WAY?** occupies the route's starting point. Three readable choices emerge from the same typographic composition; no separate option-list widget.

**Action → response:** select a route. One investigates the visible symptom and ends with **nope**; one loops back to a faulty assumption; one asks what changed just before. Author a small graph with about six nodes and three short routes, not an expanding infinite tree. Keep replay/other routes available.

**Payoff / meaning:** the route resolves into **TRACE THE CHANGE.** Copy: “I usually start with the thing that changed first.” The visitor experiences exploration before a conclusion.

**Next:** the line leaves an open connection for Curiosity. No forced completion or scroll lock.

**Mobile / reduced motion:** three 44px controls with the graph vertically recomposed; stable complete graph and all explanatory copy remain readable. Selection can emphasize a route instantly.

### 4. Curiosity — CONNECT

**First frame:** large topic words cross a vivid tomato/charcoal composition with unequal scale and meaningful overlap. Remove the rectangular workbench boundary. Keep breathing room and every established topic readable.

**Action → response:** pointer approach tilts a whole word by a bounded amount. Drag or select two topics; only existing authored relationships attract/snap. Nearby words yield briefly rather than orbiting forever. Cache bounds, limit active influence to the nearest two neighbors, and settle to stillness.

**Payoff / meaning:** browsers + security reveals an inspection plane; civic + visual systems draws a compact street/signal motif; agents + developer tools reveals a short execution trace. The question changes with the pairing. Different collisions make different authored discoveries.

**Next:** a completed relationship leaves a trace heading into an imperfect system. Do not reward a score or require discovering all eight pairings.

**Mobile / reduced motion:** two taps/select controls arrange a featured pair into a strong two-part composition. Remaining topics stay in readable text order rather than a miniature scattered field. Reduced mode has the same distinct motifs without magnetic flight.

### 5. Messy Middle — BREAK / REBUILD

**First frame:** a partially functioning physical system: two main masses, three meaningful supports, a few notes embedded beneath it. Keep the 15-note/material concept but do not turn all 15 entries into equal rigid tiles. Start with approximately 7–9 visible physical parts.

**Action → response:** a visitor tests a support or assumption. The Trace breaks; a joint redistributes load; paper slips; one note underneath exposes **WHY?** or **ASK SOMEONE**. Reuse the authored dependencies, material vocabulary, and entrance input contract.

**Payoff / meaning:** **Rebuild** is available without a damage-count requirement. Repair is the second signature moment: heavy parts seat precisely, light paper follows, a restraint regains tension, and the Trace reconnects along a visibly different route. The result is structurally improved, not the same board with a new caption.

**Next:** the repaired route still benefits from an external observation, setting up Collaboration.

**Mobile / reduced motion:** fewer visible parts and explicit test/rebuild controls; brief authored motion, no precision targeting. Reduced mode exposes damaged and repaired states immediately, with complete process notes in HTML. Keyboard gets the same normal/strong input equivalents as the entrance.

### 6. Collaboration — CHANGE

**First frame:** **MY FIRST PASS** ends against one crossed assumption. The representation is intentionally incomplete, quieter than the preceding repair.

**Action → response:** introduce a tracing-paper perspective with drag or **Another view**. The overlay crosses out the assumption, rotates one relationship, and exposes a route behind the obstacle. It changes the system rather than adding more network nodes.

**Payoff / meaning:** **OUR BETTER VERSION.** Copy: “Someone else can see the bit I’ve been staring at too long.” This demonstrates why other perspectives matter.

**Next:** the new route becomes the Work selection line. Real collaborators or contribution stories may be added only after evidence is verified; none are invented for this interaction.

**Mobile / reduced motion:** tap to place the second view, then toggle between the two readable states. Both explanations remain available; no drag gate or WebGL.

### 7. Work — OPEN

**First frame:** a concise list and one large stage. Intro: **Some places these ideas became real systems.** All repository links remain visible and direct.

**Action → response:** selection changes one stage in 300–500ms. Continuum leaves time traces; TracePilot reconnects a broken crimson path; NetraNagar shows saffron urban signals and a drone arc; AI Video Editor snaps acid-green strips to a cut; AI4Browser peels cyan page layers into an inspection state.

**Payoff / meaning:** projects are evidence of recurring questions. Each state uses its own grammar within the same composition and controls.

**Next:** step into a quiet Now area. Preserve the optional native Continuum disclosure; no project-page expansion in this architecture phase.

**Mobile / reduced motion:** stage above selection list, selection never opens a link unexpectedly, direct repository actions stay separate. Reduced mode changes stage instantly. Start SVG/DOM; add physical geometry only if the prototype materially improves.

### 8. Now — MOVE

**First frame:** **CURRENTLY LOST IN…** with a few supplied dated notes. No invented learning plans, expertise, or “currently building” claims.

**Action → response:** inspect/flip a note or move it within a small bounded arrangement. One quiet underside thought may appear. No collection mechanic.

**Payoff / meaning:** there is unfinished curiosity after the finished work.

**Next:** an open question leads to Contact. Until content is supplied, keep this section unpublished rather than filling it with fabricated facts; make the current navigation label accurately describe recurring interests in the first approved structure pass.

**Mobile / reduced motion:** tap to inspect, native reading order, no stacking required. Static notes with immediate flips in reduced mode.

### 9. Contact — SEND

**First frame:** charcoal, **HAVE A GOOD “WHAT IF?”**, a loose Trace end, and real contact links.

**Action → response:** focus/approach the email; the Trace tightens and resolves into an arrow in 150–250ms. Clicking performs the ordinary mail action.

**Payoff / meaning:** the question ends with a person, not another project selector.

**Endpoint:** `gayaladitya9@gmail.com`, GitHub `AntiDynamic`, and the existing LinkedIn URL remain direct HTML links. No sound, 3D, secret completion condition, or delayed navigation.

**Mobile / reduced motion:** tap/focus uses the same arrow endpoint; reduced mode displays it immediately.

## H. Intensity and transition vocabulary

| Moment | Intensity | Pacing reason |
| --- | --- | --- |
| Threshold / release | SIGNATURE | First physical consequence. |
| Passage | HIGH, brief | One spatial journey; no long intro. |
| Hero | QUIET → MEDIUM on input | Discover how Aditya thinks; breathe after the break. |
| Thinking | MEDIUM | Small choices, wrong turns, authored resolution. |
| Curiosity | HIGH | Typographic play and distinct connections. |
| Messy Middle / repair | SIGNATURE | Second peak; repair should be as satisfying as failure. |
| Collaboration | MEDIUM | Slower, clear change in perspective. |
| Work | MEDIUM | Rich evidence, quick selection, direct links. |
| Now | QUIET | Small unfinished thoughts. |
| Contact | QUIET with one SNAP | A precise closing response. |

**BREAK:** physical opening. **PULL:** one connection carries attention into the next composition. **PEEL:** a meaningful plane reveals another view. **SNAP:** disorder resolves into a readable state. Native scroll remains; these transitions occupy local boundaries, not prolonged pinned sequences. No automatic transition may delay link navigation.

Ordinary responses begin immediately; micro-feedback lasts roughly 80–160ms, route/state settling 200–500ms, and the two signature events may last about 800–1,400ms. Preserve different material damping rather than applying one universal spring.

## I. Performance and resilience plan

### Recorded baseline versus targets

Stage C.5 records aggregate generated JS at **463,448 bytes gzip**, entrance GLBs **37,704 / 35,656 bytes**, one major fragment, four/two chips, desktop DPR **1.5**, mobile **1.0**, and **36 pristine / 46 settled renderer calls including shadow passes**. It recorded zero further draws during a one-second idle check and bounded resources over four resets. These are prior measured findings, not newly measured hardware results. Aggregate build JS is not initial-route payload.

| Area | Proposed budget / rule |
| --- | --- |
| New scene-specific JS | Prefer under 15 KB gzip per DOM/SVG mechanic. Treat 30 KB as a review trigger, not a blanket allowance. Measure critical-route transfer separately from all build chunks. |
| WebGL code | Existing Three/R3F loaded lazily; no duplicate engine bundles. Route usability must precede their readiness. |
| GLBs | Keep existing entrance assets. Suggested ceilings: Key 100 KB, Messy assembly 180 KB, all used signature models about 350 KB before transfer compression. Exceed only with visible proof. |
| Textures | Procedural detail 128–512px; printed atlas up to existing 2048px. Account for decoded/GPU memory: a 2048 RGBA atlas is 16 MiB before mipmaps, regardless of download size. Test a smaller mobile atlas. |
| Environment | No HDRI by default: the previous studio-probe A/B did not justify resource cost. |
| Rendering | Demand mode, no settled draws. Budget fewer than roughly 60 calls in the resting physical scene; inspect brief peak separately. Preserve existing desktop/mobile DPR caps. |
| Shadows | One important key; 2048 desktop / 1024 mobile remains a cost to measure. Reduce casting objects/map size before degrading input responsiveness. |
| Debris | Entrance stays one major fragment + four/two chips. Messy Middle caps are defined per authored scene, not a global particle field. |
| Audio | Existing 25,875-byte Foley palette remains unloaded until explicit opt-in. Decode once, cap simultaneous voices, suspend when hidden. |

### Lifecycle

- Prepare hero geometry, print, and materials while the threshold is useful. Module preloading alone is not shader readiness. Track actual resource/compile readiness.
- Warm only the immediately upcoming physical scene. Do not mount every possible world invisibly.
- Cache input targets/bounds; update refs/transforms once per requested frame. React renders semantic selections or phase changes.
- Use IntersectionObserver and visibility state to suspend local motion. No infinite idle animation, automatic replay, or global scroll RAF when nothing changes.
- Share geometry/materials within the entrance/hero owner. Dispose clones, textures, geometry, listeners, and pending frames at their true ownership boundary.
- Begin with balanced desktop and low mobile tiers. Add automatic quality changes only after sustained real-device measurements; use hysteresis, not per-frame quality oscillation.
- No camera passage or debris in reduced motion. SVG retains the authored opening, thought, route, damage, and repair states under WebGL failure.
- Server content, navigation, email, repository links, and descriptions stay usable without JavaScript. Direct section anchors bypass the threshold.

### Accessibility contract

Every scene has semantic headings and readable explanatory text before interaction; native controls, visible focus, 44px practical targets, and an explicit touch/keyboard equivalent. Decorative text/geometry is hidden from assistive technology. State changes announce concise outcomes, not pointer pixels or continuous physics. A held gesture has an ordinary-button equivalent. Content and navigation never require a game outcome. Forced colors, zoom, keyboard focus during motion, context loss, and mid-transition preference changes are review cases.

## J. Focused implementation phases

Each phase produces an observable website change, screenshots/video, a review, and a commit/push. No phase is complete because only its state model works.

1. **Approve this architecture.** Update the relevant DESIGN.md contracts deliberately. No broad refactor or new effects yet.
2. **Destination + passage composition.** Put a recognizable Key inside the existing cavity; establish shared coordinate/resource ownership. Match existing static framing at 1440/390 before adding passage motion. Do not change destruction mechanics.
3. **Entrance → hero passage only.** Implement the bounded journey and calm landing with synchronized DOM/SVG. Keep Skip, immediate fallback, native scrolling after entry, and zero idle draws. This is the first recommended major visible build.
4. **Hero local reveal quality.** Fix aperture registration, shadow/contact, and one typographic-plane consequence. Only author a Blender Key if the new render proves its need. Stop and review this experience.
5. **Thinking only.** Small authored investigation graph, dead end, loop, and resolution. No WebGL.
6. **Curiosity only.** Reuse topics/pairs; whole-word magnetism and distinct authored motifs. Fetch further shortlisted 21st source after quota reset; rewrite mechanics rather than import a template.
7. **Messy Middle only.** First static physical-system composition, then one support failure, then a visibly better rebuild. Review each substage before scaling to other materials.
8. **Collaboration only.** Second-view overlay changes the assumption and route. No collaborator claims without evidence.
9. **Work stage only.** One reusable SVG/DOM stage; preserve direct links and existing Continuum disclosure. Evaluate 3D only after this stage is convincing.
10. **Now, then Contact.** Collect genuine current content first; build quiet notes, then the final Trace endpoint as separate small reviews.
11. **Optional audio + integrated polish.** Opt-in Foley, continuity, real-device frame pacing, accessibility, and responsive fatigue review. No music or sound requirement for understanding.

Per implementation gate: production build; screenshots at 1440, 1024, 768, 390, 320; muted motion study for physical events; pointer/touch/keyboard; reduced motion, failure/no-JS, direct anchors, reset, focus transfer, hidden-tab behavior; bundle delta, resource plateau, idle-draw observation. Compare before/after at the same pose, not unrelated pretty frames. Report real-device frame measurements only when available.

## K. Risks and prevention

| Risk | Prevention / rejection gate |
| --- | --- |
| Generic | Reject heading + boxed widget repetition; each scene changes a composition through its own verb. Distinct curiosity motifs and repair topology must be visible. |
| Slow | One active renderer, small source assets, cached bounds, demand motion, narrow state subscriptions. Measure first-use compilation and transition frames. |
| Game aesthetic | No reticle/crosshair, meters, health, progress score, achievements, combat sound, or targets. Material consequence and marginal notes explain the interaction. |
| Inaccessible | Reading/navigation never gated; stable native controls and immediate reduced/fallback states. Decorative spectacle must not obscure focus or hit areas. |
| Over-engineered | No global physics/canvas/scene graph for ordinary text. Keep local data stores and shared ownership only where a physical handoff requires it. |
| Inconsistent | Same paper/ink/material palette, limited four-verb transition vocabulary, local Trace handoffs, typography roles, and unequal intensity. |
| Flat despite 3D | Reject a passage if there is no occlusion, sidewall parallax, recognizable destination, or relative scale change. Reject the Key if its shadow and aperture still appear detached from type. |
| Fake personality | Established interests only; owner-supplied Now notes; verified contribution stories. Copy describes behavior without invented metrics, dates, or expertise. |
| Long intro | Always Skip; opening readiness after the representative break; brief bounded passage; return/deep-link bypass. |

## L. What not to use

| Scene | Unnecessary resources |
| --- | --- |
| Entrance/passage | 21st templates, Rapier, whole-scene Blender export, giant HDRI, bloom/postprocessing, global canvas refactor. |
| Hero | Letter-by-letter proximity dependency, a second simultaneously active renderer, physics, decorative idle loop. |
| Thinking | R3F, Blender, Canvas, Lenis, physics, generic scrollytelling template. |
| Curiosity | WebGL, random rigid-body simulation, per-letter frame measurements, particle typography, bubble/tag-cloud component. |
| Messy Middle | Full destruction solver, hundreds of fragments, automatic Rapier installation, five unrelated material engines. |
| Collaboration | WebGL, team avatars, network/contribution graphs, fabricated evidence, physics. |
| Work | Five WebGL worlds, portfolio template, SaaS showcase styling, gallery-scale asset downloads. |
| Now | WebGL, physics, stock current-status claims, continuous shuffle. |
| Contact | WebGL, sound, global pointer-tracking engine, delayed mail navigation. |
| Shared system | Lenis by default, React 19.3-only APIs on 19.2.8, giant global controller, unverified copied component code. |

Every later dependency proposal must state problem, visible benefit, bundle/runtime/maintenance cost, and the existing-tool alternative. The current recommendation is **no new runtime dependencies**.

## M. Final recommendation

Build a physical opening that leads to a recognizable instrument, then a sequence of smaller playable thoughts. The visitor breaks a surface, follows a question, discovers a relationship, repairs an assumption, and watches another perspective improve it. Work appears as the evidence of those habits. The ending returns the visitor to Aditya through a direct, personal contact.

The website should feel responsive even when still: clear contact, readable material edges, authored scale, and subjects that belong to their space. Interaction changes those relationships immediately, then settles. The two physical peaks make the quiet moments stronger. Its personality comes from the questions, wrong turns, timing, and willingness to let another view change the work.

**Recommended next approval:** destination + entrance-to-hero passage, with shared-world ownership limited to that pair. The test is concrete: the Key seen behind the broken enamel must be the same object the visitor reaches. That visible continuity is the highest-value step toward the depth and confidence in the reference.

Stop here for architecture review. No implementation, dependency installation, or DESIGN.md change is included in this checkpoint.
