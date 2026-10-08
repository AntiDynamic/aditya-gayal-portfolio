# Production release — 2026-10-09

This records the previous production release. The later soundtrack, mobile-room and depth changes are documented in `docs/depth-performance-pass.md`; measurements and music timing below describe that earlier release, not the current working tree.

## Deployment

Public production: https://aditya-gayal-portfolio.vercel.app/

The complete black-hole → room → physical monitor → editorial portfolio path is retained. The root URL starts at the black hole on every visit. `?portfolio` and section hashes bypass the prologue; `?room=1` opens the room directly. `?replay=1&motion=full` remains an explicit full-motion link. The approved black-hole renderer, room layout, movement, camera and material design are not redesigned in this release.

Vercel project: `aditya-gayal-portfolio`, under the existing owner's account. Deployment uploads approximately 7 MB, not the 2.5 GB QA archive. `.vercelignore` excludes local environment files, credentials, git history, test recordings, scripts, source documentation and local build/dependency directories. The hosted production alias is anonymously accessible over HTTPS; unique deployment/inspection URLs retain Vercel authentication. No project-wide protection was disabled. No git commit, push, new branch or unrelated Vercel project was changed.

The remote build uses Node 24 and the repository's pinned pnpm 11.3.0 through `ENABLE_EXPERIMENTAL_COREPACK=1`. Automatic GitHub deployment could not connect because this Vercel account needs a GitHub login connection. This does not prevent CLI releases; it is not a failed production deployment. The CLI-generated `.env.local` and `.vercel` linkage remain ignored and are not public assets.

## Integration and quality of life

- Media remains real HTML beneath WebGL enhancement; the existing native-image reliability fix is retained.
- Image decoding, font preparation and shader warm-up still precede readiness; the monitor retains its bounded preparation window.
- A first-in-tab-order keyboard skip link can bypass the entire prologue and reach Work. It appears only on keyboard focus and also works without JavaScript. The session completion gate was removed so visitors using the main URL consistently see the intro; direct section URLs still bypass it.
- A missing page has a real 404 response and a direct portfolio recovery link. The runtime error boundary offers Next.js's current `retry()` recovery API and a hard-navigation bypass link rather than exposing exception details. An injected-boundary test exposed that client navigation to the same pathname does not clear the existing error; the bypass now deliberately reloads the portfolio, while preserving normal modifier/new-tab link behavior.
- Portfolio gestures no longer create a separate cosmic audio context when no prologue is mounted.
- Music network errors announce a restrained accessible status and return the button to its off state. A subsequent play gesture retries media loading instead of leaving the audio element permanently in its failed state.
- Original portfolio music remains opt-in, fades in/out, pauses when hidden or inside a prologue, and has an explicit mute. The licensed prologue sound design and silent interior-text stages are unchanged.
- Canonical metadata, Open Graph URL, robots and sitemap derive from Vercel's production hostname, not localhost or a temporary preview. `/lab/` is excluded from indexing; robots is not access control.

## Security boundaries

Response headers are set in `next.config.ts` and checked on the anonymously accessible production host:

- CSP limits scripts, styles, fonts, audio and network requests to this origin, with local `blob:` handling for Three.js embedded GLB textures and audio. Images also allow local data URLs. Objects and framing are denied; base URLs and form actions are restricted.
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict-origin referrer policy.
- Camera, microphone, geolocation, payment and USB permissions are denied. Same-origin fullscreen and audio remain available for the actual experience.
- The framework's `X-Powered-By` header is disabled. Vercel supplies HTTPS and HSTS.
- Environment, git, QA and source-document paths return 404. External links retain their existing `noreferrer` behavior.

An initial CSP candidate blocked Three.js's `fetch(blob:)` embedded texture decoding. The room regression suite caught the console failures even though movement and handoff still worked. The policy now explicitly permits local blob connections; the fix does not add arbitrary external network origins. The initial candidate is not the final release.

This is a static-compatible CSP, **not** a strict nonce policy. Inline scripts are still permitted for Next.js hydration and the constant prologue bootstrap; inline styles are required by the shared motion system. Production does not permit `unsafe-eval`. Introducing request-specific nonces would require a different rendering/caching strategy and should not be represented as already implemented. No user-authored HTML, forms, authentication, upload service or backend was added.

`pnpm audit --prod` reports zero known advisories across 94 runtime/optional dependency entries. The full developer-tool audit reports one high-severity `braces@3.0.3` advisory through Next's ESLint plugin → fast-glob → micromatch. The registry has no `braces@3.0.4` release available, despite the audit's suggested patched range; the primary advisory also lists no patched version. This code is a build/lint dependency, not a shipped request handler, and this site does not accept visitor-supplied glob expressions. It remains an explicitly recorded development-tool risk, not a concealed zero-vulnerability claim. Do not install an invented patch version or blindly suppress the audit.

## Music and rights

The existing `public/audio/work-in-progress.mp3` is an original 84 BPM, 45.714-second synthesis of warm keys, bass, restrained percussion and stereo delay. It is deliberately quieter than a cinematic soundtrack and uses no third-party samples or copyrighted track. The reproducible composition is in `scripts/assets/compose-portfolio-music.mjs`. Existing room/prologue recording licenses and attribution remain in `docs/audio-sources.md`, `docs/sound-design.md`, and `public/audio/ASSETS.md`. No new downloaded asset or Blender work was needed for this release.

## Verification and limits

`scripts/release-qa.mjs` tests 1440, 1024 and 390 widths, anonymously served security headers, all five decoded media sources, chapter navigation, overflow, original music play/mute, keyboard prologue bypass, missing-page recovery, asset serving, and nonpublic paths. It collects JavaScript errors and CSP violations rather than treating a 200 response as sufficient. Existing motion and room suites additionally test repeat root visits, native wheel/touch activation, reduced motion, pointer-lock escape, walking collision, notebook inspection, power restoration, monitor handoff, direct links, no-JavaScript access and WebGL failure.

Evidence lives in `visual-qa/release/`: `live-final/` for production media/security screenshots and checks, `live-motion/` for activation paths, and `live-room/` for recorded production handoffs. Earlier baseline motion/performance measurements and visual tradeoffs remain in `docs/portfolio-repair.md`. Browser capture rate is not measured renderer FPS. The release does not claim universal 60 FPS or feature parity with Lusion.

The earlier production room suite passed 18 named checks with no JavaScript or console errors, including desktop, real emulated touch at 390 px, reduced motion and all fallback paths. The repeat-visit assertion is updated in the current suite to require the black hole again. The 1440/1024/390/reduced portfolio suite also passes context restoration, decoded images, contrast, native anchors, overflow and no-JavaScript checks. Injected root React-boundary tests separately prove both retry and hard-navigation bypass; test-only fiber access is not part of shipped code.

The final music recovery suite deliberately aborts the first soundtrack download, verifies its accessible failure status, retries through a new user gesture, then simulates hidden/visible document states and checks pause/resume/mute. All four checks pass on the production host with no JavaScript errors: `visual-qa/release/live-music-recovery/report.json`. Final `pnpm lint`, production build, TypeScript and `git diff --check` pass. The production alias was rechecked anonymously after the final release; no login or deployment-protection bypass token is needed.

Recorded production scrolling while local recording conversion/build work was also active measured 16.7 ms median and 33.3–33.4 ms p95 at all four widths/modes. An isolated unrecorded 1440 × 1000 production-host run with natural wheel input measured **885 samples: 16.7 ms median, 16.7 ms p95, one interval over 33.4 ms**. Maximum rendering budget remained five draws / 3,076 triangles, five textures, quality 1.50 and zero steady-scroll layout reads. The mobile recorded run peaked at four draws / 774 triangles; reduced motion drew zero triangles. These are workstation Chromium frame intervals, not independently measured GPU time or physical-phone FPS. Evidence: `live-editorial/report.json` and `pacing.json`.

Production recordings were converted and reviewed as sequential frame sheets, not certified through realtime agent viewing or subjective audio listening:

- `visual-qa/release/live-room/recordings/desktop-with-room-audio.mp4`
- `visual-qa/release/live-room/recordings/mobile-with-room-audio.mp4`
- `visual-qa/release/live-room/recordings/reduced-with-room-audio.mp4`
- `visual-qa/release/live-editorial/recordings/desktop.mp4` (silent browser capture)
- `visual-qa/release/live-editorial/recordings/mobile.mp4` (silent browser capture)

The room capture includes scripted holds, collision/look checks and exploration pauses; it is not a tightly edited visitor-speed trailer. Audio capture is approximately synchronized. Main-site music should be auditioned through the live Music control. Review galleries are `live-room/index.html` and `live-editorial/index.html`; all QA assets remain local, not public deployment routes.

Physical-device Safari/iOS testing remains outstanding. Native image backing can expose a narrow edge during nonlinear shader bending. The music is synthesized rather than a live recording; playback/fades are tested, but subjective suitability is not established through agent listening. A production deployment is not a penetration-test certification. Keep the developer-tool advisory, permissive inline CSP boundary, and disconnected automatic GitHub deployment visible in future maintenance.

## Primary references

- Next.js headers: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
- Next.js CSP and nonce/static-rendering tradeoff: https://nextjs.org/docs/app/guides/content-security-policy
- Installed Next.js error-boundary API: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`
- Vercel CLI deployment: https://vercel.com/docs/cli/deploy
- Vercel Corepack builds: https://vercel.com/docs/builds/configure-a-build
- Vercel production hostname: https://vercel.com/docs/environment-variables/system-environment-variables
- Development-tool advisory: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
