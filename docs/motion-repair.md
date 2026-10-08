# Motion repair

The latest user recording, `screenrecording-2026-10-07_11-21-55.mp4`, shows a nearly fixed observer followed by very short intermediate scenes and the identity screen. Twelve-frame-per-second extraction around the transition exposed the missing dwell time, which the earlier one-second contact sheet could not establish.

Two application behaviors could produce this result. The reduced-motion branch intentionally fixes the observer, slows disk time and assigns scroll progress immediately; removing the motion-choice control also removed the way to request full motion. Separately, unrestricted scroll targets could traverse narrow scenes in a few frames when a large wheel input moved the page directly toward the end.

The desktop's GNOME animation setting was read as false. A separate native Chromium profile reported no reduced-motion preference, so that setting alone does not prove the user's original tab's media-query state. The recording visually resembles the reduced branch; the repair covers both that branch and large scroll jumps rather than asserting an unobserved browser preference.

## Explicit motion choice

`/lab/event-horizon?motion=full` requests full animation regardless of the browser's reduced-motion media query. `?motion=reduced` requests the reduced experience. Valid choices are saved under `event-horizon-motion` in origin-local storage and reused on subsequent visits to the bare route. Without an explicit or saved choice, the browser's preference remains authoritative. Storage failures do not prevent the URL choice from working.

The otherwise hidden keyboard controls include a full/reduced-motion toggle. Tab reveals the controls; activating the toggle saves the choice, updates the URL and preserves the scene position. No visible sound control, header or desktop setting was introduced or changed.

## Progress pacing

Full motion still follows native scroll and exponential easing, but visual progress cannot advance or reverse faster than .26 per second in the exterior, .16 in the word field, .045 around the white point, and .07 during reformation. Crossing .575, .855 or .955 lands on the boundary before using the next stage's rate. This keeps a large wheel delta or an End-key jump from flashing through the sequence. Fine scroll input remains eased rather than forced to move at those maximum rates.

The browser scrollbar can reach its target before the rendered sequence catches up. This bounded lag is intentional. Explicit skip and the `#identity` link bypass the pacing. Reduced motion continues to use immediate progress without forcing the extended cinematic path.

The simulation clock remains independent, so accretion continues at idle. Full-motion choice restores the scroll-driven observer, depth traversal and letter deformation. Existing visibility, context-loss, fullscreen/resize preservation and post-handoff sleep remain in place.

## Verification

Artifacts are under `visual-qa/motion-repair/`. The regression uses an OS-reduced-motion browser context, reproduces the default reduced branch, then requests full motion explicitly. It tests idle time advancement, a real 12,000-pixel wheel input, stage dwell times, persistence on a bare-route revisit, keyboard toggling, explicit skip and renderer sleep after handoff. Screenshots capture approach, words, fracture, white point, whiteout and identity. These are desktop/browser tests, not a claim of physical-phone or universal GPU performance.

The independent native-Chromium diagnostic used a temporary browser profile and was closed after inspection. The user's browser profile and system animation settings were not modified.

The production regression passed with zero browser errors. Simulation time advanced 1.999 seconds during a two-second idle sample. Following one large wheel input, the captured approach lasted about 2.25 seconds, the word field 1.73 seconds, the white-point interval 2.22 seconds and reformation 0.85 seconds. These durations describe this test input and machine, not fixed playback durations for all scrolling behavior. The full-motion choice persisted when revisiting the bare URL. Keyboard reduced/full toggling, Escape skipping and renderer sleep after handoff also passed.
