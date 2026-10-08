import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const raw = "/tmp/portfolio-audio";
const output = "public/audio/foley";
await mkdir(raw, { recursive: true }); await mkdir(output, { recursive: true });
const base = "https://opengameart.org/sites/default/files/";
const license = "https://creativecommons.org/publicdomain/zero/1.0/";
const sources = [
  { id: "keyboard", creator: "unicaegames", page: "https://opengameart.org/node/122745", download: "unicae_games_keyboard_soundpack_1_0.zip", entries: [1, 2, 3, 4].map(index => ({ input: `Single Keys/keypress-${String(index).padStart(3, "0")}.wav`, name: `key-${index}` })) },
  { id: "switches", creator: "StarNinjas", page: "https://opengameart.org/content/10-clicks-and-switches", download: "10_clicks_and_switches.zip", entries: [1, 2].map(index => ({ input: `10 Clicks and Switches/click.${index}.ogg`, name: `switch-${index}` })) },
  ...[1, 2, 3].map(index => ({ id: `paper-${index}`, creator: "Luckius", page: "https://opengameart.org/content/various-paper-sound-effects", download: `paper_sound_-_${index}.mp3`, entries: [{ name: `paper-${index}` }] })),
  { id: "steps", creator: "mikeask", page: "https://opengameart.org/content/steps-in-wood-floor", download: "steps%20in%20wood%20floor.wav", entries: [0.05, 0.55, 1.10, 2.15].map((start, index) => ({ name: `step-${index + 1}`, start })) },
];
const manifest = [];
for (const source of sources) {
  const response = await fetch(base + source.download); if (!response.ok) throw new Error(`Download failed: ${source.id}`);
  const original = Buffer.from(await response.arrayBuffer());
  const downloaded = `${raw}/${source.download}`; await writeFile(downloaded, original);
  const directory = `${raw}/${source.id}`;
  if (source.download.endsWith(".zip")) { await mkdir(directory, { recursive: true }); execFileSync("unzip", ["-o", "-q", downloaded, "-d", directory]); }
  for (const entry of source.entries) {
    const input = "input" in entry ? `${directory}/${entry.input}` : downloaded;
    const path = `${output}/${entry.name}.ogg`;
    const trim = "start" in entry ? ["-ss", String(entry.start), "-t", "0.36"] : [];
    const filters = "start" in entry ? "highpass=f=65,lowpass=f=2300,afade=t=in:d=0.003,afade=t=out:st=0.33:d=0.03" : "highpass=f=65,afade=t=in:d=0.003";
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", input, ...trim, "-ac", "1", "-ar", "32000", "-af", filters, "-c:a", "libvorbis", "-q:a", "4", "-map_metadata", "-1", path]);
    const data = await readFile(path);
    manifest.push({ file: path, creator: source.creator, source: source.page, download: base + source.download, license: "CC0-1.0", licenseUrl: license, archiveBytes: original.length, originalBytes: (await stat(input)).size, optimizedBytes: data.length, sha256: createHash("sha256").update(data).digest("hex"), modifications: `Mono 32 kHz Vorbis quality 4; ${filters}; metadata removed; no normalization.${"start" in entry ? ` Extracted ${entry.start}s + 0.36s.` : ""}` });
  }
}
await writeFile(`${output}/sources.json`, JSON.stringify(manifest, null, 2) + "\n");
console.log(`${manifest.length} licensed samples; ${manifest.reduce((total, entry) => total + entry.optimizedBytes, 0)} bytes`);
