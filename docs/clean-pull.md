# Clean pull and pacing

The subsequent repair for suppressed motion and fast scroll jumps is documented in `motion-repair.md`. Full motion can be requested explicitly with `?motion=full` and is remembered per site. A motion-choice button is available when keyboard focus reveals the otherwise unobtrusive controls.

The current opening presents the black hole immediately against darkness. The introductory name, invitation, exterior typography and stars are removed. Ordinary viewing has no header or sound/motion controls. Keyboard users can still reveal the skip link by focusing it, or press Escape to reach identity. OS reduced-motion preference remains supported. The development indicator is disabled for an unobstructed local preview.

Accretion material runs at 2.2 times the former presentation speed through `uTimeScale`, preserving radius-dependent angular velocity, shared direct/lensed sampling and the unchanged relativistic brightness calculation. This is a presentation time scale in a dimensionless rendering model, not a measurement of orbital speed for a specified black-hole mass. The shadow stays fixed at a fixed scroll position.

The approach begins without the earlier camera-distance plateau. Reduced azimuthal travel and camera roll make the path feel more directly inward. Normal scroll damping increases from 85 ms to 125 ms; the white-point phase uses 190 ms. These are response constants, not mandatory playback delays, so the user retains native scroll control.

The white point emerges over .861–.884 and approaches over .882–.950, versus the former .890–.950 approach. This allocates about 13% more scroll distance to the approach. The expansion exponent changes from 3.5 to 2.8, distributing more growth before the final whiteout. The light remains the existing expressive sphere/ray intersection, not a scientific claim about emission from a singularity.

Word fracture unfolds across .632–.780 rather than .642–.765. The spatial fault eases in over .660–.710 and out over .728–.775, replacing its shorter onset. Depth displacement is reduced from 8 to 5 scene units. These changes aim to keep continuous movement while retaining fractured letters.

Event Horizon no longer starts or continues optional music, including when the portfolio's music was already enabled. The audio provider pauses all media and zeros gains on this pathname. Existing portfolio music behavior remains available outside this route; audio files are retained rather than deleted.

## Physics references

- [NASA Goddard / Jeremy Schnittman, Black Hole Accretion Disk Visualization](https://svs.gsfc.nasa.gov/13326/): faster inner orbital motion shears bright regions; Doppler beaming creates brightness asymmetry; bent rays expose secondary views of the same disk. Reviewed for the flow and shared-lensing relationship, not as a source of copied assets.
- [Andrew Hamilton / JILA, Falling into a Black Hole](https://jila.colorado.edu/~ajsh/courses/bh/index.html): relativistic observer motion and gravitationally distorted views. Our exterior retains its existing static-observer Schwarzschild ray model; the interior and white point remain artistic extrapolations.

Blender CLI is available but was not used. This revision changes realtime uniforms, camera curves and native-scroll response; adding offline rendered footage would not solve those runtime relationships.

## Checks

Current desktop/mobile viewport captures are in `visual-qa/reality-fracture/`. The clean-opening and behavior assertions are in `visual-qa/clean-pull/`. Viewport emulation is not a physical-phone performance measurement. Earlier timing reports concern earlier compositions.

Removed the unused exterior typography atlas (about 6 MiB RGBA) and its per-ray intersection work. Star shading early-outs at zero intensity. No additional passes, textures or noise samples were introduced. Faster presentation speed increases phase movement per frame, not shader iteration count.

## Fullscreen/resize correction

The latest user recording, `screenrecording-2026-10-07_11-03-49.mp4`, showed disruption when switching between a small window and fullscreen. A reproduction at 680×292 then 1366×768 changed normalized progress from .3999 to .1368 because the driver retained the old pixel scroll position against a new viewport-dependent track height. The corrected driver preserves the displayed progress, recomputes the track, and aligns the native scroll position to that same stage. Browser scroll anchoring is disabled within the experience so hidden identity content cannot become an unintended anchor.

Escape no longer skips during DOM fullscreen or a viewport matching the screen's fullscreen dimensions, and repeated/default-prevented Escape events are ignored. Windowed Escape and the keyboard-focusable skip link remain available. OS reduced-motion changes also preserve the stage while updating the track height. The `#identity` deep link intentionally still opens the identity stage.

The driver also observes the experience's actual laid-out height. This catches CSS viewport-unit and reduced-motion track changes that may settle after the initial resize/media event, and realigns scroll using the preserved stage. The layout observer is disconnected on unmount alongside the existing visibility observer.

Regression artifacts live in `visual-qa/fullscreen-fix/`, covering resize in both directions at progress .4, .68, .885, .925, .98 and 1, plus fullscreen/windowed Escape and preference changes. Inspection of the recording used chronological extracted frames; actual browser fullscreen is detected by the application, while automated resize tests emulate its viewport/screen dimensions.

The final regression run passed against `next start` on port 3000, with zero captured browser errors. A separate real DOM `requestFullscreen` / Escape / `exitFullscreen` check also preserved the stage. The local preview now runs the verified production build after an intermittent development-server response error appeared during verification.
