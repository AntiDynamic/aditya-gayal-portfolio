import { mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const root = resolve(import.meta.dirname, "../..");
const destination = resolve(root, "public/room/textures");
const raw = resolve(process.env.ROOM_RAW || "/tmp/portfolio-room-source", "materials");
await mkdir(destination, { recursive: true }); await mkdir(raw, { recursive: true });
const catalog = await (await fetch("https://api.polyhaven.com/assets?t=textures", { headers: { "User-Agent": "AdityaPortfolioAssetPipeline/1.0" } })).json();
const manifest = [];
for (const identifier of ["white_plaster_02", "linoleum_brown"]) {
  const files = await (await fetch(`https://api.polyhaven.com/files/${identifier}`, { headers: { "User-Agent": "AdityaPortfolioAssetPipeline/1.0" } })).json();
  for (const [map, source] of [["color", "Diffuse"], ["normal", "nor_gl"]]) {
    const entry = files[source]["1k"].jpg;
    const input = resolve(raw, `${identifier}-${map}.jpg`); const output = resolve(destination, `${identifier}-${map}.webp`);
    let bytes;
    try { bytes = await readFile(input); } catch { const response = await fetch(entry.url); if (!response.ok) throw new Error(entry.url); bytes = Buffer.from(await response.arrayBuffer()); }
    if (createHash("md5").update(bytes).digest("hex") !== entry.md5) throw new Error("Checksum mismatch");
    await writeFile(input, bytes);
    const paint = map === "color" ? ["-fill", identifier === "white_plaster_02" ? "#d1d0c5" : "#9b9a87", "-colorize", identifier === "white_plaster_02" ? "84" : "42"] : [];
    execFileSync("magick", [input, "-resize", "512x512", ...paint, "-quality", "86", output]);
    manifest.push({ identifier, map, creator: catalog[identifier].authors, sourceUrl: `https://polyhaven.com/a/${identifier}`, downloadUrl: entry.url, license: "CC0-1.0", originalBytes: bytes.length, optimizedBytes: (await readFile(output)).length, modifications: "1024px JPEG to 512px WebP; wall diffuse repainted 84%, floor desaturated 42%; restrained normal strength" });
  }
}
await writeFile(resolve(root, "public/room/texture-manifest.json"), JSON.stringify(manifest, null, 2));
console.log(manifest);
const fonts = resolve(root, "public/room/fonts"); await mkdir(fonts, { recursive: true });
for (const [url, filename] of [["https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjcB9SII.ttf", "caveat.ttf"], ["https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/OFL.txt", "OFL.txt"]]) {
  const response = await fetch(url); if (!response.ok) throw new Error(url);
  await writeFile(resolve(fonts, filename), Buffer.from(await response.arrayBuffer()));
}
