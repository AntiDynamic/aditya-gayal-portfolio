# Original identity-world geometry

`question-relay.glb` is generated locally by:

```sh
blender -b --factory-startup --python scripts/blender/build-question-relay.py
```

- Author: this portfolio project; no third-party model, texture or Lusion asset.
- Blender: 4.5.14 LTS.
- Purpose: a recognizable thick, twisted ribbon assembly carried through the scroll journey.
- Nodes: `QuestionShell`, `CounterQuestion`, `ConnectionRail`.
- Materials: warm enamel, vermilion enamel, satin aluminum.
- Geometry: three open, gently twisted bands with bevels, weighted normals and ribbon UVs, 10,452 triangles total. 191,444 bytes; 154,702 bytes under gzip level 9.
- Export: GLB, no images/animations/cameras/lights/decoder. Intentional X-right/Y-up/Z-depth coordinates. No Draco/Meshopt dependency.
- Exact byte/gzip counts: generated `question-relay.json`.
- Runtime: one loader-cached asset; geometry/materials reused across four stations, not four model downloads. The small loader cache is retained during the page session; local procedural geometries, alternative material and generated environment are disposed on scene unmount.

Studio reflections use Three.js's `RoomEnvironment`, already part of the installed Three.js package (MIT). They are generated once per mounted scene; no HDRI download.

Two runtime-generated print textures are original project assets: a 2048×128 ribbon atlas (`WHAT IF?`, `LOOK AGAIN.`, `TRY IT.`, `WHY?`) and a 2048×768 three-row spatial-type atlas (`WHY?`, `WHAT CHANGED?`, `TRY AGAIN.`). They are decorative equivalents of the DOM story, downloaded nowhere, and disposed with the scene. World lettering is depth-tested against the physical objects. No essential copy exists only in these textures.
