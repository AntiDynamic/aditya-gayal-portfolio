import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.QA_URL || "http://localhost:3000";
const output = process.env.QA_OUTPUT || "visual-qa/release/music-recovery";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const page = await browser.newPage();
const report = { checks: [], errors: [] };
let attempts = 0;
page.on("pageerror", error => report.errors.push(error.message));
try {
  await page.route("**/audio/work-in-progress.mp3", async route => {
    attempts++;
    if (attempts === 1) await route.abort("failed");
    else await route.continue();
  });
  await page.goto(`${base}/?portfolio`);
  await page.waitForSelector('[data-editorial][data-ready="true"]');
  await page.getByRole("button", { name: "Play portfolio music" }).click();
  await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent.includes("Music could not load"));
  assert.equal(await page.getByRole("button", { name: "Play portfolio music" }).getAttribute("aria-pressed"), "false");
  report.checks.push("Failed download announces status and resets the music control");
  await page.getByRole("button", { name: "Play portfolio music" }).click();
  await page.waitForFunction(() => { const audio = document.querySelector("[data-portfolio-music]"); return !audio.paused && audio.currentTime > .2 && audio.volume > .05; });
  assert.ok(attempts >= 2);
  report.checks.push("A new play gesture retries the failed media and starts playback");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.waitForFunction(() => document.querySelector("[data-portfolio-music]").paused);
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
  await page.waitForFunction(() => { const audio = document.querySelector("[data-portfolio-music]"); return !audio.paused && audio.volume > .05; });
  report.checks.push("Hidden-document state pauses music; visible state resumes the explicit selection");
  await page.getByRole("button", { name: "Mute portfolio music" }).click();
  await page.waitForFunction(() => document.querySelector("[data-portfolio-music]").paused);
  report.checks.push("Mute fades out and pauses after retry and visibility changes");
  assert.deepEqual(report.errors, []);
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(report); }
