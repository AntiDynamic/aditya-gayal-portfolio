import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const output = process.env.QA_OUTPUT || "visual-qa/fluidity/main";
const base = process.env.QA_URL || "http://localhost:3000";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const report = { checks: [], errors: [] };
try {
  for (const mode of ["direct", "session", "skip", "reduced", "explicit-full"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: mode === "reduced" || mode === "explicit-full" ? "reduce" : "no-preference" });
    const page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    await page.goto(`${base}/${mode === "skip" ? "?room=1" : mode === "explicit-full" ? "?portfolio&motion=full" : "?portfolio"}`);
    if (mode === "skip") await page.getByRole("button", { name: "Skip prologue" }).click();
    await page.waitForSelector('[data-editorial][data-motion="true"][data-webgl="ready"]');
    await page.waitForSelector('[data-editorial-canvas][data-idle="true"]');
    assert.equal(await page.locator("[data-editorial]").getAttribute("data-reduced"), String(mode === "reduced"));
    await page.evaluate(() => {
      window.qaWheelPositions = [];
      const sample = () => {
        window.qaWheelPositions.push(scrollY);
        if (window.qaWheelPositions.length < 24) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.mouse.wheel(0, 320);
    await page.waitForTimeout(1200);
    assert.ok(await page.evaluate(() => scrollY > 100));
    if (mode !== "reduced") assert.ok(await page.evaluate(() => window.qaWheelPositions.some(value => value > 1 && value < 200)));
    const depth = Number(await page.locator("[data-editorial]").getAttribute("data-hero-depth"));
    assert.ok(mode === "reduced" ? depth === 0 : depth > 1);
    const transform = await page.locator("[data-letter]").first().evaluate(element => getComputedStyle(element).transform);
    if (mode === "explicit-full") assert.notEqual(transform, "none");
    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const lines = await page.locator("#about [data-line-content]").evaluateAll(elements => elements.map(element => Number.parseFloat(element.style.getPropertyValue("--line-y"))));
    assert.ok(lines.length === 3 && lines.every(value => value < 1));
    await page.screenshot({ path: `${output}/${mode}-about.png` });
    report.checks.push(`${mode}: idle renderer resumes from wheel alone, resolved motion preference, visible heading lines`);
    await context.close();
  }
  assert.deepEqual(report.errors, []);
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(report); }
