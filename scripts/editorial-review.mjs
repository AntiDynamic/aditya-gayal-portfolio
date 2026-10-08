import { readdir, mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const directory = process.env.QA_OUTPUT || "visual-qa/editorial";
const report = JSON.parse(await readFile(`${directory}/report.json`, "utf8"));
if (report.failure) throw new Error(report.failure);
await mkdir(`${directory}/review`, { recursive: true });
for (const name of ["desktop", "laptop", "mobile", "reduced"]) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `${directory}/recordings/${name}.webm`, "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${directory}/recordings/${name}.mp4`]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `${directory}/recordings/${name}.mp4`, "-vf", "fps=1,scale=288:-1,tile=5x5", `${directory}/review/${name}-%02d.png`]);
}
for (const name of await readdir(`${directory}/recordings`)) if (name.startsWith("page@")) await unlink(`${directory}/recordings/${name}`);
const images = (await readdir(directory)).filter(name => name.endsWith(".png")).map(name => `<figure><a href="${name}"><img loading="lazy" src="${name}" alt="${name}"></a><figcaption>${name}</figcaption></figure>`).join("");
await writeFile(`${directory}/index.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Editorial portfolio review</title><style>body{margin:35px;background:#f2ede3;color:#292824;font:14px system-ui}video{width:100%;max-height:80vh}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}figure{margin:0}img{width:100%;max-height:500px;object-fit:contain}a{color:inherit}figcaption{padding:10px 0}</style><h1>Editorial portfolio — production review</h1><p>Browser captures; video capture rate is not renderer FPS. These recordings omit audio; use the live Music control to audition the original soundtrack.</p>${["desktop","laptop","mobile","reduced"].map(name=>`<h2>${name}</h2><video controls preload="metadata" src="recordings/${name}.mp4"></video>`).join("")}<p><a href="report.json">Measurements and checks</a></p><main>${images}</main></html>`);
