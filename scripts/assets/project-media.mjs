import { chromium } from "playwright";
import { mkdir, writeFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const output = "public/media/work";
await mkdir(output, { recursive: true });
await mkdir("/tmp/portfolio-project-captures", { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.setContent(`<html><style>body{margin:0;background:#202521;color:#dce0ce;font-family:monospace;padding:90px;box-sizing:border-box}small{font-size:15px;color:#999e8f}h1{font:400 86px Arial;letter-spacing:-5px;margin:55px 0 18px}p{font:22px Arial;color:#9da28f;margin:0 0 65px}pre{font:21px/2 monospace;color:#d6ddc9;border-top:1px solid #525a4a;padding-top:35px}footer{position:absolute;bottom:70px;font-size:13px;color:#858e7c}b{color:#acbe84;font-weight:400}</style><body><small>CONTINUUM / DOCUMENTED CLI</small><h1>Observe the work.</h1><p>Coding-agent evidence and repository context.</p><pre><b>$</b> continuum index .
<b>$</b> continuum context search "ranking algorithm"
<b>$</b> continuum report latest
<b>$</b> continuum outcome latest</pre><footer>Documentation excerpt · no simulated run results</footer></body></html>`);
await page.screenshot({ path: "/tmp/portfolio-project-captures/continuum.png" });
for (const [name, url] of [["tracepilot", process.env.TRACEPILOT_URL || "http://localhost:3012"], ["netranagar", process.env.NETRANAGAR_URL || "http://localhost:3011"]]) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `/tmp/portfolio-project-captures/${name}.png` });
}
await browser.close();
const sources = [
  { id: "continuum", source: "https://github.com/AntiDynamic/Continuum", license: "MIT", capture: "Original editorial rendering of documented CLI commands. Not an application screenshot or a claimed run result." },
  { id: "tracepilot", source: "https://github.com/priyanshuchawda/tracepilot-gemini-cli", license: "Apache-2.0", capture: "Actual repository workbench UI served locally without backend services; offline/idle state retained. No generated proof or fabricated run data." },
  { id: "netranagar", source: "https://github.com/AntiDynamic/NetraNagar-public", license: "User-provided project representation; no third-party application-code license asserted", capture: "Actual published application build served locally. Unavailable monitoring data retained. Map attribution: © OpenStreetMap contributors, https://www.openstreetmap.org/copyright." },
];
for (const source of sources) {
  const file = `${output}/${source.id}.webp`;
  const input = `/tmp/portfolio-project-captures/${source.id}.png`;
  execFileSync("magick", [input, "-strip", "-quality", "85", file]);
  Object.assign(source, { file, width: 1440, height: 1000, originalBytes: (await stat(input)).size, optimizedBytes: (await stat(file)).size });
}
await writeFile(`${output}/sources.json`, JSON.stringify(sources, null, 2));
console.log(sources);
