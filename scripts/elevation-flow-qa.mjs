import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const output = process.env.QA_OUTPUT || "visual-qa/elevation/flow";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const report = { checks: [], errors: [] };
try {
  for (const width of [1440,1024,390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, recordVideo: { dir: output, size: { width, height: 1000 } } });
    const page = await context.newPage(); page.on("pageerror", error => report.errors.push(error.message));
    await page.goto(`${process.env.QA_URL || "http://localhost:3004"}/?portfolio`);
    await page.waitForSelector('[data-webgl="ready"]'); await page.waitForTimeout(1600);
    await page.locator('[data-media] img').evaluateAll(images => images.forEach(image => image.loading = "eager"));
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-media] img')).every(image => image.complete && image.naturalWidth > 0));
    await page.evaluate(() => scrollTo(0,document.body.scrollHeight)); await page.waitForTimeout(1500);
    await page.evaluate(() => scrollTo(0,0)); await page.waitForTimeout(1500);
    const rects = await page.locator('[data-media]').evaluateAll(elements => elements.map(element => { const rect = element.getBoundingClientRect(); return { top: rect.top + scrollY, height: rect.height }; }));
    if (width === 390) {
      for (const media of await page.locator('[data-media]').all()) {
        await media.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
        assert.equal(await page.locator('[data-flow=true]').count(), 0);
        assert.ok(await media.locator('img').evaluate(image => image.complete && image.naturalWidth > 0));
      }
      report.checks.push('390: each image remains readable without the collapsing traveling-media effect');
      const video = page.video(); await context.close(); await video.saveAs(`${output}/${width}.webm`); await video.delete();
      continue;
    }
    for (let index=0; index<4; index++) {
      const start = Math.max(rects[index].top + rects[index].height - 580,index>0?rects[index].top-130:-Infinity);
      const end = rects[index+1].top - 250;
      if (end <= start + 80) continue;
      await page.evaluate(top => scrollTo(0,top),start-20); await page.waitForTimeout(100);
      for (const progress of [.02,.5,.98,.5,.02]) {
        await page.evaluate(top => scrollTo(0,top),start+(end-start)*progress);
        await page.waitForTimeout(350);
        assert.equal(await page.locator('[data-flow=true]').count(),2);
        await page.screenshot({ path:`${output}/${width}-${index}-${progress}.png`, scale:"css" });
      }
      await page.evaluate(top => scrollTo(0,top),end+20); await page.waitForTimeout(500);
      assert.equal(await page.locator('[data-flow=true]').count(),0);
      report.checks.push(`${width}: transition ${index} enters, reverses, aligns and releases`);
    }
    await page.emulateMedia({ reducedMotion:"reduce" });
    await page.evaluate(top=>scrollTo(0,top),(rects[0].top+rects[0].height-580+rects[1].top-250)/2); await page.waitForTimeout(700);
    assert.equal(await page.locator('[data-flow=true]').count(),0);
    assert.match(await page.locator('#about h2').innerText(), /I’m Aditya/);
    report.checks.push(`${width}: reduced motion disables traveling media and keeps About text readable`);
    const video = page.video(); await context.close(); await video.saveAs(`${output}/${width}.webm`); await video.delete();
  }
  assert.deepEqual(report.errors,[]);
} catch (error) { report.failure=error.stack; process.exitCode=1; }
finally { await browser.close(); await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)); console.log(report); }
