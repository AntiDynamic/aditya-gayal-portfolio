import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const directory = new URL("../visual-qa/room/blockout/", import.meta.url).pathname;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, screen: { width: 1920, height: 1080 } });
const errors = []; page.on("pageerror", error => errors.push(error.message)); page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
await page.goto("http://localhost:3001/?room=1", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForSelector('[data-room][data-ready="true"]', { timeout: 60000 });
await page.waitForFunction(() => document.querySelector("[data-room]")?.dataset.phase === "ready", { timeout: 60000 });
await page.screenshot({ path: `${directory}/standing.png` });
await page.getByRole("button", { name: "Use guided exploration" }).click();
for (const [viewpoint, label] of [["desk", "Desk"], ["notebook", "Notebook"], ["shelf", "Shelf"], ["wall", "Drawing"], ["computer", "Computer"]]) {
  await page.getByRole("navigation", { name: "Room viewpoints" }).getByRole("button", { name: label, exact: true }).click();
  await page.waitForTimeout(1600); await page.screenshot({ path: `${directory}/${viewpoint}.png` });
  if (viewpoint !== "desk") {
    await page.getByRole("button", { name: "Look closer" }).click(); await page.waitForTimeout(1200);
    await page.screenshot({ path: `${directory}/${viewpoint}-inspection.png` });
    if (viewpoint === "computer") {
      await page.getByRole("button", { name: "Recover files" }).click(); await page.waitForTimeout(2000);
      await page.screenshot({ path: `${directory}/computer-active.png` });
      await page.getByRole("button", { name: "Open portfolio" }).click();
      await page.waitForTimeout(1200); await page.screenshot({ path: `${directory}/handoff-middle.png` });
      await page.waitForTimeout(2700); await page.screenshot({ path: `${directory}/website.png` });
    } else await page.getByRole("button", { name: "Back" }).click();
  }
}
await writeFile(`${directory}/report.json`, JSON.stringify({ errors, room: await page.locator("[data-room]").count(), completed: await page.evaluate(() => sessionStorage.getItem("aditya-room-complete-v1")) }, null, 2));
console.log(directory, errors);
await browser.close();
