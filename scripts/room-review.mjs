import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { execFileSync } from "node:child_process";

const directory = resolve("visual-qa/room/final");
const report = JSON.parse(await readFile(resolve(directory, "qa-report.json"), "utf8"));
if (report.failure) throw new Error("QA failed; do not publish a successful review gallery");
const review = resolve(directory, "review"); await mkdir(review, { recursive: true });
for (const recording of report.recordings) {
  const identifier = recording.width === 390 ? "mobile" : "desktop";
  const original = resolve(directory, "recordings", `prologue-${identifier}.webm`);
  const converted = resolve(directory, "recordings", `prologue-${identifier}.mp4`);
  await copyFile(recording.path, original);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", original, "-c:v", "libx264", "-preset", "fast", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", converted]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", converted, "-vf", "fps=1,scale=360:-1,tile=5x5", resolve(review, `${identifier}-%03d.png`)]);
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "quiet", "-show_format", "-show_streams", "-of", "json", converted], { encoding: "utf8" }));
  recording.reviewPath = converted; recording.durationSeconds = Number(probe.format.duration); recording.captureFrameRate = probe.streams[0].avg_frame_rate;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(Math.max(0, recording.durationSeconds - 10)), "-i", converted, "-t", "7", "-vf", "fps=5,scale=360:-1,tile=5x5", resolve(review, `${identifier}-handoff-%03d.png`)]);
}
for (const name of ["narrow-walking", "hybrid-walking", "reduced-walking", "window-exterior"]) {
  const destination = resolve(directory, `mode-${name}.png`); await copyFile(resolve("visual-qa/room/modes", `${name}.png`), destination);
  if (!report.screenshots.includes(destination)) report.screenshots.push(destination);
}
await writeFile(resolve(directory, "qa-report.json"), JSON.stringify(report, null, 2));
await copyFile(resolve("visual-qa/room/audio/room-tone-0.webm"), resolve(directory, "recordings/room-tone.webm"));
const escaped = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const images = report.screenshots.map(path => `<figure><a href="${escaped(basename(path))}"><img loading="lazy" src="${escaped(basename(path))}" alt="${escaped(basename(path, ".png"))}"></a><figcaption>${escaped(basename(path, ".png"))}</figcaption></figure>`).join("");
const videos = report.recordings.map(recording => `<section><h2>${recording.width === 390 ? "Mobile" : "Desktop"}</h2><video controls preload="metadata" src="recordings/${basename(recording.reviewPath)}"></video></section>`).join("");
await writeFile(resolve(directory, "index.html"), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Work room — QA</title><style>body{margin:40px;background:#eeeadd;color:#252c25;font:14px system-ui}h1{font-size:26px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}figure{margin:0}img{width:100%;max-height:500px;object-fit:contain;background:#1b241d}video{width:min(100%,1100px);max-height:85vh;background:#1b241d}figcaption{padding:8px 0;font-size:12px}a{color:inherit}</style><h1>Work room — production QA</h1><p>${report.checks.length} main checks. Recordings are silent browser captures; capture frame rate is not renderer FPS.</p>${videos}<h2>Actual room audio</h2><p>Separate browser-output capture of entry, movement, notebook, lamp and recovery. Not synchronized to the videos.</p><audio controls preload="metadata" src="recordings/room-tone.webm"></audio><h2>Frames</h2><main>${images}</main></html>`);
console.log(directory, report.recordings);
