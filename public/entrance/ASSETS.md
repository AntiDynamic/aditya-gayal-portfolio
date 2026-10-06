# Entrance assets — Stage C

Only assets with a current purpose are stored here. No full libraries, reference
videos, 4K textures, placeholder models, or environment maps are shipped.

## Downloaded audio: Kenney Impact Sounds 1.0

- Author: Kenney.
- Source: https://kenney.nl/assets/impact-sounds
- Archive: https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip
- License: CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/
- Original license retained at `audio/LICENSE-Kenney.txt`.
- Processing: FFmpeg; trim leading/trailing silence at -45 dB, retain short natural
  tails, convert to mono 22,050 Hz Ogg Vorbis quality 3, limit peaks to -6 dBFS
  without automatic makeup gain. No layering, pitch effects, or cinematic processing.
- Purpose: a compact tactile palette for a later explicitly enabled sound system.
  **None is imported, fetched, decoded, or played by Stage C.** These are material
  Foley source selections, not evidence that sound is already implemented.

| Original archive filename | Final file | Bytes | Intended use |
| --- | --- | ---: | --- |
| `Audio/impactPlate_light_000.ogg` | `audio/enamel-tick.ogg` | 4,756 | Small rigid plate contact |
| `Audio/impactPlate_heavy_001.ogg` | `audio/enamel-release.ogg` | 5,240 | Plate/structural release body |
| `Audio/impactMetal_light_002.ogg` | `audio/metal-tap.ogg` | 3,955 | Restrained bracket contact |
| `Audio/impactSoft_medium_000.ogg` | `audio/rubber-thud.ogg` | 3,906 | Muted resilient joint contact |
| `Audio/impactGlass_light_001.ogg` | `audio/acrylic-tick.ogg` | 3,900 | Future sparse brittle insert contact |
| `Audio/impactWood_heavy_001.ogg` | `audio/structural-snap.ogg` | 4,118 | Dry structural accent |

Total encoded audio: **25,875 bytes**. Plate recordings are not represented as
dedicated ceramic fracture recordings. Their exact mix and material attribution
must be auditioned in the future sound phase. Paper tear/flutter and ceramic chip
recordings remain unselected; do not substitute unrelated sounds just to fill slots.

## Generated runtime graphics

Original procedural work in this repository; no downloaded texture license needed.
No raster texture files or GLB files were added.

| Runtime texture / geometry | Source | Dimensions / method | Use |
| --- | --- | --- | --- |
| `entrance-paper-normal` | `src/components/entrance/entrance-materials.ts` | Deterministic 128×128 RGBA fiber normal field | Restrained paper surface response |
| `entrance-metal-normal` | Same | Deterministic 128×128 RGBA directional normal field | Brushed bracket response |
| `entrance-enamel-crown` | Same | 128×128 RGBA shallow continuous normal field | Smooth enamel light response |
| Font-ready print atlas | `src/components/entrance/entrance-scene.tsx` | Generated canvas, width ≤2048px | Registered headline on every physical face, including detached fragment |
| Enamel complementary cut | `src/components/entrance/entrance-break.ts` | Two authored polygon boundaries with matching cut edges | One actual thick removable corner |
| Four fracture branches | Same + scene `Stroke` | Four authored line paths with geometry, no crack decals | Hit-region-dependent persistent fracture |
| Cobalt interior | Scene + shared manifest | Three nested extruded depth planes with two apertures | Actual recessed view beneath the fragment |
| Ceramic chips | Scene | Four reused tetrahedra, two visible on mobile | Brief supporting debris, never an idle effect |

## Deliberately omitted

- HDRI: retain the approved broad key/fill lighting and contact shadows. An
  environment download has no demonstrated benefit for this matte assembly.
- GLB: the complementary polygon cut already supplies thickness, pivots, print
  registration, bevels, and sidewalls. No imported geometry or decoder is needed.
- External texture packs: current micro-detail is generated and shared. Downloaded
  images would add transfer cost without improving the signature break.
- Reference videos: local research only, never copied into public assets.

Future `textures/`, `models/`, or `generated/` folders should be created only when
an actual asset is used and documented here.
