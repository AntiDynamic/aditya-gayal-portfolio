import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { captureRoomAudio, saveRoomAudio } from "./room-audio-capture.mjs";

const output = process.env.QA_OUTPUT || "visual-qa/audio";
const base = process.env.QA_URL || "http://localhost:3000";
await mkdir(`${output}/recordings`, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const report = { errors: [], measurements: [], checks: [], recordings: [] };
try {
  for (const test of (process.env.QA_TESTS || "cosmic,room,mobile").split(",")) {
    const context = await browser.newContext({ viewport: { width: test === "mobile" ? 390 : 1440, height: test === "mobile" ? 844 : 900 }, hasTouch: test === "mobile", reducedMotion: test === "cosmic" ? "no-preference" : "reduce", recordVideo: { dir: `${output}/recordings` } });
    const page = await context.newPage(); const started = Date.now();
    page.on("pageerror", error => report.errors.push(error.message));
    await captureRoomAudio(page);
    await page.addInitScript(() => {
      window.audioProbe = { contexts: [], outputs: [], effects: [] };
      const connect = AudioNode.prototype.connect;
      AudioNode.prototype.connect = function(destination, ...args) {
        const result = connect.call(this, destination, ...args);
        if (!window.audioProbe.contexts.includes(this.context)) window.audioProbe.contexts.push(this.context);
        if (destination instanceof AudioDestinationNode) {
          const analyser = this.context.createAnalyser(); analyser.fftSize = 2048;
          connect.call(this, analyser); window.audioProbe.outputs.push(analyser);
        }
        return result;
      };
      const start = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function(...args) {
        if (!this.loop) window.audioProbe.effects.push({ duration: this.buffer?.duration, time: this.context.currentTime });
        return start.apply(this, args);
      };
    });
    const measure = async label => {
      const value = await page.evaluate(() => {
        const probe = window.audioProbe;
        const analyser = probe.outputs[0];
        if (!analyser) return { contexts: probe.contexts.length, rms: 0 };
        const samples = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(samples);
        const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
        return { contexts: probe.contexts.length, state: probe.contexts[0].state, rms, effects: probe.effects.length, allFinite: samples.every(Number.isFinite), progress: Number(document.querySelector("[data-event-horizon]")?.dataset.progress ?? -1), playingTracks: [...document.querySelectorAll("audio")].filter(track => !track.paused).length };
      });
      report.measurements.push({ test, label, ...value }); return value;
    };
    await page.goto(`${base}/?${test === "cosmic" ? "replay=1&motion=full" : "room=1"}`, { waitUntil: "networkidle" });
    if (test === "cosmic") {
      await page.waitForFunction(() => document.querySelector("[data-event-horizon]")?.dataset.observerDistance, { timeout: 60000 });
      await page.mouse.click(700, 400);
      for (const [label, progress, hold] of [["distant", 0, 5000], ["approach", 0.45, 2500], ["interior", 0.70, 2500], ["singularity", 0.885, 2500], ["white", 0.96, 1200]]) {
        await page.evaluate(progress => { const root = document.querySelector("[data-event-horizon]"); window.scrollTo(0, (root.offsetHeight - innerHeight) * progress); }, progress);
        await page.waitForTimeout(hold);
        if (label === "interior" || label === "singularity") {
          await page.waitForFunction(() => { const progress = Number(document.querySelector("[data-event-horizon]")?.dataset.progress ?? -1); return progress >= 0.575 && progress < 0.943; });
          await page.waitForTimeout(200);
        }
        const sample = await measure(label);
        if (label === "interior" || label === "singularity") { assert.ok(sample.rms < 0.00001, `${label} must be silent`); assert.equal(sample.playingTracks, 0); }
        await page.screenshot({ path: `${output}/${test}-${label}.png` });
      }
      report.checks.push("Interior text and singularity: zero measured audio and no playing media");
      await page.evaluate(() => { const root = document.querySelector("[data-event-horizon]"); window.scrollTo(0, root.offsetHeight - innerHeight); });
      await page.locator('[data-room][data-phase="ready"]').waitFor({ timeout: 60000 });
      const room = await measure("fluorescent"); assert.equal(room.contexts, 1); assert.equal(room.state, "running"); assert.ok(room.rms > 0);
      report.checks.push("Cosmic → fluorescent shares one unlocked context");
      await page.getByRole("button", { name: "Skip prologue", exact: false }).click();
    } else {
      await page.locator('[data-room][data-phase="ready"]').waitFor({ timeout: 60000 });
      await page.getByRole("button", { name: "Enter room", exact: true }).click();
      await page.waitForTimeout(1300); const bed = await measure("room-tone"); assert.equal(bed.contexts, 1); assert.ok(bed.rms > 0);
      const navigation = page.getByRole("navigation", { name: "Room viewpoints" });
      await navigation.getByRole("button", { name: "Notebook", exact: true }).click(); await page.waitForTimeout(1400);
      await page.getByRole("button", { name: "Look closer", exact: true }).click(); await page.waitForTimeout(1300);
      await page.getByRole("button", { name: "Other page", exact: true }).click(); await page.waitForTimeout(700);
      await page.screenshot({ path: `${output}/${test}-notebook.png` }); await measure("paper-lamp");
      await page.getByRole("button", { name: "Back", exact: false }).click(); await page.waitForTimeout(1000);
      await navigation.getByRole("button", { name: "Computer", exact: true }).click(); await page.waitForTimeout(1400);
      await page.getByRole("button", { name: "Look closer", exact: true }).click(); await page.waitForTimeout(1200);
      await page.getByRole("button", { name: "Recover files", exact: true }).click(); await page.waitForTimeout(2500);
      const active = await measure("fan-keyboard-drive"); assert.ok(active.effects >= 5); assert.equal(active.contexts, 1);
      await page.screenshot({ path: `${output}/${test}-computer.png` });
      await page.getByRole("button", { name: "Open portfolio", exact: false }).click();
      await page.waitForFunction(() => !document.querySelector("[data-room]"), { timeout: 30000 }); await page.waitForTimeout(1500);
      await measure("portfolio-handoff"); report.checks.push(`${test}: natural unlock, Foley, fan and monitor handoff`);
    }
    assert.equal(await page.getByRole("button", { name: /enable sound/i }).count(), 0);
    const contexts = await page.evaluate(() => window.audioProbe.contexts.length); assert.equal(contexts, 1);
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(() => window.audioProbe.contexts[0].state), "suspended");
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: false }); Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(() => window.audioProbe.contexts[0].state), "running");
    report.checks.push(`${test}: hidden pause and visible resume`);
    report.recordings.push({ test, audio: await saveRoomAudio(page, output, test, started), video: await page.video().path() });
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  assert.ok(report.measurements.every(value => value.allFinite));
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); }
