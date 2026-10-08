import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const rate = 44100;
const beat = 60 / 84;
const duration = beat * 64;
const length = Math.round(rate * duration);
const left = new Float32Array(length);
const right = new Float32Array(length);
let seed = 9147;
const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
const add = (start, seconds, render, pan = 0) => {
  const offset = Math.round(start * rate);
  const count = Math.round(seconds * rate);
  for (let sample = 0; sample < count; sample++) {
    const value = render(sample / rate, sample / count);
    const index = (offset + sample) % length;
    left[index] += value * Math.sqrt((1 - pan) / 2);
    right[index] += value * Math.sqrt((1 + pan) / 2);
  }
};
const note = (midi, start, seconds, level, pan, soft = true) => {
  const frequency = 440 * 2 ** ((midi - 69) / 12);
  add(start, seconds, (time, progress) => {
    const attack = Math.min(1, time / (soft ? .05 : .015));
    const release = Math.min(1, (1 - progress) * 8);
    const phase = time * frequency * Math.PI * 2;
    const body = Math.sin(phase) + Math.sin(phase * 2 + Math.sin(time * 3) * .02) * .18 * Math.exp(-time * 2) + Math.sin(phase * 3) * .045;
    return body * attack * release * Math.exp(-time * (soft ? .65 : 1.3)) * level;
  }, pan);
};
const chords = [[53, 57, 60, 64, 67], [50, 57, 60, 64, 69], [45, 55, 60, 64, 67], [46, 53, 57, 60, 65]];
for (let bar = 0; bar < 16; bar++) {
  const chord = chords[Math.floor(bar / 2) % chords.length];
  const start = bar * beat * 4;
  if (bar % 2 === 0) chord.slice(1).forEach((midi, index) => note(midi, start + index * .013, beat * 6, .047, (index - 1.5) * .22));
  note(chord[0] - 12, start, beat * 2.8, .11, 0);
  if (bar % 4 !== 3) note(chord[0] - 12, start + beat * 2.5, beat * 1.2, .052, 0);
  if (bar % 4 === 1 || bar % 4 === 2) {
    note(chord[3] + 12, start + beat * 1.5, beat * 1.2, .028, -.25, false);
    note(chord[2] + 12, start + beat * 3, beat * 1.2, .022, .25, false);
  }
  for (const pulse of [0, 2.5]) add(start + beat * pulse, .24, time => Math.sin(Math.PI * 2 * (48 * time + 8 * (1 - Math.exp(-time * 32)))) * Math.exp(-time * 26) * .095);
  for (const pulse of [1, 3]) add(start + beat * pulse, .12, time => (random() * 2 - 1) * Math.exp(-time * 42) * .025, -.08);
  for (let tick = 0; tick < 8; tick++) add(start + beat * tick / 2 + (tick % 2 ? .025 : 0), .035, time => (random() * 2 - 1) * Math.exp(-time * 150) * .012, tick % 2 ? .35 : -.35);
}
const dryLeft = left.slice();
const dryRight = right.slice();
for (let sample = 0; sample < length; sample++) {
  left[sample] += dryRight[(sample - Math.round(rate * .29) + length) % length] * .13;
  right[sample] += dryLeft[(sample - Math.round(rate * .43) + length) % length] * .13;
}
const pcm = Buffer.alloc(length * 4);
for (let sample = 0; sample < length; sample++) {
  pcm.writeInt16LE(Math.round(Math.tanh(left[sample] * 1.1) * 22000), sample * 4);
  pcm.writeInt16LE(Math.round(Math.tanh(right[sample] * 1.1) * 22000), sample * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0); header.writeUInt32LE(pcm.length + 36, 4); header.write("WAVEfmt ", 8); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22); header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34); header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
await mkdir("public/audio", { recursive: true });
await mkdir("visual-qa/repair", { recursive: true });
const raw = "visual-qa/repair/portfolio-music.wav";
await writeFile(raw, Buffer.concat([header, pcm]));
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af", "volume=10dB", "-c:a", "libmp3lame", "-q:a", "4", "public/audio/work-in-progress.mp3"]);
console.log({ duration, bpm: 84, source: "Original composition synthesized by this script; no sampled recordings." });
