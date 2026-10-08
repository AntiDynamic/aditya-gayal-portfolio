import { CanvasTexture, SRGBColorSpace } from "three";
import { projects } from "../projects";

export function paperTexture(kind: "notebook" | "diagram" | "label" | "frames" | "drawer" | "scraps", maximumSize = 1536) {
  const canvas = document.createElement("canvas");
  canvas.width = kind === "notebook" ? 1536 : 1024;
  canvas.height = kind === "notebook" ? 1024 : 768;
  const context = canvas.getContext("2d")!;
  context.fillStyle = kind === "diagram" ? "#d5cfb9" : "#e8dfc6";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 0.07;
  for (let line = 0; line < canvas.height; line += 3) {
    context.fillStyle = line % 9 === 0 ? "#6e6655" : "#fff7dc";
    context.fillRect(0, line, canvas.width, 1);
  }
  context.globalAlpha = 1;
  context.strokeStyle = "#9dafa9";
  context.lineWidth = 1;
  context.font = '500 41px "Room Hand", cursive';
  context.fillStyle = "#363a39";
  if (kind === "notebook") {
    for (let line = 95; line < 980; line += 52) {
      context.beginPath(); context.moveTo(52, line); context.lineTo(1484, line); context.stroke();
    }
    const notes = ["why is this behaving like that", "tried the obvious fix", "didn't work", "this version is worse lol", "maybe the problem is", "somewhere else", "ask someone tomorrow"];
    notes.forEach((note, index) => { context.save(); context.translate(80 + index % 3 * 8, 139 + index * 70); context.rotate((index % 3 - 1) * 0.008); context.fillText(note, 0, 0); context.restore(); });
    context.font = '500 41px "Room Hand", cursive';
    ["okay that actually helped", "don't touch this part anymore", "try the weird version", "nope"].forEach((note, index) => context.fillText(note, 832, 180 + index * 145));
    context.strokeStyle = "#565d55"; context.lineWidth = 2;
    context.strokeRect(136, 750, 110, 69); context.strokeRect(370, 767, 110, 69);
    context.beginPath(); context.moveTo(246, 785); context.lineTo(340, 786); context.lineTo(331, 780); context.moveTo(350, 800); context.lineTo(257, 853); context.stroke();
    context.font = '500 34px "Room Hand", cursive'; context.fillText("?", 301, 760); context.fillText("keep this bit", 1020, 830);
    context.strokeStyle = "#918976"; context.lineWidth = 7; context.beginPath(); context.moveTo(768, 0); context.lineTo(768, 1024); context.stroke();
    context.strokeStyle = "#484b46"; context.lineWidth = 2; context.beginPath(); context.moveTo(80, 337); context.lineTo(448, 326); context.stroke();
    context.fillStyle = "#83806d"; context.font = '500 23px "Room Hand", cursive'; context.fillText("buffer?", 91, 933); context.fillText("16 / 32 /", 1160, 962);
    const gutter = context.createLinearGradient(720, 0, 807, 0); gutter.addColorStop(0, "rgba(45,37,25,0)"); gutter.addColorStop(0.5, "rgba(45,37,25,.18)"); gutter.addColorStop(1, "rgba(45,37,25,0)"); context.fillStyle = gutter; context.fillRect(720, 0, 87, 1024);
  } else if (kind === "diagram") {
    context.font = '500 24px "Room Hand", cursive'; context.fillText("route / v3", 77, 88);
    context.lineWidth = 3; context.strokeStyle = "#414843";
    for (let column = 0; column < 5; column++) for (let row = 0; row < 3; row++) context.strokeRect(91 + column * 175, 160 + row * 145, 110, 89);
    context.lineWidth = 7; context.beginPath(); context.moveTo(134, 651); context.lineTo(275, 651); context.lineTo(275, 140); context.lineTo(796, 140); context.lineTo(796, 495); context.stroke();
    context.strokeStyle = "#398895"; context.lineWidth = 6; context.beginPath(); context.moveTo(136, 635); context.lineTo(651, 635); context.lineTo(651, 490); context.lineTo(851, 490); context.stroke();
    context.fillStyle = "#398895"; context.font = '22px "Courier New", monospace'; context.fillText("this?", 695, 552);
    context.fillStyle = "#414843"; context.font = '500 24px "Room Hand", cursive'; context.fillText("yeah", 746, 590); context.fillText("check the turn", 540, 75);
    context.lineWidth = 2; context.strokeStyle = "#a05f4b"; context.beginPath(); context.moveTo(767, 450); context.lineTo(828, 518); context.moveTo(828, 450); context.lineTo(767, 518); context.stroke();
  } else if (kind === "scraps") {
    context.font = '500 32px "Room Hand", cursive';
    context.fillText("after save?", 63, 93); context.fillText("32 → 16", 64, 160); context.fillText("ask tomorrow", 573, 108);
    context.fillText("v2", 67, 460); context.strokeStyle = "#737966"; context.lineWidth = 3;
    context.beginPath(); context.moveTo(80, 530); context.lineTo(235, 530); context.lineTo(235, 690); context.moveTo(88, 510); context.lineTo(290, 710); context.stroke();
  } else if (kind === "frames") {
    for (let frame = 0; frame < 5; frame++) {
      context.fillStyle = ["#6d756a", "#7e8172", "#8d8e79", "#747a6c", "#5d695e"][frame]; context.fillRect(45 + frame * 190, 250, 160, 220);
      context.fillStyle = "#d5d2b9"; context.fillRect(75 + frame * 190, 380 - frame * 15, 32, 85);
    }
    context.fillStyle = "#3a403a"; context.fillText("cut here", 580, 590);
  } else if (kind === "drawer") {
    context.font = '500 96px "Room Hand", cursive'; context.fillText("cables", 95, 275); context.font = '500 64px "Room Hand", cursive'; context.fillText("worked yesterday", 95, 415);
  } else {
    context.font = '40px "Courier New", monospace'; context.fillText("worked technically", 78, 300); context.fillText("don't rewrite this again", 78, 430);
  }
  const size = Math.min(maximumSize, kind === "label" ? 256 : kind === "frames" || kind === "drawer" || kind === "scraps" ? 512 : canvas.width);
  let output = canvas;
  if (size !== canvas.width) { output = document.createElement("canvas"); output.width = size; output.height = Math.round(canvas.height * size / canvas.width); output.getContext("2d")!.drawImage(canvas, 0, 0, output.width, output.height); }
  const texture = new CanvasTexture(output);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function monitorTexture(recovered: boolean, recovering = false) {
  const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 640;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#202a29"; context.fillRect(0, 0, 1024, 640);
  context.fillStyle = "#d9ddc9"; context.font = '32px "Courier New", monospace'; context.fillText(recovered ? "/home/aditya/work" : "/home/aditya", 70, 79);
  context.fillStyle = "#929e8c"; context.font = '24px "Courier New", monospace'; context.fillText(recovered ? "5 folders found" : recovering ? "checking work/..." : "some files are damaged", 70, 135);
  if (recovered) {
    context.fillStyle = "#d9ddc9"; context.font = '40px "Courier New", monospace';
    const folders = ["continuum/", "tracepilot/", "netranagar/", "video-editor/", "ai4browser/"];
    projects.forEach((project, index) => { context.strokeStyle = "#8e9b87"; context.strokeRect(74, 181 + index * 60, 23, 17); context.fillText(folders[index] ?? `${project.name.toLowerCase()}/`, 121, 203 + index * 60); });
    context.font = '27px "Courier New", monospace'; context.fillText("Aditya Gayal", 70, 570); context.fillText("[ open ]", 761, 570);
  } else {
    context.fillStyle = "#b8c1b2"; context.font = '31px "Courier New", monospace';
    ["notes/", "work/", "old/", "screenshots/", "misc/"].forEach((folder, index) => context.fillText(folder, 90, 210 + index * 49));
    context.fillStyle = "#d9ddc9"; context.fillText(recovering ? "checking..." : "[ recover work/ ]", 70, 520);
  }
  context.fillStyle = "rgba(0,0,0,.045)"; for (let line = 0; line < 640; line += 3) context.fillRect(0, line, 1024, 1);
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}

export function keyboardTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 512;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#a9ae9e"; context.fillRect(0, 0, 1024, 512);
  const rows = ["1234567890-=⌫", "QWERTYUIOP[]\\", "ASDFGHJKL;' ↵", "ZXCVBNM,./   "];
  context.font = '25px "Courier New", monospace'; context.textAlign = "center"; context.textBaseline = "middle";
  rows.forEach((row, rowIndex) => [...row].forEach((character, column) => { context.fillStyle = ["A", "S", "D", "E"].includes(character) ? "#bebfaf" : "#aaaf9e"; context.fillRect(column * 1024 / 13, rowIndex * 512 / 5, 1024 / 13, 512 / 5); context.fillStyle = "#3e443b"; context.fillText(character, (column + 0.5) * 1024 / 13, (rowIndex + 0.5) * 512 / 5); }));
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}
