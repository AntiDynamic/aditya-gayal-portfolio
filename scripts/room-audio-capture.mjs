import { writeFile } from "node:fs/promises";

export async function captureRoomAudio(page) {
  await page.addInitScript(() => {
    window.roomAudioCaptures = [];
    const captures = new Map(); const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(destination, ...argumentsList) {
      const result = connect.call(this, destination, ...argumentsList);
      if (destination instanceof AudioDestinationNode) {
        const context = this.context;
        if (!captures.has(context)) {
          const stream = context.createMediaStreamDestination(); const recorder = new MediaRecorder(stream.stream, { mimeType: "audio/webm;codecs=opus" });
          const capture = { stream, recorder, chunks: [], started: 0 };
          recorder.addEventListener("dataavailable", event => { if (event.data.size) capture.chunks.push(event.data); });
          const start = () => { if (context.state === "running" && recorder.state === "inactive" && !capture.started) { capture.started = Date.now(); recorder.start(); } };
          context.addEventListener("statechange", start); start();
          captures.set(context, capture); window.roomAudioCaptures.push(capture);
        }
        connect.call(this, captures.get(context).stream);
      }
      return result;
    };
  });
}

export async function saveRoomAudio(page, output, test, videoStarted) {
  const recordings = await page.evaluate(async () => {
    const recordings = [];
    for (const capture of window.roomAudioCaptures ?? []) {
      if (!capture.started) continue;
      if (capture.recorder.state === "recording") await new Promise(resolve => { capture.recorder.addEventListener("stop", resolve, { once: true }); capture.recorder.stop(); });
      const blob = new Blob(capture.chunks, { type: "audio/webm" });
      const data = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(",")[1]); reader.readAsDataURL(blob); });
      recordings.push({ started: capture.started, data });
    }
    return recordings;
  });
  const saved = [];
  for (const [index, recording] of recordings.entries()) {
    const path = `${output}/recordings/${test}-audio-${index}.webm`; await writeFile(path, Buffer.from(recording.data, "base64"));
    saved.push({ path, offset: Math.max(0, (recording.started - videoStarted) / 1000) });
  }
  return saved;
}
