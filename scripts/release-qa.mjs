import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.QA_URL || "http://localhost:3004";
const output = process.env.QA_OUTPUT || "visual-qa/release/local";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const report = { base, checks: [], errors: [], violations: [] };
try {
  for (const [name, width, height] of [["desktop", 1440, 1000], ["laptop", 1024, 800], ["mobile", 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: name === "mobile", hasTouch: name === "mobile" });
    await context.addInitScript(() => {
      window.releaseViolations = [];
      addEventListener("securitypolicyviolation", event => window.releaseViolations.push({ directive: event.violatedDirective, blocked: event.blockedURI }));
    });
    const page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    const response = await page.goto(`${base}/?portfolio`);
    assert.equal(response.status(), 200);
    const headers = response.headers();
    assert.equal(headers["x-content-type-options"], "nosniff");
    assert.equal(headers["x-frame-options"], "DENY");
    assert.ok(headers["content-security-policy"].includes("object-src 'none'"));
    assert.ok(!headers["content-security-policy"].includes("'unsafe-eval'"));
    assert.equal(headers["x-powered-by"], undefined);
    await page.waitForSelector('[data-editorial][data-ready="true"]');
    await page.waitForFunction(() => Array.from(document.querySelectorAll("[data-media] img")).every(image => image.complete && image.naturalWidth > 0));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${output}/${name}-hero.png` });
    for (const chapter of ["about", "work", "lately", "contact"]) {
      await page.locator(`#${chapter}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${output}/${name}-${chapter}.png` });
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.getByRole("button", { name: "Play portfolio music" }).click();
    await page.waitForFunction(() => { const audio = document.querySelector("[data-portfolio-music]"); return !audio.paused && audio.currentTime > .2 && audio.volume > .05; });
    await page.getByRole("button", { name: "Mute portfolio music" }).click();
    await page.waitForFunction(() => document.querySelector("[data-portfolio-music]").paused);
    report.violations.push(...await page.evaluate(() => window.releaseViolations));
    report.checks.push(`${name}: production headers, five media sources, all chapters, no overflow, music play/mute`);
    await context.close();
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", error => report.errors.push(error.message));
  await page.goto(base);
  await page.locator("[data-prologue-black-hole]").waitFor();
  await page.locator("[data-black-hole-cue]").waitFor({ state: "visible" });
  await page.screenshot({ path: `${output}/first-visit-black-hole.png` });
  await page.mouse.wheel(0, 700);
  await page.waitForFunction(() => Number(document.querySelector("[data-event-horizon]")?.dataset.progress) > 0);
  report.checks.push("Fresh visit renders the black hole and native wheel advances the intro");
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(".skip-content").evaluate(element => document.activeElement === element), true);
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => !document.querySelector("[data-prologue-black-hole],[data-room]"));
  await page.locator("#work").waitFor();
  assert.equal(await page.evaluate(() => location.hash), "#work");
  report.checks.push("Keyboard skip bypasses the full prologue and reaches Work");
  await page.goto(base);
  await page.locator("[data-prologue-black-hole]").waitFor();
  report.checks.push("Returning to the root URL starts the full intro again");
  await page.getByRole("button", { name: "Skip prologue" }).click();
  await page.getByRole("link", { name: "Watch the intro" }).click();
  await page.locator("[data-prologue-black-hole]").waitFor();
  assert.match(page.url(), /replay=1&motion=full/);
  report.checks.push("Hero replay restarts at the black hole");
  const reducedContext = await browser.newContext({ reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(base);
  await reducedPage.locator("[data-prologue-black-hole]").waitFor();
  await reducedPage.goto(`${base}/?room=1`);
  await reducedPage.locator("[data-room]").waitFor();
  await reducedPage.getByRole("button", { name: "Skip prologue" }).click();
  await reducedPage.getByRole("link", { name: "Watch the intro" }).click();
  await reducedPage.locator("[data-prologue-black-hole]").waitFor();
  report.checks.push("Reduced motion shows the black hole with reduced animation; direct guided room and full replay remain available");
  await reducedContext.close();
  const missing = await page.goto(`${base}/missing-page-release-check`);
  assert.equal(missing.status(), 404);
  await page.getByRole("link", { name: "Open the portfolio" }).click();
  await page.waitForSelector('[data-editorial][data-ready="true"]');
  assert.equal(await page.locator("[data-room],[data-event-horizon]").count(), 0);
  report.checks.push("404 recovery opens the real portfolio without replaying the prologue");
  for (const path of ["/audio/work-in-progress.mp3", "/room/models/room-shell.glb", "/.env.local", "/.git/config", "/docs/portfolio-repair.md", "/visual-qa/repair/index.html"]) {
    const response = await context.request.get(`${base}${path}`);
    if (path.startsWith("/audio/")) {
      assert.equal(response.status(), 200);
      assert.ok(response.headers()["content-type"].includes("audio/"));
    } else if (path.startsWith("/room/")) {
      assert.equal(response.status(), 200);
      assert.equal((await response.body()).subarray(0, 4).toString(), "glTF");
    } else assert.equal(response.status(), 404);
  }
  report.checks.push("Original music served correctly; environment, git, documentation and QA files are not public routes");
  await context.close();
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.violations, []);
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(report); }
