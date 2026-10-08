import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const base = process.env.QA_URL || "http://localhost:3001";
const output = resolve("visual-qa/room/final");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const results = { base, screenshots: [], recordings: [], checks: [], errors: [], consoleErrors: [], performance: [] };
const contexts = [];
const watchErrors = (page, expected = false) => {
  page.on("pageerror", error => results.errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") results.consoleErrors.push({ text: message.text(), expected }); });
};
const capture = async (page, name) => { const path = resolve(output, `${name}.png`); await page.screenshot({ path, scale: "css" }); results.screenshots.push(path); };
const ready = async page => page.waitForFunction(() => document.querySelector("[data-room]")?.dataset.phase === "ready", { timeout: 60000 });
const view = async (page, label) => {
  const mobile = await page.locator('[aria-label="Room viewpoints"]').count();
  if (mobile) await page.getByRole("navigation", { name: "Room viewpoints" }).getByRole("button", { name: label, exact: true }).click();
  else {
    const details = page.locator('[data-room] details');
    if (!(await details.evaluate(node => node.open))) await details.locator("summary").click();
    await page.getByRole("navigation", { name: "Keyboard viewpoints" }).getByRole("button", { name: label.toLowerCase() === "drawing" ? "wall" : label.toLowerCase(), exact: true }).click();
  }
  await page.waitForTimeout(1400);
};
const inspect = async (page, label) => {
  await view(page, label);
  const mobile = await page.locator('[aria-label="Room viewpoints"]').count();
  if (mobile) await page.getByRole("button", { name: "Look closer", exact: true }).click();
  else { await page.keyboard.press("e"); await page.locator('[data-room][data-phase="inspect"]').waitFor(); }
  await page.waitForTimeout(1100);
};

try {
  for (const width of [1440, 1024, 390]) {
    const height = width === 390 ? 844 : 900;
    const context = await browser.newContext({ viewport: { width, height }, screen: { width: 1920, height: 1080 }, deviceScaleFactor: width === 390 ? 3 : 1, isMobile: width === 390, hasTouch: width === 390, reducedMotion: "no-preference", recordVideo: width !== 1024 ? { dir: resolve(output, "recordings"), size: { width, height } } : undefined });
    contexts.push(context); const page = await context.newPage(); watchErrors(page);
    await page.goto(`${base}/?replay=1&motion=full`, { waitUntil: "networkidle", timeout: 90000 });
    {
      await page.locator('[data-event-horizon][data-bridge="true"]').waitFor();
      assert.equal(await page.locator("[data-identity]").evaluate(node => getComputedStyle(node).visibility), "hidden");
      await page.waitForFunction(() => document.querySelector("[data-event-horizon]")?.dataset.observerDistance, { timeout: 60000 });
      await page.evaluate(() => { const root = document.querySelector("[data-event-horizon]"); window.scrollTo(0, (root.offsetHeight - innerHeight) * 0.872); });
      await page.waitForFunction(() => Number(document.querySelector("[data-event-horizon]")?.dataset.progress) >= 0.871, { timeout: 60000 });
      await capture(page, `${width}-01-white-point`);
      await page.evaluate(() => { const root = document.querySelector("[data-event-horizon]"); window.scrollTo(0, root.offsetHeight - innerHeight); });
    }
    await page.waitForSelector('[data-room]', { timeout: 60000 });
    await capture(page, `${width}-01b-full-white`);
    await page.waitForSelector('[data-room][data-ready="true"]', { timeout: 60000 });
    await page.waitForFunction(() => Number(document.querySelector("[data-room]")?.dataset.wakeTime) >= 2.3, { timeout: 60000 });
    await capture(page, `${width}-02-fluorescent-reveal`);
    await page.waitForFunction(() => Number(document.querySelector("[data-room]")?.dataset.wakeTime) >= 2.8, { timeout: 60000 });
    await capture(page, `${width}-03-floor`);
    await page.waitForFunction(() => Number(document.querySelector("[data-room]")?.dataset.wakeTime) >= 3.25);
    await capture(page, `${width}-03b-fixture-detail`);
    await ready(page); await capture(page, `${width}-04-standing`);
    assert.equal(await page.evaluate(() => document.pointerLockElement !== null), false);
    await page.getByRole("button", { name: "Enter room" }).click(); await page.waitForTimeout(400);
    await page.waitForFunction(() => document.querySelector("[data-room]")?.dataset.audio === "running");
    assert.equal(await page.getByRole("button", { name: /Sound on|Sound off|Enable animation|Pause animation/ }).count(), 0);
    if (width !== 390) {
      const locked = await page.evaluate(() => document.pointerLockElement !== null);
      results.checks.push({ width, name: "deliberate pointer lock", passed: locked });
      const before = await page.locator("[data-room]").getAttribute("data-camera");
      await page.keyboard.down("w"); await page.waitForTimeout(2600); await page.keyboard.up("w"); await page.waitForTimeout(500);
      const firstStop = await page.locator("[data-room]").getAttribute("data-camera");
      await page.keyboard.down("w"); await page.waitForTimeout(1200); await page.keyboard.up("w"); await page.waitForTimeout(400);
      const secondStop = await page.locator("[data-room]").getAttribute("data-camera");
      assert.notEqual(before, firstStop);
      assert.ok(Math.abs(Number(firstStop.split(",")[2]) - Number(secondStop.split(",")[2])) < 0.1);
      results.checks.push({ width, name: "WASD movement and chair collision", passed: true, before, firstStop, secondStop });
      await page.keyboard.press("Escape"); await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => document.pointerLockElement !== null), false);
      results.checks.push({ width, name: "pointer-lock escape", passed: true });
      await page.getByRole("button", { name: "Resume mouse look" }).click(); await page.waitForTimeout(300);
      await page.keyboard.down("a"); await page.waitForTimeout(900); await page.keyboard.up("a");
      await page.keyboard.down("w"); await page.waitForTimeout(650); await page.keyboard.up("w");
      await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    } else {
      assert.equal(await page.locator("[data-room]").getAttribute("data-guided"), "true");
      await page.mouse.wheel(0, 500); await page.waitForTimeout(1200);
      assert.equal(await page.getByRole("button", { name: "Notebook", exact: true }).getAttribute("aria-current"), "location");
      results.checks.push({ width, name: "guided scroll and no pointer lock", passed: true });
    }
    await capture(page, `${width}-05-desk-approach`);
    await view(page, "Desk"); await capture(page, `${width}-05b-desk-wide-lamp-off`);
    await view(page, "Notebook"); await capture(page, `${width}-05c-notebook-untouched`);
    await inspect(page, "Notebook"); await capture(page, `${width}-06-notebook`);
    if (width === 390) { await page.getByRole("button", { name: "Other page" }).click(); await page.waitForTimeout(700); await capture(page, `${width}-07-notebook-other-page`); }
    await page.keyboard.press("Escape"); await page.waitForTimeout(950);
    assert.equal(await page.locator('[data-room][data-phase="explore"]').count(), 1);
    await capture(page, `${width}-08-partial-power`);
    await view(page, "Desk"); await capture(page, `${width}-08b-desk-lamp-on`);
    await inspect(page, "Shelf"); await capture(page, `${width}-09-shelf`);
    await page.getByRole("button", { name: "Back" }).click(); await page.waitForTimeout(950);
    await inspect(page, "Drawing"); await capture(page, `${width}-10-two-handwritings`);
    await page.getByRole("button", { name: "Back" }).click(); await page.waitForTimeout(950);
    if (width !== 390) { await page.locator('[data-room] details summary').click(); await page.getByRole("button", { name: "Cable drawer" }).click(); await page.waitForTimeout(1500); await capture(page, `${width}-11-cable-drawer`); await page.getByRole("button", { name: "Back" }).click(); await page.waitForTimeout(950); }
    await inspect(page, "Computer"); await capture(page, `${width}-12-computer-inactive`);
    const monitorPoint = (horizontal, vertical) => ({ x: width / 2 + (horizontal - 0.5) * 0.64 / (2 * (width === 390 ? 1.251 : 1.001) * Math.tan((width === 390 ? 62 : 43) / 2 * Math.PI / 180)) * height, y: height / 2 - (0.5 - vertical) * 0.4 / (2 * (width === 390 ? 1.251 : 1.001) * Math.tan((width === 390 ? 62 : 43) / 2 * Math.PI / 180)) * height });
    const recoveryPoint = monitorPoint(0.20, 520 / 640); await page.mouse.click(recoveryPoint.x, recoveryPoint.y);
    await page.getByRole("button", { name: "Open portfolio" }).waitFor({ timeout: 10000 });
    await capture(page, `${width}-13-computer-active`);
    results.performance.push({ width, recordingActive: width !== 1024, ...(await page.locator("[data-room]").evaluate(node => ({ ...node.dataset }))) });
    const openPoint = monitorPoint(0.81, 570 / 640); await page.mouse.click(openPoint.x, openPoint.y);
    results.checks.push({ width, name: "physical monitor UV interaction", passed: true });
    await page.waitForTimeout(1100); await capture(page, `${width}-14-monitor-handoff`);
    const canvasSize = await page.locator('[data-identity-journey] canvas').evaluate(node => ({ width: node.width, height: node.height }));
    await page.waitForSelector("[data-room]", { state: "detached", timeout: 20000 });
    await page.waitForTimeout(1800);
    assert.deepEqual(await page.locator('[data-identity-journey] canvas').evaluate(node => ({ width: node.width, height: node.height })), canvasSize);
    assert.equal(await page.getByText("3D unavailable. The story is still here.").count(), 0);
    assert.equal(await page.getByRole("heading", { name: "Aditya Gayal", exact: true }).count(), 1);
    assert.equal(await page.getByText("STRANGE QUESTIONS.", { exact: true }).count(), 0);
    await capture(page, `${width}-15-website`);
    assert.equal(await page.locator("[inert]").count(), 0);
    assert.equal(await page.evaluate(() => sessionStorage.getItem("aditya-room-complete-v1")), "true");
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    assert.equal(Math.round(await page.locator("main.portfolio-shell").evaluate(node => node.getBoundingClientRect().top)), 0);
    await page.goto(base, { waitUntil: "networkidle" }); assert.equal(await page.locator("[data-room],[data-event-horizon]").count(), 0);
    results.checks.push({ width, name: "handoff and repeat visit", passed: true });
    const recording = page.video(); await context.close(); if (recording) results.recordings.push({ width, path: await recording.path() });
  }

  for (const test of ["direct", "skip", "reduced", "webgl-failure", "no-js"]) {
    const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, screen: { width: 1920, height: 1080 }, javaScriptEnabled: test !== "no-js", reducedMotion: test === "reduced" ? "reduce" : "no-preference" }); contexts.push(context);
    if (test === "webgl-failure") await context.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (/^webgl/.test(type)) return null; return original.call(this, type, ...args); }; });
    const page = await context.newPage(); watchErrors(page, test === "webgl-failure");
    await page.goto(`${base}/${test === "direct" ? "#work" : test === "skip" ? "?room=1" : ""}`, { waitUntil: "networkidle", timeout: 90000 });
    if (test === "direct" || test === "no-js") { assert.equal(await page.locator("[data-room],[data-event-horizon]").count(), 0); assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1); }
    if (test === "skip") { await page.getByRole("button", { name: "Skip prologue" }).click(); await page.waitForSelector("[data-room]", { state: "detached" }); }
    if (test === "reduced") { await ready(page); assert.equal(await page.locator("[data-event-horizon]").count(), 0); assert.equal(await page.locator("[data-room]").getAttribute("data-reduced"), "true"); await capture(page, "reduced-static-room"); await page.getByRole("button", { name: "Skip prologue" }).click(); }
    if (test === "webgl-failure") await page.waitForFunction(() => !document.documentElement.dataset.prologue, { timeout: 20000 });
    results.checks.push({ name: test, passed: true }); await context.close();
  }
  const performanceContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" }); contexts.push(performanceContext);
  const performancePage = await performanceContext.newPage();
  await performancePage.addInitScript(() => {
    window.qaRoomDraws = 0;
    const original = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function(...args) { window.qaRoomDraws++; return original.apply(this, args); };
  });
  await performancePage.goto(`${base}/?room=1`, { waitUntil: "networkidle" }); await ready(performancePage); await performancePage.waitForTimeout(7000);
  results.performance.push({ width: 1440, recordingActive: false, ...(await performancePage.locator("[data-room]").evaluate(node => {
    const context = node.querySelector("canvas").getContext("webgl2"); const debug = context.getExtension("WEBGL_debug_renderer_info");
    return { ...node.dataset, gpu: debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "unknown" };
  })) });
  const paused = await performancePage.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); return window.qaRoomDraws; });
  await performancePage.waitForTimeout(400); assert.equal(await performancePage.evaluate(() => window.qaRoomDraws), paused);
  await performancePage.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); }); await performancePage.waitForTimeout(400); assert.ok(await performancePage.evaluate(() => window.qaRoomDraws) > paused);
  results.checks.push({ name: "visibility handler pause/resume (injected event)", passed: true });
  await performanceContext.close();
  assert.equal(results.errors.length, 0);
  assert.equal(results.consoleErrors.filter(error => !error.expected).length, 0);
} catch (error) { results.failure = error.stack; console.error(error); process.exitCode = 1; }
finally { await Promise.all(contexts.map(context => context.close().catch(() => {}))); await browser.close(); await writeFile(resolve(output, "qa-report.json"), JSON.stringify(results, null, 2)); console.log(output, results.checks); }
