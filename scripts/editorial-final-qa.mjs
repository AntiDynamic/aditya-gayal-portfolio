import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.QA_URL || "http://localhost:3004";
const output = process.env.QA_OUTPUT || "visual-qa/editorial-final";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const report = { checks: [], errors: [] };

try {
  for (const [name, width, height, reduced] of [["desktop", 1440, 900, false], ["laptop", 1024, 800, false], ["mobile", 390, 844, false], ["reduced", 1440, 900, true]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: name === "mobile", hasTouch: name === "mobile", reducedMotion: reduced ? "reduce" : "no-preference" });
    page.on("pageerror", error => report.errors.push(error.message));
    await page.goto(`${base}/?portfolio`);
    await page.locator('[data-editorial][data-ready="true"]').waitFor();
    const capture = async (selector, suffix, offset = 0) => {
      await page.evaluate(([target, distance]) => { const element = document.querySelector(target); window.scrollTo(0, element.getBoundingClientRect().top + scrollY + distance); }, [selector, offset]);
      await page.waitForTimeout(reduced ? 150 : 1100);
      await page.screenshot({ path: `${output}/${name}-${suffix}.png`, scale: "css" });
    };
    await capture("#about", "about", height * .2);
    const heading = page.locator("#about h2");
    assert.match(await heading.innerText(), /I’m Aditya/);
    assert.equal(await heading.evaluate(element => getComputedStyle(element).clipPath), "none");
    if (name !== "mobile") {
      const image = await page.locator("#about figure img").boundingBox();
      const text = await heading.boundingBox();
      assert.ok(text.x > image.x + image.width * .9, "About heading must not sit under the portrait");
    }
    await capture("#work", "work", height * .3);
    const color = await page.locator("#work").evaluate(element => {
      const root = element.closest("[data-editorial]");
      const style = getComputedStyle(root.dataset.motion === "true" && root.dataset.reduced !== "true" ? root : element);
      return style.getPropertyValue("--paper").trim();
    });
    assert.match(color, /^(rgb\(2\d\d,?\s*1\d\d,?\s*\d\d\)|#da864d)$/i, `Expected warm orange Work background, got ${color}`);
    await capture('[data-chapter="interlude"]', "interlude", height * .14);
    assert.equal(await page.locator('[data-chapter="interlude"] h2').innerText(), "Games, anime,\nand films.");
    assert.match(await page.locator('[data-chapter="interlude"] p').innerText(), /starting a new project/);
    assert.ok(await page.locator('[data-chapter="interlude"] img').evaluate(image => image.complete && image.naturalWidth > 0));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: horizontal overflow`);
    report.checks.push(`${name}: About readable; Work orange; interests, photograph, and layout visible`);
    await page.close();
  }
  assert.deepEqual(report.errors, []);
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(report); }
