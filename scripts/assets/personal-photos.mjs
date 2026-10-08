import { mkdir, stat, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const source = "/home/anti/Downloads/WhatsApp Unknown 2026-10-08 at 17.22.08";
const output = "public/media/personal";
await mkdir(output, { recursive: true });
const photos = [
  { id: "aditya-standing", filename: "WhatsApp Image 2026-10-08 at 17.20.29.jpeg", approval: "Third photo: striped pink/red shirt, standing against sky and city" },
  { id: "aditya-open", filename: "WhatsApp Image 2026-10-08 at 17.20.30.jpeg", approval: "Fourth photo: same shirt with jacket, arms open against city" },
];
const manifest = [];
for (const photo of photos) {
  const input = join(source, photo.filename);
  const originalBytes = (await stat(input)).size;
  for (const width of [450, 900]) {
    const file = `${output}/${photo.id}-${width}.webp`;
    execFileSync("magick", [input, "-auto-orient", "-resize", `${width}x>`, "-strip", "-quality", "84", file]);
    manifest.push({ file, originalFilename: photo.filename, approval: photo.approval, source: "User-provided photograph", rights: "Used with the user's express approval; no third-party license asserted", originalBytes, optimizedBytes: (await stat(file)).size, modifications: "Orientation respected; downsampled without upscaling; WebP quality 84; metadata removed. No retouching or invented background." });
  }
}
await writeFile(`${output}/sources.json`, JSON.stringify(manifest, null, 2));
console.log(manifest);
