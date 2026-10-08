import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const base = process.env.QA_URL || "http://localhost:3000";
const report = { checks: [], errors: [] };
try {
  for (const interruption of ["skip", "resize", "hash"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    await page.goto(`${base}/?room=1&motion=full`, { waitUntil: "networkidle" });
    await page.locator('[data-room][data-phase="ready"]').waitFor({ timeout: 60000 });
    await page.getByRole("button", { name: "Use guided exploration" }).click();
    await page.waitForFunction(() => document.querySelector("[data-room]")?.dataset.audio === "running");
    assert.equal(await page.getByRole("button", { name: /Sound on|Sound off|Enable animation|Pause animation/ }).count(), 0);
    await page.getByRole("navigation", { name: "Room viewpoints" }).getByRole("button", { name: "Computer", exact: true }).click();
    await page.waitForTimeout(1400);
    await page.getByRole("button", { name: "Look closer", exact: true }).click();
    await page.waitForTimeout(1100);
    await page.getByRole("button", { name: "Recover files" }).click();
    await page.getByRole("button", { name: "Open portfolio" }).click();
    await page.locator('[data-room][data-phase="handoff"]').waitFor();
    await page.waitForTimeout(700);
    if (interruption === "skip") await page.getByRole("button", { name: "Skip prologue" }).click();
    if (interruption === "resize") await page.setViewportSize({ width: 1024, height: 768 });
    if (interruption === "hash") await page.evaluate(() => { location.hash = "work"; });
    await page.locator("[data-room]").waitFor({ state: "detached" });
    await page.waitForTimeout(900);
    assert.equal(await page.locator("[inert]").count(), 0);
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    assert.equal(await page.locator("main.portfolio-shell").count(), 1);
    assert.equal(await page.evaluate(() => document.pointerLockElement !== null), false);
    report.checks.push({ name: `${interruption} during monitor approach`, passed: true });
    if (interruption === "skip") {
      await page.getByRole("button", { name: "Replay prologue" }).click();
      await page.locator("[data-event-horizon]").waitFor();
      assert.equal(await page.evaluate(() => sessionStorage.getItem("aditya-room-complete-v1")), null);
      await page.getByRole("button", { name: "Skip prologue" }).click();
      await page.locator("[data-event-horizon]").waitFor({ state: "detached" });
      report.checks.push({ name: "intentional replay after completion", passed: true });
    }
    await context.close();
  }
  assert.equal(report.errors.length, 0);
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally {
  await browser.close();
  await writeFile("visual-qa/room/final/edge-report.json", JSON.stringify(report, null, 2));
  console.log(report);
}
