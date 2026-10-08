import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = process.env.QA_OUTPUT || "visual-qa/fluidity/ordinary";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, recordVideo: { dir: output, size: { width: 1440, height: 1000 } } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
try {
  await page.goto(`${process.env.QA_URL || "http://localhost:3000"}/?portfolio`);
  await page.waitForSelector('[data-webgl="ready"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${output}/01-hero.png` });
  const scroll = async (distance, count = 12) => {
    for (let step = 0; step < count; step++) {
      await page.mouse.wheel(0, distance / count);
      await page.waitForTimeout(120);
    }
  };
  const length = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let step = 1; step <= 12; step++) {
    await scroll(length / 12);
    await page.waitForTimeout(900);
    if ([2, 4, 6, 8, 10, 12].includes(step)) await page.screenshot({ path: `${output}/${String(step + 1).padStart(2, "0")}-scroll.png` });
    const media = await page.locator('[data-project] [data-media]').evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      return rect.top > 0 && rect.bottom < innerHeight ? { x: rect.x + rect.width * .65, y: rect.y + rect.height * .4 } : null;
    }).filter(Boolean));
    if (media.length) {
      await page.mouse.move(media[0].x, media[0].y, { steps: 15 });
      await page.waitForTimeout(900);
      await page.mouse.move(1400, 950, { steps: 15 });
      await page.waitForTimeout(700);
    }
  }
  await page.waitForTimeout(1500);
  await scroll(-length, 35);
  await page.waitForTimeout(1500);
} finally {
  const video = page.video();
  await context.close();
  await video.saveAs(`${output}/ordinary.webm`);
  await browser.close();
  await writeFile(`${output}/report.json`, JSON.stringify({ errors }, null, 2));
}
if (errors.length) throw new Error(errors.join("\n"));
