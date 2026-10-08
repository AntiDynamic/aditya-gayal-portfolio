import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { captureRoomAudio, saveRoomAudio } from "./room-audio-capture.mjs";

const output = process.env.QA_OUTPUT || "visual-qa/room/lock"; await mkdir(`${output}/recordings`, { recursive: true });
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const report = { checks: [], errors: [], consoleErrors: [], performance: [], recordings: [] };
const base = process.env.QA_URL || "http://localhost:3000";
try {
  for (const test of ["desktop", "desktop1024", "resize", "mobile", "reduced"].filter(test => !process.env.QA_TESTS || process.env.QA_TESTS.split(',').includes(test))) {
    const width = test === "mobile" ? 390 : ["resize", "desktop1024"].includes(test) ? 1024 : 1440;
    const context = await browser.newContext({ viewport: { width, height: test === "mobile" ? 844 : 900 }, hasTouch: test === "mobile", isMobile: test === "mobile", deviceScaleFactor: test === "mobile" ? 3 : 1, reducedMotion: test === "reduced" ? "reduce" : "no-preference", recordVideo: { dir: `${output}/recordings`, size: { width, height: test === "mobile" ? 844 : 900 } } });
    const videoStarted = Date.now(); const page = await context.newPage(); page.on("pageerror", error => report.errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
    await captureRoomAudio(page);
    await page.addInitScript(() => {
      window.qaMouseMovement = [0, 0];
      addEventListener('pointermove', event => { if (document.pointerLockElement && event.isTrusted) { window.qaMouseMovement[0] += event.movementX; window.qaMouseMovement[1] += event.movementY; } });
    });
    const capture = async name => page.screenshot({ path: `${output}/${test}-${name}.png`, scale: "css" });
    await page.goto(`${base}/?${test === "reduced" ? "room=1" : "replay=1&motion=full"}`, { waitUntil: "networkidle" });
    if (test !== "reduced") {
      await page.waitForFunction(() => document.querySelector('[data-event-horizon]')?.dataset.observerDistance, { timeout: 60000 });
      await page.evaluate(() => { const root = document.querySelector('[data-event-horizon]'); window.scrollTo(0, (root.offsetHeight - innerHeight) * 0.872); });
      await page.waitForFunction(() => Number(document.querySelector('[data-event-horizon]')?.dataset.progress) >= 0.871, { timeout: 60000 });
      await capture('01-white-point');
      await page.evaluate(() => { const root = document.querySelector('[data-event-horizon]'); window.scrollTo(0, root.offsetHeight - innerHeight); });
      await page.locator('[data-room]').waitFor({ timeout: 60000 }); await capture('02-full-white');
      for (const [name, time] of [['03-diffuser', 2.3], ['04-fixture', 3.15], ['05-lying-down', 3.5]]) {
        await page.waitForFunction(time => Number(document.querySelector('[data-room]')?.dataset.wakeTime) >= time, time, { timeout: 60000 }); await capture(name);
      }
    }
    await page.locator('[data-room][data-phase="ready"]').waitFor({ timeout: 60000 }); await capture('06-standing');
    assert.equal(await page.getByRole("button", { name: /guided|Walk freely/ }).count(), 0);
    const guided = test === "mobile" || test === "reduced";
    assert.equal(await page.locator('[aria-label="Room viewpoints"]').count(), 0);
    await page.getByRole("button", { name: "Enter room", exact: true }).click(); await page.waitForTimeout(250); await page.keyboard.press("Escape"); await page.waitForTimeout(250);
    await capture('07-desk-wide-lamp-off');
    await capture('16-lamp-off');
    const camera = async () => (await page.locator("[data-room]").getAttribute("data-camera")).split(",").map(Number);
    if (!guided) {
      const paused = await camera(); const look = await page.locator('[data-room]').getAttribute('data-look');
      await page.keyboard.down('w'); await page.mouse.move(width / 2 + 100, 400); await page.waitForTimeout(250); await page.keyboard.up('w');
      const after = await camera();
      assert.ok(Math.hypot(paused[0] - after[0], paused[2] - after[2]) < 0.01);
      assert.equal(await page.locator('[data-room]').getAttribute('data-look'), look);
      report.checks.push(`${test}: released mouse pauses walking and unlocked mouse cannot rotate camera`);
    }
    const aim = async target => {
      if (!await page.evaluate(() => document.pointerLockElement !== null)) {
        await page.getByRole("button", { name: "Resume mouse look", exact: true }).click();
        await page.waitForFunction(() => document.pointerLockElement !== null);
      }
      const movePointer = async (horizontal, vertical, steps = 1) => {
        await page.waitForTimeout(150);
        const before = await page.evaluate(() => ({ target: document.querySelector('[data-room]').dataset.lookTarget.split(',').map(Number), movement: [...window.qaMouseMovement] }));
        await page.mouse.move(horizontal, vertical, { steps });
        const movement = await page.evaluate(() => window.qaMouseMovement);
        const desired = [before.target[0] - (movement[0] - before.movement[0]) * 0.0018, Math.max(-1.15, Math.min(1.15, before.target[1] - (movement[1] - before.movement[1]) * 0.0018))];
        await page.waitForFunction(desired => { const root = document.querySelector('[data-room]'); const pose = root.dataset.look.split(',').map(Number); const target = root.dataset.lookTarget.split(',').map(Number); return pose.every((value, index) => Math.abs(value - desired[index]) < 0.00005) && target.every((value, index) => Math.abs(value - desired[index]) < 0.00005); }, desired);
      };
      await movePointer(width / 2, 400);
      const [yaw, pitch] = (await page.locator("[data-room]").getAttribute("data-look")).split(",").map(Number);
      const position = await camera(); const horizontal = target[0] - position[0]; const depth = target[2] - position[2];
      const nextYaw = Math.atan2(-horizontal, -depth); const nextPitch = Math.atan2(target[1] - position[1], Math.hypot(horizontal, depth));
      const movement = [(yaw - nextYaw) / 0.0018, (pitch - nextPitch) / 0.0018];
      const segments = Math.max(1, Math.ceil(Math.max(...movement.map(Math.abs)) / 140));
      await movePointer(width / 2 + movement[0], 400 + movement[1], segments * 8);
    };
    const hold = async (key, duration) => { await page.keyboard.down(key); await page.waitForTimeout(duration); await page.keyboard.up(key); await page.waitForTimeout(250); };
    if (guided) {
      if (test === 'mobile') {
        await page.waitForTimeout(1400); const session = await context.newCDPSession(page);
        await session.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x:300, y:400 }] });
        for (const horizontal of [240, 180, 120]) await session.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x:horizontal, y:400 }] });
        await session.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] }); await page.waitForTimeout(1400);
        assert.equal(await page.getByRole('button', { name:'Notebook', exact:true }).getAttribute('aria-current'), 'location'); report.checks.push('mobile: real touch swipe advances authored view');
      }
      await page.getByRole("button", { name: "Notebook", exact: true }).click(); await page.waitForTimeout(1400);
      assert.equal(await page.evaluate(() => document.pointerLockElement !== null), false);
      assert.equal(await page.getByRole("button", { name: "Walk", exact: true }).count(), 0);
      report.checks.push(`${test}: authored exploration without pointer capture or walking controls`);
    } else {
    const position = await camera(); await aim([position[0], position[1], position[2] - 1]);
    await hold("a", 1400); await hold("w", 2800);
    const stopped = await camera(); await hold('w', 500); const pushed = await camera(); assert.ok(Math.hypot(stopped[0] - pushed[0], stopped[2] - pushed[2]) < 0.10);
    report.checks.push(`${test}: free movement reaches the desk with collision`);
    if (test === "desktop") {
      const nearDesk = await camera(); await aim([-4, 1.75, nearDesk[2]]); await page.screenshot({ path: `${output}/window-level.png` });
      await aim([-4, 0.45, nearDesk[2]]); await page.screenshot({ path: `${output}/window-down.png` });
      await aim([-4, 2.7, nearDesk[2]]); await page.screenshot({ path: `${output}/window-up.png` });
    }
    await aim([-1.04, 0.81, -1.65]); await page.locator('[data-room][data-target="notebook"]').waitFor({ timeout: 5000 });
    }
    await capture('08-desk-close'); await capture('09-notebook-untouched');
    if (guided) await page.getByRole("button", { name: "Look closer", exact: true }).click(); else await page.keyboard.press("e");
    await page.locator('[data-room][data-inspection="notebook"]').waitFor(); await page.waitForTimeout(1200);
    assert.ok(Number(await page.locator('[data-room]').getAttribute('data-notebook-lift')) > 0.99);
    await page.screenshot({ path: `${output}/${test}-notebook.png` }); await capture('10-notebook-inspected');
    await page.getByRole('button', { name:'Other page', exact:true }).click(); await page.waitForTimeout(650); await capture('10b-other-page');
    await page.keyboard.press("e"); await page.waitForTimeout(1100); await capture('17-lamp-on');
    assert.ok(Number(await page.locator('[data-room]').getAttribute('data-notebook-lift')) < 0.01);
    if (!guided) { assert.equal(await page.evaluate(() => document.pointerLockElement !== null), true); report.checks.push(`${test}: closing inspection resumes mouse look automatically`); }
    if (guided) {
      await page.getByRole('button', { name:'Drawing', exact:true }).click(); await page.waitForTimeout(1400); await page.getByRole('button', { name:'Look closer', exact:true }).click(); await page.waitForTimeout(1200); await capture('11-board'); await page.keyboard.press('e'); await page.waitForTimeout(1000);
      await page.getByRole('button', { name:'Desk', exact:true }).click(); await page.waitForTimeout(1400); await capture('12-second-chair');
      await page.getByRole('button', { name:'Shelf', exact:true }).click(); await page.waitForTimeout(1400); await page.getByRole('button', { name:'Look closer', exact:true }).click(); await page.waitForTimeout(1200); await capture('13-shelf'); await page.keyboard.press('e'); await page.waitForTimeout(1000);
    } else {
      const current = await camera(); await aim([current[0], current[1], current[2] - 1]); await hold('s', 850); await hold('d', 2300); await hold('w', 650);
      await aim([1.03, 1.0, -0.9]); await capture('12-second-chair');
      await aim([0.86, 1.64, -2.727]); await page.locator('[data-room][data-target="diagram"]').waitFor({ timeout:5000 }); await page.keyboard.press('e'); await page.waitForTimeout(1200); await capture('11-board'); await page.keyboard.press('e'); await page.waitForTimeout(1000);
      await aim([2.67, 1.43, -1.30]); await page.locator('[data-room][data-target="shelf"]').waitFor({ timeout:5000 }); await page.keyboard.press('e'); await page.waitForTimeout(1200); await capture('13-shelf'); await page.keyboard.press('e'); await page.waitForTimeout(1000);
    }
    if (guided) { await page.getByRole("button", { name: "Computer", exact: true }).click(); await page.waitForTimeout(1400); await page.getByRole("button", { name: "Look closer", exact: true }).click(); }
    else { await aim([-0.5, 1.20, -2.071]); await page.locator('[data-room][data-target="computer"]').waitFor({ timeout: 5000 }); await page.keyboard.press("e"); }
    await page.waitForTimeout(1300);
    await capture('14-terminal-home');
    await page.getByRole("button", { name: "Recover files" }).click(); await page.getByRole("button", { name: "Open portfolio" }).waitFor({ timeout: 10000 });
    await capture('15-work-folders'); await capture('18-powered'); await capture('19-terminal-ready');
    report.performance.push({ test, ...(await page.locator("[data-room]").evaluate(node => ({ ...node.dataset }))) });
    await page.getByRole("button", { name: "Open portfolio" }).click(); await page.locator('[data-room][data-phase="handoff"]').waitFor();
    assert.equal(await page.locator('[data-monitor-surface]').count(), 1);
    if (test === "resize") {
      await page.waitForFunction(() => Number(document.querySelector('[data-monitor-surface]')?.style.opacity) > 0.3); await page.setViewportSize({ width: 1366, height: 768 }); await page.waitForTimeout(200);
      assert.equal(await page.locator('[data-room][data-phase="handoff"]').count(), 1); report.checks.push("viewport resize keeps monitor approach alive instead of skipping it");
    }
    await page.screenshot({ path: `${output}/${test}-monitor-start.png` });
    if (test !== 'reduced') await page.waitForFunction(() => document.querySelector('[data-workbench-stage]')?.dataset.ready === 'true');
    await capture('20-monitor-start');
    if (test !== "reduced") { await page.waitForTimeout(1800); await page.screenshot({ path: `${output}/${test}-monitor-approach.png` }); }
    if (test !== 'reduced') { await page.waitForTimeout(550); await capture('21-monitor-near'); }
    await page.locator("[data-room]").waitFor({ state: "detached", timeout: 20000 }); await page.waitForTimeout(600); await page.screenshot({ path: `${output}/${test}-website.png` });
    assert.equal(await page.locator("[inert]").count(), 0); assert.equal(await page.locator("#hero-title").count(), 1);
    assert.equal(await page.evaluate(() => document.body.style.overflow), ""); assert.equal(await page.evaluate(() => document.pointerLockElement !== null), false);
    if (test !== 'reduced') assert.equal(await page.locator('[data-workbench-stage]').getAttribute('data-ready'), 'true');
    await capture('22-first-dom');
    await page.waitForSelector('[data-editorial][data-motion="true"]');
    assert.ok(await page.locator('[data-letter]').evaluateAll(letters => letters.every(letter => Number(getComputedStyle(letter).opacity) > .99)));
    assert.equal(await page.locator('[data-editorial-canvas]').evaluate(element => Boolean(element.closest('[data-monitor-surface]'))), false);
    await page.mouse.move(width / 2, 450);
    await page.waitForSelector('[data-editorial-canvas][data-idle="true"]');
    if (test === "mobile") {
      const session = await context.newCDPSession(page);
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: width / 2, y: 650 }] });
      for (const vertical of [590, 530, 470, 410, 350, 290]) {
        await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: width / 2, y: vertical }] });
        await page.waitForTimeout(90);
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else await page.mouse.wheel(0, 280);
    await page.waitForTimeout(900);
    report.performance.push({ test, handoffScroll: await page.evaluate(() => ({ scroll: scrollY, director: document.querySelector('[data-editorial]').dataset.scroll, height: document.documentElement.scrollHeight, viewport: innerHeight, bodyOverflow: getComputedStyle(document.body).overflow, htmlOverflow: getComputedStyle(document.documentElement).overflow, classes: document.documentElement.className })) });
    assert.ok(Number(await page.locator('[data-editorial]').getAttribute('data-scroll')) > 100);
    if (test !== 'reduced') assert.ok(Number(await page.locator('[data-editorial]').getAttribute('data-hero-depth')) > 1);
    report.checks.push(`${test}: portfolio motion activates after monitor removal and responds to real ${test === "mobile" ? "touch" : "wheel"} input`);
    report.checks.push(`${test}: notebook, recovery, physical monitor DOM and final handoff work`);
    const audio = await saveRoomAudio(page, output, test, videoStarted);
    await page.goto(base, { waitUntil: "networkidle" }); await page.locator("[data-prologue-black-hole]").waitFor(); report.checks.push(`${test}: root visit starts the black hole again`);
    const video = page.video(); await context.close(); report.recordings.push({ test, path: await video.path(), audio });
  }
  for (const test of ["skip", "direct", "no-js", "webgl-failure"]) {
    const context = await browser.newContext({ javaScriptEnabled: test !== "no-js" }); const page = await context.newPage();
    if (test === "webgl-failure") await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.startsWith("webgl") ? null : original.call(this, type, ...args); }; });
    await page.goto(`${base}/${test === "direct" ? "#work" : "?room=1"}`, { waitUntil: "networkidle" });
    if (test === "skip") await page.getByRole("button", { name: "Skip prologue" }).click();
    await page.locator("[data-room]").waitFor({ state: "detached", timeout: 20000 }); assert.equal(await page.locator("#hero-title").count(), 1);
    report.checks.push(`${test}: accessible portfolio available`); await context.close();
  }
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.consoleErrors, []);
} catch (error) { report.failure = error.stack; process.exitCode = 1; }
finally { await browser.close(); await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(report); }
