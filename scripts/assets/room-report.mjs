import { readFile, writeFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "../..");
const models = JSON.parse(await readFile(resolve(root, "public/room/asset-manifest.json"), "utf8"));
const textures = JSON.parse(await readFile(resolve(root, "public/room/texture-manifest.json"), "utf8"));
const shell = (await stat(resolve(root, "public/room/models/room-shell.glb"))).size;
const font = (await stat(resolve(root, "public/room/fonts/caveat.ttf"))).size;
const exterior = JSON.parse(await readFile(resolve(root, "public/room/exterior-manifest.json"), "utf8"));
const report = {
  sourceModelBytes: models.reduce((sum, asset) => sum + asset.originalBytes, 0),
  optimizedModelBytes: models.reduce((sum, asset) => sum + asset.optimizedBytes, 0),
  sourceTriangles: models.reduce((sum, asset) => sum + asset.originalTriangles, 0),
  optimizedTriangles: models.reduce((sum, asset) => sum + asset.triangles, 0),
  sourceMaterialBytes: textures.reduce((sum, asset) => sum + asset.originalBytes, 0),
  optimizedMaterialBytes: textures.reduce((sum, asset) => sum + asset.optimizedBytes, 0),
  customShellBytes: shell,
  fontBytes: font,
  totalSceneAssetBytes: models.reduce((sum, asset) => sum + asset.optimizedBytes, shell + font + exterior.optimizedBytes) + textures.reduce((sum, asset) => sum + asset.optimizedBytes, 0),
  exterior,
  fontSource: { identifier: "Caveat 500", creator: "The Caveat Project Authors", sourceUrl: "https://fonts.google.com/specimen/Caveat", downloadUrl: "https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjcB9SII.ttf", license: "SIL-OFL-1.1", licenseFile: "/room/fonts/OFL.txt", originalBytes: font, optimizedBytes: font, modifications: "Unmodified font, registered locally for Canvas handwriting" },
  models: models.map(({ identifier, originalBytes, optimizedBytes, originalTriangles, triangles, originalPrimitiveCount, optimizedPrimitiveCount }) => ({ identifier, originalBytes, optimizedBytes, originalTriangles, optimizedTriangles: triangles, originalPrimitiveCount, optimizedPrimitiveCount })),
};
await writeFile(resolve(root, "public/room/optimization-report.json"), JSON.stringify(report, null, 2));
console.log(report);
