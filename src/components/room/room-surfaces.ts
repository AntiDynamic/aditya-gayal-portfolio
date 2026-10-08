import { CanvasTexture, SRGBColorSpace } from "three";

export function finishTexture(kind: "paint" | "paper" | "plastic") {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d")!;
  const pixels = context.createImageData(256, 256);
  let seed = 91873;
  for (let pixel = 0; pixel < 256 * 256; pixel++) {
    seed = seed * 16807 % 2147483647;
    const horizontal = pixel % 256; const vertical = Math.floor(pixel / 256);
    const grain = (seed / 2147483647 - 0.5) * (kind === "paper" ? 18 : 8);
    const fiber = kind === "paper" ? Math.sin(vertical * 2.6 + horizontal * 0.018) * 5 : 0;
    const repair = kind === "paint" ? Math.exp(-((horizontal - 166) ** 2 + (vertical - 93) ** 2) / 1800) * 18 : 0;
    const value = Math.round((kind === "plastic" ? 178 : 239) + grain + fiber - repair);
    pixels.data.set([value, value, value, 255], pixel * 4);
  }
  context.putImageData(pixels, 0, 0);
  return new CanvasTexture(canvas);
}

export function windowTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 512;
  const context = canvas.getContext("2d")!;
  context.strokeStyle = "rgba(228,240,243,.28)"; context.lineWidth = 1;
  for (let streak = 0; streak < 29; streak++) { const horizontal = (streak * 71) % 256; const vertical = (streak * 83) % 470; context.beginPath(); context.moveTo(horizontal, vertical); context.bezierCurveTo(horizontal + 2, vertical + 12, horizontal - 1, vertical + 35, horizontal, vertical + 44); context.stroke(); }
  const edge = context.createLinearGradient(0, 0, 0, 512); edge.addColorStop(0, "rgba(119,133,127,.32)"); edge.addColorStop(0.18, "rgba(119,133,127,0)"); edge.addColorStop(0.83, "rgba(119,133,127,0)"); edge.addColorStop(1, "rgba(119,133,127,.4)"); context.fillStyle = edge; context.fillRect(0, 0, 256, 512);
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}

export function fixtureTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 64;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#eceee9"; context.fillRect(0, 0, 256, 64);
  context.fillStyle = "rgba(160,171,169,.12)"; for (let rib = 2; rib < 254; rib += 4) context.fillRect(rib, 0, 1, 64);
  const edge = context.createLinearGradient(0, 0, 0, 64); edge.addColorStop(0, "rgba(87,91,75,.24)"); edge.addColorStop(0.14, "rgba(87,91,75,0)"); edge.addColorStop(0.86, "rgba(87,91,75,0)"); edge.addColorStop(1, "rgba(87,91,75,.19)"); context.fillStyle = edge; context.fillRect(0, 0, 256, 64);
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}

export function surfaceAtlas() {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1024;
  const context = canvas.getContext("2d")!;
  const contact = context.createRadialGradient(256, 256, 40, 256, 256, 255);
  contact.addColorStop(0, "rgba(23,26,24,.30)"); contact.addColorStop(0.65, "rgba(23,26,24,.12)"); contact.addColorStop(1, "rgba(23,26,24,0)");
  context.fillStyle = contact; context.fillRect(0, 0, 512, 512);
  context.save(); context.translate(512, 0);
  context.strokeStyle = "rgba(57,48,36,.16)"; context.lineWidth = 1.5;
  for (let scratch = 0; scratch < 17; scratch++) { const horizontal = 70 + scratch * 20; const vertical = 175 + Math.sin(scratch * 2.8) * 60; context.beginPath(); context.moveTo(horizontal, vertical); context.lineTo(horizontal + 25 + scratch % 4 * 9, vertical - 9); context.stroke(); }
  const rubbed = context.createRadialGradient(255, 280, 15, 255, 280, 190); rubbed.addColorStop(0, "rgba(245,231,196,.14)"); rubbed.addColorStop(1, "rgba(245,231,196,0)"); context.fillStyle = rubbed; context.fillRect(0, 0, 512, 512); context.restore();
  context.save(); context.translate(0, 512);
  context.strokeStyle = "rgba(47,42,35,.12)"; context.lineWidth = 3;
  for (const offset of [0, 9, 120, 126]) { context.beginPath(); context.ellipse(265, 285, 100 + offset, 185, -0.18, 0.8, 2.2); context.stroke(); }
  context.restore(); context.save(); context.translate(512, 512);
  for (let fingerprint = 0; fingerprint < 4; fingerprint++) {
    context.strokeStyle = "rgba(231,230,213,.11)"; context.lineWidth = 1.2;
    for (let ridge = 0; ridge < 7; ridge++) { context.beginPath(); context.ellipse(160 + fingerprint * 32, 260, 16 + ridge * 3, 30 + ridge * 5, fingerprint * 0.12, 0.1, 5.7); context.stroke(); }
  }
  context.restore();
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}
