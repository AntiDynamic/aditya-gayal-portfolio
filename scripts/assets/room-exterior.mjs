import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const identifier = "abandoned_slipway";
const files = await fetch(`https://api.polyhaven.com/files/${identifier}`).then(response => { if (!response.ok) throw new Error("Exterior source unavailable"); return response.json(); });
const source = files.tonemapped;
const raw = process.env.ROOM_EXTERIOR_RAW || "/tmp/room-slipway.jpg";
let data = await readFile(raw).catch(() => null);
if (!data || createHash("md5").update(data).digest("hex") !== source.md5) {
  const response = await fetch(source.url); if (!response.ok) throw new Error("Exterior download failed");
  data = Buffer.from(await response.arrayBuffer());
  if (createHash("md5").update(data).digest("hex") !== source.md5) throw new Error("Exterior checksum mismatch");
  await writeFile(raw, data);
}
const destination = resolve(root, "public/room/textures/window-exterior.webp"); await mkdir(resolve(root, "public/room/textures"), { recursive: true });
execFileSync("magick", [raw, "-resize", "2048x1024!", "-modulate", "108,65,100", "-fill", "#b8c9ce", "-colorize", "12%", "-blur", "0x0.45", "-quality", "82", destination]);
const provenance = { identifier, creator: "Philip Modin", sourceUrl: `https://polyhaven.com/a/${identifier}`, downloadUrl: source.url, license: "CC0-1.0", licenseUrl: "https://polyhaven.com/license", originalBytes: data.length, optimizedBytes: (await stat(destination)).size, md5: source.md5, modifications: "Complete seamless 360-degree panorama; 2048x1024 WebP; restrained cool haze/desaturation; infinite scene background, not a cropped box or HDR lighting" };
await writeFile(resolve(root, "public/room/exterior-manifest.json"), JSON.stringify(provenance, null, 2)); console.log(provenance);
