import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const directory = process.env.QA_OUTPUT || "visual-qa/audio";
const report = JSON.parse(await readFile(`${directory}/report.json`, "utf8"));
if (report.failure) throw new Error(report.failure);
await mkdir(`${directory}/review`, { recursive: true });
for (const recording of report.recordings) {
  const captured = recording.audio[0];
  if (!captured) throw new Error(`Missing audio: ${recording.test}`);
  const destination = `${directory}/recordings/${recording.test}-with-audio.mp4`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", recording.video, "-itsoffset", String(captured.offset), "-i", captured.path, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-threads", "2", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", destination]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", destination, "-vf", "fps=1,scale=320:-1,tile=5x5", `${directory}/review/${recording.test}-%03d.png`]);
  const result = spawnSync("ffmpeg", ["-hide_banner", "-i", captured.path, "-af", "astats=metadata=1:reset=0", "-f", "null", "-"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  const statistic = name => Number([...result.stderr.matchAll(new RegExp(`${name}: ([^\\n]+)`, "g"))].at(-1)?.[1]);
  recording.signal = { peakDbFS: statistic("Peak level dB"), rmsDbFS: statistic("RMS level dB"), nanCount: statistic("Number of NaNs"), infinityCount: statistic("Number of Infs") };
  assert.ok(Number.isFinite(recording.signal.peakDbFS) && recording.signal.peakDbFS < 0);
  assert.ok(Number.isFinite(recording.signal.rmsDbFS) && recording.signal.rmsDbFS > -65);
  assert.equal(recording.signal.nanCount, 0); assert.equal(recording.signal.infinityCount, 0);
  recording.review = destination;
}
await writeFile(`${directory}/report.json`, JSON.stringify(report, null, 2));
const frames = (await readdir(directory)).filter(name => name.endsWith(".png"));
await writeFile(`${directory}/index.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sound design review</title><style>body{background:#ebe8df;color:#252a27;font:15px system-ui;margin:32px}video{width:min(100%,1100px);max-height:80vh}img{width:min(100%,600px)}section{margin:40px 0}a{color:inherit}</style><h1>Sound design review</h1><p>Actual post-compressor browser audio; timestamp-aligned capture, not sample-accurate sync. Default-on after a natural interaction. Headphones recommended.</p><p><a href="report.json">Audio checks</a> · <a href="walk/index.html">Walking, mobile and handoff regression gallery</a></p>${report.recordings.map(recording => `<section><h2>${recording.test}</h2><video controls preload="metadata" src="recordings/${recording.test}-with-audio.mp4"></video></section>`).join("")}<h2>Frames</h2>${frames.map(name => `<figure><img loading="lazy" src="${name}" alt="${name}"><figcaption>${name}</figcaption></figure>`).join("")}</html>`);
try { await readFile(`${directory}/walk/report.json`, "utf8"); }
catch {
  const galleryPath = `${directory}/index.html`;
  const gallery = await readFile(galleryPath, "utf8");
  await writeFile(galleryPath, gallery.replace('href="walk/index.html"', 'href="../index.html"'));
}
console.log(directory);
