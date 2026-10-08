import { readFile, writeFile, readdir, copyFile, mkdir, unlink } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve, basename } from "node:path";

const directory = resolve(process.env.QA_OUTPUT || "visual-qa/room/lock");
const report = JSON.parse(await readFile(resolve(directory, "report.json"), "utf8")); if (report.failure) throw new Error(report.failure);
await mkdir(resolve(directory, "review"), { recursive: true });
for (const recording of report.recordings) {
  for (const name of await readdir(resolve(directory, "review"))) if (name.startsWith(`${recording.test}-`) && name.endsWith('.png')) await unlink(resolve(directory, "review", name));
  const original = resolve(directory, "recordings", `${recording.test}.webm`); await copyFile(recording.path, original);
  const destination = resolve(directory, "recordings", `${recording.test}.mp4`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", original, "-c:v", "libx264", "-threads", "4", "-preset", "fast", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", destination]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", destination, "-vf", "fps=2,scale=320:-1,tile=5x5", resolve(directory, "review", `${recording.test}-%03d.png`)]);
  recording.reviewPath = destination;
  if (recording.audio?.length) {
    const captured = recording.audio[0]; const audible = resolve(directory, "recordings", `${recording.test}-with-room-audio.mp4`);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", destination, "-itsoffset", String(captured.offset), "-i", resolve(captured.path), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-movflags", "+faststart", audible]);
    recording.audiblePath = audible;
  }
}
await writeFile(resolve(directory, "report.json"), JSON.stringify(report, null, 2));
const pictures = (await readdir(directory)).filter(name => name.endsWith(".png")).sort();
const players = report.recordings.map(recording => `<section><h2>${recording.test}</h2><video controls preload="metadata" src="recordings/${basename(recording.audiblePath || recording.reviewPath)}"></video><p><a href="recordings/${basename(recording.reviewPath)}">Silent capture</a>${recording.audiblePath ? ` · <a href="recordings/${basename(recording.audiblePath)}">With captured room audio (approximate sync)</a>` : ""}</p></section>`).join("");
await writeFile(resolve(directory, "index.html"), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Final prologue polish QA</title><style>body{margin:32px;background:#eae9df;color:#27353b;font:14px system-ui}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}figure{margin:0}img{width:100%;max-height:65vh;object-fit:contain}video{width:min(100%,1100px);max-height:80vh}figcaption{padding:8px}</style><h1>Final prologue polish</h1><p>${report.checks.length} named regression checks. Desktop walking, mobile guided views, reduced motion and resize. Recordings are browser captures, not measured renderer FPS.</p><p><a href="audio/room-tone-0.webm">Actual room audio capture</a> · <a href="report.json">Measurements and checks</a></p>${players}<h2>Sequence and inspection frames</h2><main>${pictures.map(name => `<figure><a href="${name}"><img loading="lazy" src="${name}" alt="${name}"></a><figcaption>${name}</figcaption></figure>`).join("")}</main></html>`);
const firstAudio = report.recordings.find(recording => recording.audio?.length)?.audio[0];
if (firstAudio) {
  const galleryPath = resolve(directory, "index.html");
  const gallery = await readFile(galleryPath, "utf8");
  await writeFile(galleryPath, gallery.replace('href="audio/room-tone-0.webm"', `href="recordings/${basename(firstAudio.path)}"`));
}
console.log(directory, pictures.length, "screenshots", report.recordings.length, "recordings");
