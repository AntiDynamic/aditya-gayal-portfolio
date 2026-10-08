# Aditya Gayal — portfolio

A realtime black-hole opening leads into a first-person workspace and a cream editorial portfolio. Real photographs, project media and typography gain restrained spatial behavior without losing their normal HTML layout.

## Run

```bash
pnpm dev
```

- `http://localhost:3000/?portfolio` — actual portfolio directly.
- `http://localhost:3000/` — complete opening on every visit.
- `http://localhost:3000/?replay=1&motion=full` — explicit full-motion replay.
- `http://localhost:3000/?room=1` — room directly.
- `http://localhost:3000/#work` — selected work, bypassing the prologue.
- `http://localhost:3000/lab/event-horizon` — black-hole renderer review.

The root URL starts at the black hole on every visit. `?portfolio` and direct section links bypass the prologue. The portfolio hero offers **Watch the intro** to restart it. Reduced motion keeps the black-hole opening while shortening its animation and guiding the room; `?room=1` opens the guided room directly. Keyboard access, Escape, WebGL fallback, and content without JavaScript remain available.

## Current implementation

Next.js App Router, React, TypeScript, Tailwind CSS, Three.js, and Web Audio. Native scrolling drives scene targets. Animation uses refs and shader uniforms; there is no per-frame React state. Hidden and offscreen scenes stop rendering. The portfolio remains semantic HTML.

The black-hole renderer, first-person room, and monitor transition are documented in [black-hole references](docs/event-horizon-references.md), [room prologue](docs/room-prologue.md), and [prologue polish](docs/prologue-lock.md). The actual website is documented in [editorial portfolio](docs/editorial-portfolio.md), its [depth pass](docs/editorial-depth.md), and [everyday motion and activation](docs/editorial-fluidity.md). Technical references and asset rights are in [animation references](docs/animation-references.md). Project provenance is in [content sources](docs/portfolio-content-sources.md).

## Assets and sound

The active room uses optimized CC0 props and materials, an original Blender shell, and an OFL handwriting font. See [asset sources](docs/asset-sources.md). Its reusable scripts live in `scripts/assets/` and `scripts/blender/`.

Audio uses the existing prologue mix and licensed environmental samples. Browsers may require a natural click, tap, or key before playback. Text stages remain silent. The portfolio has an optional original soundtrack, enabled through its Music control; see [image reliability and interactions](docs/portfolio-repair.md), [sound design](docs/sound-design.md), [audio sources](docs/audio-sources.md), and [audio asset licenses](public/audio/ASSETS.md).

## Checks

```bash
pnpm lint
pnpm build
pnpm start
QA_URL=http://localhost:3000 node scripts/editorial-qa.mjs
QA_URL=http://localhost:3000 node scripts/elevation-flow-qa.mjs
QA_URL=http://localhost:3000 node scripts/room-walk-qa.mjs
```

Current portfolio repair screenshots and recordings are in `visual-qa/repair/`; the review gallery is served locally at `http://localhost:3002/`. Earlier room, black-hole, and audio regression evidence remains in the corresponding `visual-qa/` directories. Chromium is required for browser QA; FFmpeg is required for recording conversion. Development and production builds explicitly use Webpack.

## Production

- Complete experience: https://aditya-gayal-portfolio.vercel.app/
- Portfolio only: https://aditya-gayal-portfolio.vercel.app/?portfolio
- Replay: https://aditya-gayal-portfolio.vercel.app/?replay=1&motion=full

The Vercel project is linked locally. Deploy the current working tree with `pnpm dlx vercel@latest deploy --prod`. Production uses the pinned pnpm version through Corepack. GitHub-triggered deployment is not connected yet; Vercel requires the owner's GitHub login connection to enable it. CLI deployment does not require a commit or push.

Release checks: `QA_URL=https://aditya-gayal-portfolio.vercel.app node scripts/release-qa.mjs`. Security boundaries, deployment details, and remaining limits are documented in [production release](docs/production-release.md). QA recordings, environment files, and source documentation are excluded from deployment upload.
