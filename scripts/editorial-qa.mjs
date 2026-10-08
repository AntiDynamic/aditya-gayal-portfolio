import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const base = process.env.QA_URL || "http://localhost:3004";
const output = process.env.QA_OUTPUT || "visual-qa/editorial";
await mkdir(`${output}/recordings`, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const report = { errors: [], checks: [], measurements: [] };
try {
  for (const [name, width, height, reduced] of [["desktop",1440,1000,false],["laptop",1024,800,false],["mobile",390,844,false],["reduced",1440,1000,true]].filter(test => !process.env.QA_TESTS || process.env.QA_TESTS.split(',').includes(test[0]))) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: name === "mobile" ? 3 : 1, hasTouch: name === "mobile", reducedMotion: reduced ? "reduce" : "no-preference", recordVideo: { dir: `${output}/recordings`, size: { width, height } } });
    const page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    await page.goto(`${base}/?portfolio`);
    await page.waitForSelector('[data-webgl="ready"]');
    await page.waitForTimeout(1800);
    assert.equal(await page.locator("h1").getAttribute("aria-label"), "Aditya Gayal");
    assert.equal(await page.locator("canvas").count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${output}/${name}-02-hero.png` });
    await page.evaluate(() => window.qaFrames = []);
    await page.evaluate(() => { let last = performance.now(); window.qaRunning = true; window.qaMaxCalls = 0; window.qaMaxTriangles = 0; const sample = time => { if (!window.qaRunning) return; window.qaFrames.push(time - last); last = time; const host = document.querySelector('[data-editorial-canvas]'); window.qaMaxCalls = Math.max(window.qaMaxCalls,Number(host.dataset.drawCalls||0)); window.qaMaxTriangles = Math.max(window.qaMaxTriangles,Number(host.dataset.triangles||0)); requestAnimationFrame(sample); }; requestAnimationFrame(sample); });
    const length = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const paletteSamples = [];
    for (let index = 0; index <= 55; index++) {
      await page.evaluate(top => scrollTo(0, top), length * index / 55);
      await page.waitForTimeout(100);
      paletteSamples.push(await page.locator('[data-workbench-stage]').evaluate(element => ({ body: Number(element.dataset.bodyContrast || 0), muted: Number(element.dataset.mutedContrast || 0) })));
    }
    const timing = await page.evaluate(() => { window.qaRunning = false; const values = window.qaFrames.slice(3).sort((a,b) => a-b); return { frames: values.length, medianMs: values[Math.floor(values.length*.5)], p95Ms: values[Math.floor(values.length*.95)], over33Ms: values.filter(value => value>33.4).length, maxDrawCalls: window.qaMaxCalls, maxTriangles: window.qaMaxTriangles }; });
    if (!reduced) assert.ok(paletteSamples.every(sample => sample.body >= 4.5 && sample.muted >= 4.5));
    report.measurements.push({ name, ...timing, minBodyContrast: reduced ? null : Math.min(...paletteSamples.map(sample => sample.body)), minMutedContrast: reduced ? null : Math.min(...paletteSamples.map(sample => sample.muted)), ...await page.locator('[data-editorial-canvas]').evaluate(element => ({...element.dataset})) });
    await page.waitForTimeout(700);
    if (!reduced) assert.ok(Number(await page.locator('[data-workbench-stage]').getAttribute('data-atmosphere')) <= 2);
    await page.screenshot({ path: `${output}/${name}-15-contact.png` });
    for (const [label, selector] of [["about","#about"],["work","#work"],["interlude","[data-chapter=interlude]"],["lately","#lately"]]) {
      await page.locator(selector).scrollIntoViewIfNeeded(); await page.waitForTimeout(1800);
      if (label === "work" && reduced) assert.equal(await page.locator('#work').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(37, 39, 36)');
      await page.screenshot({ path: `${output}/${name}-${label}.png` });
    }
    const media = await page.locator('[data-media] img').evaluateAll(images => images.map(image => ({ source: image.currentSrc, complete: image.complete, width: image.naturalWidth })));
    assert.ok(media.every(image => image.complete && image.width > 0));
    assert.equal(media.filter(image => image.source.includes("/personal/")).length, 2);
    await page.locator('#work').scrollIntoViewIfNeeded();
    const first = page.locator('[data-project]').first().locator('[data-media]');
    await first.scrollIntoViewIfNeeded();
    const rect = await first.boundingBox();
    await page.mouse.move(rect.x + rect.width*.5, Math.max(20,rect.y + rect.height*.5)); await page.waitForTimeout(800);
    await page.screenshot({ path: `${output}/${name}-project-hover.png` });
    await page.mouse.move(0,0);
    await page.getByRole("link", { name: "Back up ↑" }).click(); await page.waitForTimeout(1800);
    assert.equal(await page.evaluate(() => location.hash), "#hero-title");
    await page.locator('header nav a[href="#contact"]').click(); await page.waitForTimeout(1800);
    assert.equal(await page.evaluate(() => location.hash), "#contact");
    if (name === "desktop") {
      await page.evaluate(() => { window.qaContext = document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context'); window.qaContext.loseContext(); });
      await page.waitForSelector('[data-webgl="lost"]');
      assert.equal(await page.locator('[data-gl=true]').count(), 0);
      await page.evaluate(() => window.qaContext.restoreContext());
      await page.waitForSelector('[data-webgl="ready"]');
      report.checks.push("Context loss: native images restored, renderer recovered");
    }
    report.checks.push(`${name}: content, one canvas, image decoding, no overflow, anchors`);
    const video = page.video(); await context.close(); await video.saveAs(`${output}/recordings/${name}.webm`);
  }
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); await page.goto(`${base}/?portfolio`);
  assert.equal(await page.locator('#work h3').count(), 3);
  assert.equal(await page.locator('[data-media]').count(), 5);
  assert.equal(await page.locator('#work').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(37, 39, 36)');
  await page.screenshot({ path: `${output}/no-js.png` });
  report.checks.push("No JavaScript: work, approved photos and contact remain accessible");
  await context.close(); assert.deepEqual(report.errors, []);
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(report); }
