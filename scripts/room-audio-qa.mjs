import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--enable-gpu", "--use-gl=angle", "--use-angle=gl"] });
const output = "visual-qa/room/lock/audio"; await mkdir(output, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.addInitScript(() => {
    window.roomAudioCaptures = [];
    const captures = new Map();
    const original = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(destination, ...argumentsList) {
      const result = original.call(this, destination, ...argumentsList);
      if (destination instanceof AudioDestinationNode) {
        const context = this.context;
        if (!captures.has(context)) {
          const stream = context.createMediaStreamDestination();
          const recorder = new MediaRecorder(stream.stream, { mimeType: "audio/webm;codecs=opus" });
          const chunks = [];
          recorder.addEventListener("dataavailable", event => { if (event.data.size) chunks.push(event.data); });
          context.addEventListener("statechange", () => { if (context.state === "running" && recorder.state === "inactive") recorder.start(); });
          captures.set(context, { stream, recorder, chunks }); window.roomAudioCaptures.push(captures.get(context));
        }
        original.call(this, captures.get(context).stream);
      }
      return result;
    };
  });
  await page.goto(`${process.env.QA_URL || "http://localhost:3000"}/?room=1`, { waitUntil: "networkidle" });
  await page.locator('[data-room][data-phase="ready"]').waitFor({ timeout: 60000 });
  await page.getByRole("button", { name: "Enter room", exact: true }).click(); await page.waitForTimeout(300);
  await page.keyboard.down("w"); await page.waitForTimeout(1300); await page.keyboard.up("w");
  await page.keyboard.down("s"); await page.waitForTimeout(1000); await page.keyboard.up("s");
  await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  const navigation = page.getByRole("navigation", { name: "Room viewpoints" });
  await navigation.getByRole("button", { name: "Notebook", exact: true }).click(); await page.waitForTimeout(1400);
  await page.getByRole('button', { name:'Look closer', exact:true }).click(); await page.waitForTimeout(2000);
  await page.getByRole('button', { name:'Other page', exact:true }).click(); await page.waitForTimeout(700);
  await page.keyboard.press("e"); await page.waitForTimeout(1000);
  await navigation.getByRole("button", { name: "Computer", exact: true }).click(); await page.waitForTimeout(1400);
  await page.getByRole('button', { name:'Look closer', exact:true }).click(); await page.waitForTimeout(1100);
  await page.getByRole("button", { name: "Recover files" }).click(); await page.waitForTimeout(4000);
  const recordings = await page.evaluate(async () => {
    const output = [];
    for (const capture of window.roomAudioCaptures) {
      if (capture.recorder.state !== "recording") continue;
      await new Promise(resolve => { capture.recorder.addEventListener("stop", resolve, { once: true }); capture.recorder.stop(); });
      const blob = new Blob(capture.chunks, { type: "audio/webm" });
      output.push(await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(",")[1]); reader.readAsDataURL(blob); }));
    }
    return output;
  });
  for (const [index, recording] of recordings.entries()) await writeFile(`${output}/room-tone-${index}.webm`, Buffer.from(recording, "base64"));
  if (!recordings.length) throw new Error("No running room audio output was captured");
  console.log(output, recordings.length, "actual Web Audio output recording(s)");
} finally { await browser.close(); }
