import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { resolve, dirname, basename } from "node:path";
import { createHash } from "node:crypto";

const root = resolve(import.meta.dirname, "../..");
const raw = resolve(process.env.ROOM_RAW || "/tmp/portfolio-room-source");
const ids = ["metal_office_desk", "painted_wooden_chair_02", "desk_lamp_arm_01", "binder_notebook", "wooden_bookshelf_worn", "book_encyclopedia_set_01", "flathead_screwdriver"];
const api = "https://api.polyhaven.com";
console.log("Powered by Poly Haven — CC0 assets, self-hosted after optimization");
const request = async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000), headers: { "User-Agent": "AdityaPortfolioAssetPipeline/1.0" } });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
};
const catalog = await (await request(`${api}/assets?t=models`)).json();
if (process.argv.includes("--search")) {
  const term = process.argv.at(-1).toLowerCase();
  console.log(Object.entries(catalog).filter(([identifier, asset]) => `${identifier} ${asset.name}`.toLowerCase().includes(term)).map(([identifier, asset]) => ({ identifier, name: asset.name, creators: asset.authors })));
  process.exit(0);
}
const manifest = [];
let previous = [];
try { previous = JSON.parse(await readFile(resolve(root, "public/room/asset-manifest.json"), "utf8")); } catch {}
for (const identifier of ids) {
  const files = await (await request(`${api}/files/${identifier}`)).json();
  const entry = files.gltf["1k"].gltf;
  const downloads = [[basename(entry.url), entry], ...Object.entries(entry.include)];
  let originalBytes = 0;
  for (const [relative, file] of downloads) {
    const destination = resolve(raw, identifier, relative);
    if (!destination.startsWith(resolve(raw, identifier) + "/")) throw new Error(`Unsafe path: ${relative}`);
    await mkdir(dirname(destination), { recursive: true });
    let bytes;
    try { bytes = await readFile(destination); } catch { bytes = Buffer.from(await (await request(file.url)).arrayBuffer()); }
    if (createHash("md5").update(bytes).digest("hex") !== file.md5) throw new Error(`Checksum failed: ${relative}`);
    await writeFile(destination, bytes);
    originalBytes += bytes.length;
  }
  let optimizedBytes = null;
  try { optimizedBytes = (await stat(resolve(root, "public/room/models", `${identifier}.glb`))).size; } catch {}
  const document = JSON.parse(await readFile(resolve(raw, identifier, basename(entry.url)), "utf8"));
  const primitives = document.meshes.flatMap(mesh => mesh.primitives);
  const originalTriangles = primitives.reduce((sum, primitive) => sum + document.accessors[primitive.indices ?? primitive.attributes.POSITION].count / 3, 0);
  manifest.push({ ...previous.find(asset => asset.identifier === identifier), identifier, source: "Poly Haven", creator: catalog[identifier].authors, sourceUrl: `https://polyhaven.com/a/${identifier}`, license: "CC0-1.0", licenseUrl: "https://polyhaven.com/license", originalBytes, optimizedBytes, originalTriangles, originalPrimitiveCount: primitives.length, originalResolution: 1024, optimizedResolution: 512, modifications: "Blender: normalize origin to floor, remove cameras/lights, JPEG textures; dense geometry decimated; static meshes joined by material; placement adapted to room", rawPath: resolve(raw, identifier, basename(entry.url)) });
  console.log(identifier, originalBytes, optimizedBytes);
}
await mkdir(resolve(root, "public/room"), { recursive: true });
await writeFile(resolve(root, "public/room/asset-manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Sources cached outside the web root: ${raw}`);
