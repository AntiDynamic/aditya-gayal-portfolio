import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.QA_URL || "http://localhost:3004";
const output = process.env.QA_OUTPUT || "visual-qa/release/recovery";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const page = await browser.newPage();
const report = { checks: [], errors: [] };
page.on("pageerror", error => report.errors.push(error.message));
try {
  await page.goto(`${base}/?portfolio`);
  await page.waitForSelector('[data-editorial][data-ready="true"]');
  for (const action of ["retry", "bypass"]) {
    assert.equal(await page.evaluate(() => {
      const element = document.querySelector("[data-editorial]");
      let fiber = element[Object.keys(element).find(key => key.startsWith("__reactFiber$"))];
      while (fiber) {
        const instance = fiber.stateNode;
        if (instance && typeof instance.retry === "function" && typeof instance.reset === "function" && instance.props.errorComponent) {
          instance.setState({ error: { thrownValue: new Error("Release recovery check") } });
          return true;
        }
        fiber = fiber.return;
      }
      return false;
    }), true);
    await page.getByRole("heading", { name: "That didn’t load." }).waitFor();
    await page.screenshot({ path: `${output}/${action}-error.png` });
    if (action === "retry") await page.getByRole("button", { name: "Try again" }).click();
    else await page.getByRole("link", { name: "Open the portfolio" }).click();
    await page.waitForSelector('[data-editorial][data-ready="true"]');
    assert.equal(await page.locator("[data-room],[data-event-horizon]").count(), 0);
    assert.equal(await page.getByRole("heading", { name: "That didn’t load." }).count(), 0);
    report.checks.push(`${action}: injected root React boundary recovers into the usable portfolio`);
  }
  assert.deepEqual(report.errors, []);
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(report); }
