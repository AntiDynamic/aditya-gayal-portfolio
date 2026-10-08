import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "visual-qa/editorial/proof";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(`${process.env.QA_URL || "http://localhost:3000"}/?portfolio`);
await page.waitForSelector('[data-webgl="ready"]');
await page.waitForTimeout(1800);
const capture = name => page.screenshot({ path: `${output}/${name}.png` });
await capture("02-hero-initial");
await page.evaluate(() => scrollTo(0, 350)); await page.waitForTimeout(250); await capture("03-hero-depth");
const measurements = [];
for (const [index, selector] of [["photo-a",'[data-media="portrait"]'], ["project-01",'[data-project="continuum"] [data-media]'], ["project-02",'[data-project="tracepilot"] [data-media]'], ["photo-b",'[data-media="interlude"]']]) {
  await page.evaluate(selector => { const bounds = document.querySelector(selector).getBoundingClientRect(); scrollTo(0,bounds.top+scrollY-innerHeight+(innerHeight+bounds.height)*.3); }, selector);
  await page.waitForTimeout(1800);
  await capture(`${index}-spatial`);
  measurements.push({ state: index, ...await page.locator(selector).evaluate(element => ({ ...element.dataset, source: element.querySelector('img').currentSrc })) });
  await page.evaluate(selector => { const bounds = document.querySelector(selector).getBoundingClientRect(); scrollTo(0,bounds.top+scrollY-innerHeight+(innerHeight+bounds.height)*.65); }, selector);
  await page.mouse.move(0,0); await page.waitForTimeout(2200); await capture(`${index}-returned-dom`);
}
await page.locator('#contact').scrollIntoViewIfNeeded(); await page.waitForTimeout(2400); await capture("15-contact-rest");
await page.waitForTimeout(1200);
measurements.push({ state: "idle", ...await page.locator('[data-editorial-canvas]').evaluate(element => ({...element.dataset})) });
await writeFile(`${output}/states.json`,JSON.stringify(measurements,null,2));
await browser.close();
