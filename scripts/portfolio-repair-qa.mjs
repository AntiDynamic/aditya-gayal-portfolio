import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const base = process.env.QA_URL || "http://localhost:3000";
const output = process.env.QA_OUTPUT || "visual-qa/repair/portfolio";
await mkdir(`${output}/recordings`, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: !process.env.QA_HEADED, args: ["--no-sandbox", ...(process.env.QA_HEADED ? ["--ozone-platform=wayland"] : [])] });
const report = { checks: [], errors: [] };
try {
  for (const [name, width, height] of [["desktop", 1366, 768], ["laptop", 1024, 800], ["mobile", 390, 844], ["reduced", 1440, 1000], ["fallback", 1366, 768]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: name === "mobile", isMobile: name === "mobile", reducedMotion: name === "reduced" ? "reduce" : "no-preference", recordVideo: { dir: `${output}/recordings`, size: { width, height } } });
    const page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    if (name === "fallback") await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.startsWith("webgl") ? null : original.call(this, type, ...args); }; });
    await page.goto(`${base}/?portfolio`);
    await page.waitForSelector('[data-editorial][data-ready="true"]');
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-media] img')).every(image => image.complete && image.naturalWidth > 0));
    await page.waitForTimeout(1200);
    for (const [index, media] of (await page.locator('[data-media]').all()).entries()) {
      await media.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      const transfer = await page.locator('[data-media][data-flow="true"] img').evaluateAll(images => images.map(image => ({ opacity: Number(getComputedStyle(image).opacity), rect: image.getBoundingClientRect().toJSON() })));
      if (transfer.length) {
        assert.equal(transfer.length, 2);
        assert.ok(Math.abs(transfer[0].opacity + transfer[1].opacity - 1) < .001);
        for (const axis of ["x", "y", "width", "height"]) assert.ok(Math.abs(transfer[0].rect[axis] - transfer[1].rect[axis]) < 1);
      } else assert.equal(await media.locator("img").evaluate(image => getComputedStyle(image).opacity), "1");
      await page.screenshot({ path: `${output}/${name}-${index}-media.png` });
    }
    assert.equal(await page.getByText("Outside", { exact: true }).count(), 0);
    const project = page.locator('[data-project="tracepilot"] a:has([data-media])');
    await project.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await project.hover();
    await page.waitForTimeout(700);
    if (!["mobile", "reduced", "fallback"].includes(name)) assert.equal(await page.locator('[data-editorial-cursor]').getAttribute('data-mode'), "view");
    await page.screenshot({ path: `${output}/${name}-project-hover.png` });
    await project.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await page.waitForTimeout(800);
    assert.equal(await dialog.locator("img").evaluate(image => image.complete && image.naturalWidth > 0), true);
    await page.screenshot({ path: `${output}/${name}-preview.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
    assert.equal(await dialog.isVisible(), false);
    assert.equal(await project.evaluate(element => document.activeElement === element), true);
    await page.getByRole("button", { name: "Play portfolio music" }).click();
    await page.waitForFunction(() => { const audio = document.querySelector('[data-portfolio-music]'); return !audio.paused && audio.currentTime > .1 && audio.volume > .05; });
    await page.getByRole("button", { name: "Mute portfolio music" }).click();
    await page.waitForFunction(() => document.querySelector('[data-portfolio-music]').paused);
    if (name === "desktop") {
      await page.locator('[data-editorial-canvas]').evaluate(element => element.style.display = "none");
      await page.screenshot({ path: `${output}/desktop-canvas-unavailable.png` });
      assert.equal(await project.locator("img").evaluate(image => getComputedStyle(image).opacity), "1");
    }
    report.checks.push(`${name}: all five pictures visible, project expansion and Escape/focus restoration, music play/mute`);
    const video = page.video(); await context.close(); await video.saveAs(`${output}/recordings/${name}.webm`);
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route("**/media/**", async route => { await new Promise(resolve => setTimeout(resolve, 1600)); await route.continue(); });
  await page.goto(`${base}/?portfolio`, { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator('[data-editorial]').getAttribute("data-ready"), "false");
  await page.waitForSelector('[data-editorial][data-ready="true"]');
  assert.equal(await page.locator('[data-media] img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
  report.checks.push("Slow image delivery: readiness waits for decoding rather than declaring success from SSR");
  await context.close(); assert.deepEqual(report.errors, []);
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(report); }
