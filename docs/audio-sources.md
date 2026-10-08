# Information Collapse — audio provenance

Verified source pages on 2026-10-07. Both shipped recordings are offered under **CC0 1.0 Universal**, a public-domain dedication. License: https://creativecommons.org/publicdomain/zero/1.0/

| Shipped file | Creator / source page | Original download | Bytes | Role |
| --- | --- | --- | ---: | --- |
| `public/audio/threshold-airy.mp3` | SRG774 — https://opengameart.org/content/dark-sci-fi-audio-pack | https://opengameart.org/sites/default/files/airy_0.mp3 | 768670 | Exterior approach |
| `public/audio/threshold-light.mp3` | Yoiyami — https://opengameart.org/content/first-light-particles-%E2%80%93-cc0-atmospheric-pianoambient-track | https://opengameart.org/sites/default/files/first_light_particles_1.mp3 | 1696248 | White surface / reformation |

Modifications: FFmpeg transcode to stereo MP3 at 96 kb/s; metadata removed; full recordings retained. No composition edits, pitch changes, or attribution claims. The approach mix fades before interior text. Interior and singularity remain silent. Light material returns only after that interval. Browser looping is not a custom seamless overlap loop; seam quality still needs listening review.

Audio is default-on through natural browser-permitted interaction, with no enable UI. Media elements have `preload="none"`; inactive tracks pause and shared Web Audio gains provide platform-independent volume control. Hidden documents pause playback. The unused trailer, interior recording, and portfolio ambience files have been removed. The mix retains original cosmic sonification and licensed Foley: see `docs/sound-design.md` for behavior and measurements.

## Audition status

The post-room site has a separate original composition, `public/audio/work-in-progress.mp3`: 96 BPM, 40 seconds, synthesized without third-party recordings or samples. Rebuild it with `node scripts/assets/compose-portfolio-music.mjs`. This is not a downloaded CC0 track and does not reuse the cosmic recordings. It has an explicit optional play/mute control, fades independently, and pauses during prologues and hidden-document states. Composition, implementation, and limitations are documented in `docs/portfolio-repair.md`.

Source/license verification and decoding completed. Subjective listening against the final motion was **not** verified by the agent. These are provisional musical choices, not a claim that filenames or metadata establish musical suitability. Review the full sequence muted first, then audition these layers with headphones. No autoplay, compression swell or soundtrack is required to understand the visuals.
