import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const output = "visual-qa/room/modes"; await mkdir(output, { recursive: true });
const report = { checks: [], errors: [] };
try {
  for (const mode of ["narrow", "hybrid", "reduced"]) {
    const context = await browser.newContext({ viewport: { width: mode === "narrow" ? 640 : 1440, height: 900 }, reducedMotion: mode === "reduced" ? "reduce" : "no-preference" });
    if (mode === "hybrid") await context.addInitScript(() => {
      const original = window.matchMedia.bind(window);
      window.matchMedia = query => {
        const result = original(query);
        if (query === "(pointer: coarse)" || query === "(any-pointer: fine)") Object.defineProperty(result, "matches", { value: true });
        return result;
      };
    });
    const page = await context.newPage(); page.on("pageerror", error => report.errors.push(error.message));
    await page.goto(`${process.env.QA_URL || "http://localhost:3000"}/?room=1`, { waitUntil: "networkidle" });
    await page.locator('[data-room][data-phase="ready"]').waitFor({ timeout: 60000 });
    assert.equal(await page.locator("[data-room]").getAttribute("data-guided"), mode === "reduced" ? "true" : "false");
    if (mode === "reduced") await page.getByRole("button", { name: "Walk freely with a keyboard" }).click();
    else await page.getByRole("button", { name: "Enter room", exact: true }).click();
    await page.waitForTimeout(350);
    const before = await page.locator("[data-room]").getAttribute("data-camera");
    await page.keyboard.down("w"); await page.waitForTimeout(650); await page.keyboard.up("w"); await page.waitForTimeout(300);
    assert.notEqual(await page.locator("[data-room]").getAttribute("data-camera"), before);
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Guided views", exact: true }).click(); await page.waitForTimeout(1400);
    assert.equal(await page.locator("[data-room]").getAttribute("data-guided"), "true");
    await page.getByRole("button", { name: "Walk freely", exact: true }).click(); await page.waitForTimeout(350);
    assert.equal(await page.locator("[data-room]").getAttribute("data-guided"), "false");
    await page.keyboard.press("Escape"); await page.waitForTimeout(200);
    await page.screenshot({ path: `${output}/${mode}-walking.png` });
    if (mode === "hybrid") {
      await page.mouse.move(1000, 450); await page.mouse.down(); await page.mouse.move(100, 450, { steps: 30 }); await page.mouse.up(); await page.waitForTimeout(300);
      await page.screenshot({ path: `${output}/window-exterior.png` });
    }
    report.checks.push(`${mode}: walking works and both modes remain selectable`); await context.close();
  }
  assert.deepEqual(report.errors, []);
} finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(report); }
