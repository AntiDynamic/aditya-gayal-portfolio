# Work room assets

Final prologue polish adds no downloaded assets. Three original 256px runtime grayscale maps control paint, paper and casing roughness; paper/casing reuse those maps for tiny bump response. Desk and floor wear are world-space roughness adjustments, not replacement source textures. The exterior ledge/drip lip use original runtime geometry. Existing CC0 source assets and the Blender shell are retained unchanged; screwdriver orientation is corrected at placement time.

All third-party room geometry and surface materials below come from Poly Haven, whose [asset license is CC0](https://polyhaven.com/license). No game assets or sample renders from the reference games are used. The website loads only self-hosted, optimized files, never the live asset API.

The command-line sourcing helper identifies itself as `AdityaPortfolioAssetPipeline/1.0` and displays a Poly Haven credit. The [API terms](https://github.com/Poly-Haven/Public-API/blob/master/ToS.md) are distinct from the CC0 asset license.

## Models

| Identifier / source | Creator | Original bytes | Optimized bytes | Original triangles | Optimized triangles |
|---|---|---:|---:|---:|---:|
| [metal_office_desk](https://polyhaven.com/a/metal_office_desk) | Ulan Cabanilla | 1,606,530 | 346,364 | 6,898 | 4,594 |
| [painted_wooden_chair_02](https://polyhaven.com/a/painted_wooden_chair_02) | Kirill Sannikov | 2,396,396 | 156,084 | 1,246 | 1,246 |
| [desk_lamp_arm_01](https://polyhaven.com/a/desk_lamp_arm_01) | Kuutti Siitonen: modeling/texturing; Yann Kervran: rigging | 2,875,984 | 566,560 | 24,102 | 10,845 |
| [binder_notebook](https://polyhaven.com/a/binder_notebook) | DaDrood | 1,889,775 | 290,196 | 18,077 | 5,421 |
| [wooden_bookshelf_worn](https://polyhaven.com/a/wooden_bookshelf_worn) | Ulan Cabanilla | 2,777,194 | 419,688 | 10,106 | 4,547 |
| [book_encyclopedia_set_01](https://polyhaven.com/a/book_encyclopedia_set_01) | John Malcolm | 3,261,046 | 390,956 | 67,306 | 4,022 |
| [flathead_screwdriver](https://polyhaven.com/a/flathead_screwdriver) | Dylan Detwiller | 1,882,828 | 166,792 | 2,300 | 2,300 |

Each source uses the 1K glTF delivery variant. Blender resizes images to 512px, or 768px for the inspected desk and shelf, exports JPEG where appropriate, removes non-mesh source hierarchy, places the origin on the floor, decimates dense geometry, and joins static geometry into shared-material primitives. Desk primitives drop from nine to one; encyclopedia primitives drop from forty to two. Chairs and the uneven book groups reuse geometry/maps, not another download. Runtime desk/shelf material clones tune roughness and normal strength; source maps use 4× anisotropy.

Full identifiers, licenses, URLs, measured dimensions, original/optimized sizes, primitive counts, and changes are in `public/room/asset-manifest.json`. Raw glTF, buffers and images are cached in `/tmp/portfolio-room-source`, outside the web root. Do not deploy this cache.

## Surface textures

Both materials are by **Rob Tuytel**, CC0:

- [white_plaster_02](https://polyhaven.com/a/white_plaster_02): diffuse and OpenGL normal maps. Diffuse is repainted 84% neutral/off-white to remove blanket dirt; normal strength is restrained.
- [linoleum_brown](https://polyhaven.com/a/linoleum_brown): diffuse and OpenGL normal maps. Diffuse is muted 42% toward a neutral linoleum tone.

Source 1K JPEG maps total **2,419,527 bytes**. The shipped 512px WebP maps total **41,380 bytes**. Per-map source URLs, authors, bytes and changes are in `public/room/texture-manifest.json`.

WebP reduces download size, not GPU texture storage. These are not KTX2/Basis-compressed GPU textures.

## Window background

- **Abandoned Slipway**, Philip Modin, Poly Haven; [source](https://polyhaven.com/a/abandoned_slipway), [CC0 license](https://polyhaven.com/license).
- Tonemapped JPG source: **5,160,993 bytes**; checksum-verified, mildly desaturated/cooled, resized as a complete 360-degree 2048 × 1024 panorama and compressed to **102,980 bytes WebP**. The earlier 1024px crop on a finite box was replaced because visitors could see its bounds.
- Shipped as `public/room/textures/window-exterior.webp`, with complete metadata in `public/room/exterior-manifest.json`. Rebuild: `node scripts/assets/room-exterior.mjs`.
- Only a visual background: no HDRI decoder, runtime HDR map or environment-lighting pass is added. The sparse dried-rain/edge-deposit glazing map is original Canvas work.

## Handwriting

- **Caveat 500**, The Caveat Project Authors.
- [Source](https://fonts.google.com/specimen/Caveat), [license](https://github.com/google/fonts/blob/main/ofl/caveat/OFL.txt).
- SIL Open Font License 1.1. The complete required notice/license is distributed at `public/room/fonts/OFL.txt`.
- Unmodified, locally hosted Google Fonts TTF: **251,752 bytes**. Used to rasterize original notebook and drawing copy; it is not a scan of Aditya's actual handwriting.
- Download URL and size are recorded in `public/room/optimization-report.json`.

## Original work

`scripts/blender/build-room.py` creates the room shell, window/door trim, ceiling fixture housing/diffuser/clips, moving-drawer cabinet shell, cream city model/dock and timeline mechanism. The polish pass adds a thick diffuser, city streets/courtyard gaps and physical spacers beneath timeline plates, and replaces opaque browser planes with inexpensive runtime acrylic geometry. The subsequent visual refinement adds two-tone lower-wall paint, a small service hatch/vent and a restrained electrical conduit. Geometry is beveled and grouped by material. The room shell is **594,512 bytes**.

Original runtime geometry provides the customized terminal/storage electronics, merged keyboard, inspection pages with slight curvature, pen, mug/residue/drink ring, extension cable, cable bundles and small fan. The notebook, corrected diagram, sparse labels, frame strip and keyboard atlas are authored Canvas textures. These are original project work, not downloaded game props. The notebook/map remain physically in the scene during inspection.

No suitable cup or keyboard was found in the queried Poly Haven model catalog; their small procedural meshes are intentionally inexpensive. The cabinet/terminal are custom for the interaction system rather than generic decorative assets.

Room sound is original synthesized Web Audio: electrical hum, filtered ventilation/weather beds, a fan tone, paper handling, relay/drive clicks and restrained footsteps. No third-party room audio is downloaded. It defaults on after browser-permitted activation with no sound-enable UI; media autoplay restrictions still apply. Existing licensed music pauses during the room; no room score is added. The causal-wear/contact atlas, diffuser rib/edge map and board scraps are original Canvas art, not new downloaded textures or generated images.

## Rebuild

Requires Node, Blender 4.5+, ImageMagick and network access for initial sourcing:

```sh
node scripts/assets/room-assets.mjs --search chair
node scripts/assets/room-assets.mjs
blender -b -t 4 --python scripts/blender/prepare-room-assets.py
node scripts/assets/room-textures.mjs
node scripts/assets/room-exterior.mjs
blender -b -t 4 --python scripts/blender/build-room.py
node scripts/assets/room-report.mjs
```

Set `ROOM_RAW` to use a persistent source cache instead of `/tmp`. Downloads verify provider MD5 checksums and reject paths escaping the asset cache. Optimized model exports use atomic replacement.

## Budget

- Downloaded source models: **16,689,753 bytes → 2,336,640 bytes** (86.0% smaller).
- Source geometry: **130,035 → 32,975 triangles** (74.6% fewer), before room placement/instances.
- All shipped scene models, four material maps, window background and handwriting font: **3,327,264 bytes**, excluding small provenance JSON/license files and shared application JavaScript. The first playable was 2,908,116 bytes; subsequent polish/fixes add 419,148 bytes (14.4%), mainly sharper hero maps, grouped architectural details and the optimized complete window panorama. Generated Canvas maps consume GPU memory but add no asset downloads; they are not included in these network-byte totals.
- No 4K textures, raw source bundles, decoder dependency, physics engine, runtime HDRI lighting, realtime GI or postprocessing chain is added.

The source assets were inspected in the running room, including close notebook, shelf and desk views. Remaining limitations: shelf texture density is soft at close range; the custom terminal/cabinet/project artifacts are simpler than the sourced furniture. Higher-density hero maps and baked indirect lighting are sensible next improvements, not claims about the current result.
