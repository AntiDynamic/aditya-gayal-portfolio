import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";

const output = process.env.RECORD_OUTPUT || "visual-qa/final-recording";
const base = process.env.RECORD_URL || "https://aditya-gayal-portfolio.vercel.app/?replay=1&motion=full";
await mkdir(`${output}/recordings`, { recursive: true });
const rawVideo = `${output}/recordings/full-experience-silent.webm`;
const rawAudio = `${output}/recordings/full-experience-audio.wav`;
const finalVideo = `${output}/aditya-gayal-full-experience.mp4`;
const sinkName = `portfolio_capture_${process.pid}`;
let captureModule;
let audio;
let browser;
let context;
let failure;

try {
  captureModule = execFileSync("pactl", ["load-module", "module-null-sink", `sink_name=${sinkName}`, "rate=48000", "channels=2"], { encoding: "utf8" }).trim();
  audio = spawn("parec", ["--device", `${sinkName}.monitor`, "--rate", "48000", "--channels", "2", "--format", "s16le", "--file-format=wav", rawAudio], { stdio: "ignore" });
  browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, ignoreDefaultArgs: ["--mute-audio"], env: { ...process.env, PULSE_SINK: sinkName }, args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl", "--autoplay-policy=no-user-gesture-required"] });
  await wait(650);
  context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference", recordVideo: { dir: `${output}/recordings`, size: { width: 1440, height: 900 } } });
  const page = await context.newPage();
  page.on("pageerror", error => console.error("Page error:", error.message));
  await page.addInitScript(() => {
    window.qaMouseMovement = [0, 0];
    addEventListener("pointermove", event => { if (document.pointerLockElement && event.isTrusted) { window.qaMouseMovement[0] += event.movementX; window.qaMouseMovement[1] += event.movementY; } });
  });
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  const hole = page.locator("[data-event-horizon]");
  await hole.waitFor();
  await page.waitForFunction(() => Number(document.querySelector("[data-event-horizon]")?.dataset.draws) > 1, { timeout: 60000 }).catch(() => {});
  for (let index = 0; index < 48; index++) {
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(180);
    if (await page.locator("[data-room]").count()) break;
  }
  await page.locator('[data-room][data-phase="ready"]').waitFor({ timeout: 60000 });
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Enter room", exact: true }).click();
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);

  const camera = async () => (await page.locator("[data-room]").getAttribute("data-camera")).split(",").map(Number);
  const aim = async target => {
    if (!await page.evaluate(() => document.pointerLockElement !== null)) {
      await page.getByRole("button", { name: "Resume mouse look", exact: true }).click();
      await page.waitForFunction(() => document.pointerLockElement !== null, { timeout: 5000 });
    }
    const movePointer = async (horizontal, vertical, steps = 1) => {
      await page.waitForTimeout(150);
      const before = await page.evaluate(() => ({ target: document.querySelector("[data-room]").dataset.lookTarget.split(",").map(Number), movement: [...window.qaMouseMovement] }));
      await page.mouse.move(horizontal, vertical, { steps });
      const movement = await page.evaluate(() => window.qaMouseMovement);
      const desired = [before.target[0] - (movement[0] - before.movement[0]) * 0.0018, Math.max(-1.15, Math.min(1.15, before.target[1] - (movement[1] - before.movement[1]) * 0.0018))];
      await page.waitForFunction(value => {
        const root = document.querySelector("[data-room]");
        const pose = root.dataset.look.split(",").map(Number);
        const target = root.dataset.lookTarget.split(",").map(Number);
        return pose.every((entry, index) => Math.abs(entry - value[index]) < 0.00005) && target.every((entry, index) => Math.abs(entry - value[index]) < 0.00005);
      }, desired, { timeout: 10000 });
    };
    await movePointer(720, 440);
    const [yaw, pitch] = (await page.locator("[data-room]").getAttribute("data-look")).split(",").map(Number);
    const position = await camera();
    const horizontal = target[0] - position[0]; const depth = target[2] - position[2];
    const nextYaw = Math.atan2(-horizontal, -depth); const nextPitch = Math.atan2(target[1] - position[1], Math.hypot(horizontal, depth));
    const movement = [(yaw - nextYaw) / 0.0018, (pitch - nextPitch) / 0.0018];
    const segments = Math.max(1, Math.ceil(Math.max(...movement.map(Math.abs)) / 140));
    await movePointer(720 + movement[0], 440 + movement[1], segments * 8);
  };
  const hold = async (key, duration) => { await page.keyboard.down(key); await page.waitForTimeout(duration); await page.keyboard.up(key); await page.waitForTimeout(300); };

  let position = await camera();
  await aim([position[0], position[1], position[2] - 1]);
  await hold("a", 1400);
  await hold("w", 2800);
  await aim([-1.04, 0.81, -1.65]);
  await page.waitForFunction(() => document.querySelector("[data-room]")?.dataset.target === "notebook", { timeout: 7000 });
  await page.keyboard.press("e");
  await page.locator('[data-room][data-inspection="notebook"]').waitFor();
  await page.waitForTimeout(1400);
  await page.getByRole("button", { name: "Other page", exact: true }).click();
  await page.waitForTimeout(800);
  await page.keyboard.press("e");
  await page.waitForTimeout(850);

  position = await camera();
  await aim([position[0], position[1], position[2] - 1]);
  await hold("s", 850);
  await hold("d", 2300);
  await hold("w", 650);
  await aim([0.86, 1.64, -2.727]);
  await page.waitForFunction(() => document.querySelector("[data-room]")?.dataset.target === "diagram", { timeout: 7000 });
  await page.keyboard.press("e");
  await page.locator('[data-room][data-inspection="diagram"]').waitFor();
  await page.waitForTimeout(1300);
  await page.keyboard.press("e");
  await page.waitForTimeout(900);

  await aim([-0.5, 1.20, -2.071]);
  await page.waitForFunction(() => document.querySelector("[data-room]")?.dataset.target === "computer", { timeout: 7000 });
  await page.keyboard.press("e");
  await page.locator('[data-room][data-inspection="computer"]').waitFor();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Recover files" }).click();
  await page.getByRole("button", { name: "Open portfolio" }).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1100);
  await page.getByRole("button", { name: "Open portfolio" }).click();
  await page.waitForFunction(() => !document.querySelector("[data-room]") && document.querySelector('[data-editorial][data-ready="true"]'), { timeout: 30000 });
  await page.waitForTimeout(1700);
  await page.getByRole("button", { name: "Play portfolio music" }).click();
  await page.waitForFunction(() => { const music = document.querySelector("[data-portfolio-music]"); return music && !music.paused && music.volume > 0.08; }, { timeout: 10000 });
  await page.waitForTimeout(1800);
  const visit = async (selector, hold) => {
    const destination = await page.locator(selector).evaluate(element => scrollY + element.getBoundingClientRect().top - 90);
    const distance = Math.max(0, destination - await page.evaluate(() => scrollY));
    const steps = Math.max(1, Math.ceil(distance / 480));
    for (let index = 0; index < steps; index++) {
      await page.mouse.wheel(0, distance / steps);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(900 + hold);
  };
  await visit("#about", 1800);
  await page.locator("[data-photo-zoom]").first().hover();
  await page.waitForTimeout(700);
  await visit("#work", 1300);
  for (const project of await page.locator("[data-project]").all()) {
    await visit(`[data-project='${await project.getAttribute("data-project")}']`, 1700);
    await project.locator("a").last().hover();
    await page.waitForTimeout(450);
  }
  await visit("[data-chapter='interlude']", 2300);
  await visit("#lately", 1800);
  await visit("#contact", 2800);

  const video = page.video();
  await context.close();
  await video.saveAs(rawVideo);
} catch (error) {
  failure = error;
} finally {
  if (context) await context.close().catch(() => {});
  if (browser) await browser.close();
  if (audio && audio.exitCode === null) {
    const stopped = new Promise(resolve => audio.once("exit", resolve));
    audio.kill("SIGINT");
    await stopped;
  }
  if (captureModule) execFileSync("pactl", ["unload-module", captureModule]);
}

if (failure) throw failure;
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", rawVideo, "-i", rawAudio, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-threads", "2", "-preset", "fast", "-crf", "19", "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-18:TP=-2:LRA=11,volume=-2dB", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", finalVideo]);
console.log(finalVideo);
