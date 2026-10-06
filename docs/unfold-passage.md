# Unfold the Surface — scroll opening

## What changed

The opening now follows native scroll position. The click/hold pressure controls, cracks, damage states, airborne fragment and repeated-hit instructions are absent from the entrance. Earlier break modules and Blender source are preserved as historical work; the entrance does not mount their controls or motion hook.

One scroll target drives the physical assembly, camera, Reveal Key and HTML annotations. The paper curls around a hinge, the enamel counterweight swings outward, the joins leave with the foreground, and a cobalt recess exposes the same Key that remains in the hero. Scroll backward within the threshold to close it. A separate button can play the passage; Skip and Escape enter immediately.

The track uses approximately 1.1 viewport heights on desktop and 0.95 on mobile. It collapses with matching scroll compensation at handoff, allowing normal page scrolling to continue. Return visits bypass the opening within the session. `?entrance=1` replays it. Initial section hashes bypass the track entirely.

## Depth and motion

- Paper is subdivided only enough for an analytic cylindrical bend. UVs remain registered to the printed face. Vertex normals and the depth-only shadow shader share the same fold uniforms, so the light response and shadow follow the actual deformation.
- Dense enamel has a different hinge rotation and readable thickness; its printed letters move with its face. Existing small Blender-authored metal and rubber joins are reused.
- Foreground movement leads the camera. A restrained 32-degree perspective, bounded lateral arc and forward approach reveal sidewalls and overlap. The final camera projection matches the hero layout.
- The recess has a dark cobalt far plane, sidewalls, a lower ledge and a sparse distant Trace. Removed the old enlarged blue blocks from the Key's path. The recess yields to the ordinary hero near the end.
- Interior copy appears after the printed sheets have cleared its reading area. The support pieces move away early enough to keep that space clear on mobile.
- GSAP follows native scroll with a bounded 380ms settling response. Wheel and touch events are not prevented. Button playback runs approximately 1.8 seconds and yields to manual wheel/touch input.
- The hero's arrival now uses a local GSAP sequence rather than a CSS animation that could remain paused while the underlying content was inert. Key color, field and ink update together to prevent a transient contrast mismatch.

## Boundaries and lifecycle

HTML owns identity, semantic headings, controls, thought descriptions, navigation and links. SVG owns the immediate fallback. Three owns the physical sheets, joints, chamber, lighting and Key. CSS handles local layering and fallback separation.

The existing shared renderer survives the entrance-to-hero passage. Entrance geometry, materials and textures are released when its Field unmounts. The Key and renderer continue. Transient pose values are refs and shader uniforms; they do not use per-frame React state. Demand rendering stops after the input target settles.

No dependency, downloaded texture, model, audio file, physics engine or postprocessing chain was added. The existing responsive GLBs and print atlas remain the asset foundation. Paper grain intensity was reduced to keep the material contemporary and restrained.

The single global CSS adjustment changes `scroll-behavior` to `auto`: Lenis owns wheel easing after entry, while native fragment navigation stays immediate. Combining CSS smooth scrolling with Lenis had interrupted initial deep-link positioning.

## Review

### Design — ui-ux-pro-max

The opening changes its structure and silhouette. Printed type moves across actual depth planes; paper curls while enamel stays rigid. The same Key survives the passage. Removed support geometry from the reading area, reduced grain, kept solid colors and omitted impact/game interface styling. The initial frame remains intentionally near-frontal; its depth is most evident during unfolding.

### UX — ui-design

Native wheel and touch swipes work, PageDown advances the opening, Tab reaches both controls, and Enter activates playback. Modal focus cycles between controls; Escape and Skip remain immediate. Handoff transfers focus to the semantic hero heading without scrolling it again. Interactive controls retain visible focus; the noninteractive heading does not acquire a decorative browser outline.

Reduced motion bypasses the threshold, removes the shared WebGL scene and keeps the readable SVG hero. Live preference changes remove/restore the scene. WebGL failure retains the separating SVG layers and the ability to enter. No-JavaScript visitors get the ordinary homepage; both entrance and its background are hidden. Email, GitHub, LinkedIn and project links remain HTML.

Initial direct hashes never insert entrance scroll space. Production verification of `#work` places the section approximately 124px below the viewport top and mounts no canvas initially. No action depends on completing the animation.

### Engineering — React / Next.js / Tailwind / Vercel performance

Preserved the server-rendered homepage behind a narrow client gate. Scene imports remain lazy. GSAP contexts, listeners, resize observers, optional playback and settling tweens have cleanup. Fold geometry and Three resources have disposal. Materials are configured through R3F callbacks; a depth material is declaratively attached rather than mutated as a React render value. New scene styles stay in the module.

## Production QA

Rendered pristine, opening and hero states at 1440, 1024, 768, 390 and 320px. All five widths entered successfully, focused `hero-title`, kept the headline fully visible and produced no horizontal overflow. Native wheel, native touch, keyboard scrolling, native Enter playback, reverse settling, Escape, returning visits, reduced motion, SVG failure and no-JS paths were checked.

The first campaigns exposed paused hero text, a foreground support crossing the reading area, a no-JS background covering content and conflicting fragment scroll drivers. Those were corrected and their affected paths were rerun. Forced WebGL failure produced expected caught context-creation diagnostics; normal final input checks recorded no uncaught exceptions or console errors.

At a settled half-open pose, all five widths recorded **zero additional GPU draws** in the instrumented idle window. Sampled opening counters: 46–47 draw calls including shadow passes, approximately 20,848–26,762 triangles including shadow work, 21 geometries, 8 textures and 16 programs. These figures depend on pose and visible shadow casters. Desktop DPR is capped at 1.5, mobile at 1.0; sampled captures used DPR 1. Shadow maps remain 2048 desktop /1024 mobile.

`pnpm lint` and the production build pass. With gzip level 9 held constant, all generated JavaScript chunks total **508,413 bytes**, compared with **508,282 bytes** before this pass: **131 bytes growth**. Replacing the live break choreography offsets most of the new fold/handoff code. Aggregate generated chunks are not the initial-route network payload.

## Local artifacts

The ignored `visual-qa/unfold-production/` directory contains five-width `pristine-*`, `opening-*` and `hero-*` captures, corrected `final-opening-*`, `approved-hero-*`, `final-no-js-390.png`, fallback/reduced-motion captures and JSON reports. The final build places Work approximately 124px below the viewport top and verifies the saffron thought field with matching charcoal ink. `final-check.json` supersedes the initial keyboard-playback sample; initial direct-link samples were rerun after the scroll-driver correction.

`unfold-motion-study.mp4` and `motion-contact-sheet.jpg` use 26 actual browser frames at authored scroll positions. The video plays these samples at 5fps to show the complete transformation. It is a controlled motion study, not a real-device FPS benchmark. The recording produced no uncaught exceptions or console errors.

## Remaining limits

This pass completes the entrance-to-hero connection. Thinking, Curiosity, Process, Collaboration and Work retain their previous implementations and have not received the proposed next scene passes. The chamber is an authored stylized recess rather than a full navigable environment. The Key's geometry still has room for stronger material and silhouette refinement.

QA used software-rendered Chromium. Real laptop/phone frame pacing, shader compilation latency and device-specific touch behavior still need hardware measurements. No 60fps claim is made. Keep the render lifecycle and accessibility behavior while refining visual quality.
