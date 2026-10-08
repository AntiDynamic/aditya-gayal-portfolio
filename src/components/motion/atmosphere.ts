import * as THREE from "three";
import { clamp, damp, mix, smooth } from "./math";
import type { CachedRect } from "./rects";
import type { MotionFrame } from "../webgl/bridge";

type RGB = [number, number, number];
const cream: RGB = [242, 237, 227];
const workOrange: RGB = [218, 134, 77];
const luminance = (color: RGB) => color.reduce((total, channel, index) => {
  const value = channel / 255;
  return total + (value <= .04045 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4)) * [.2126, .7152, .0722][index];
}, 0);
const contrast = (first: RGB, second: RGB) => (Math.max(luminance(first), luminance(second)) + .05) / (Math.min(luminance(first), luminance(second)) + .05);
const blend = (first: RGB, second: RGB, progress: number) => first.map((channel, index) => Math.round(mix(channel, second[index], progress))) as RGB;
const css = (color: RGB) => `rgb(${color.join(" ")})`;
const palettes = Array.from({ length: 101 }, (_, index) => {
  const paper = blend(cream, workOrange, index / 100);
  const light = luminance(paper);
  const ink: RGB = light > .285 ? [41, 40, 36] : light > .179 ? [0, 0, 0] : light > .14 ? [255, 255, 255] : cream;
  let muted = blend(ink, paper, .25);
  for (let amount = .2; contrast(muted, paper) < 4.5 && amount >= 0; amount -= .05) muted = blend(ink, paper, amount);
  const accent: RGB = light > .4 ? [164, 49, 40] : light > .179 ? [83, 17, 10] : light > .07 ? [255, 204, 192] : [230, 133, 113];
  return { paper: css(paper), ink: css(ink), muted: css(muted), accent: css(accent), surface: css(blend(paper, ink, .04)), hairline: `rgba(${ink.join(",")},.18)`, accentRGB: accent, bodyContrast: contrast(ink, paper), mutedContrast: contrast(muted, paper) };
});

export class Atmosphere {
  readonly accent = new THREE.Color(0xa43128);
  private amount = 0;
  private index = -1;
  constructor(private root: HTMLElement, private field: HTMLElement | null) {}
  update(frame: MotionFrame, about: CachedRect, work: CachedRect, personal: CachedRect) {
    if (frame.reduced) { this.reset(); return false; }
    const workAmount = smooth(work.top - frame.height * .5, work.top + frame.height * .2, frame.scroll) * (1 - smooth(personal.top - frame.height * .65, personal.top + frame.height * .15, frame.scroll));
    const aboutAmount = smooth(about.top - frame.height * .7, about.top - frame.height * .15, frame.scroll) * (1 - smooth(work.top - frame.height * .6, work.top, frame.scroll)) * .07;
    const target = Math.max(workAmount, aboutAmount);
    this.amount = damp(this.amount, target, target < this.amount ? 12 : 7, frame.delta);
    const index = Math.round(clamp(this.amount) * 100);
    if (index !== this.index) {
      this.index = index;
      const palette = palettes[index];
      this.root.style.setProperty("--paper", palette.paper);
      this.root.style.setProperty("--ink", palette.ink);
      this.root.style.setProperty("--muted", palette.muted);
      this.root.style.setProperty("--accent", palette.accent);
      this.root.style.setProperty("--surface", palette.surface);
      this.root.style.setProperty("--hairline", palette.hairline);
      this.accent.setRGB(palette.accentRGB[0] / 255, palette.accentRGB[1] / 255, palette.accentRGB[2] / 255, THREE.SRGBColorSpace);
      this.root.dataset.atmosphere = String(index);
      this.root.dataset.bodyContrast = palette.bodyContrast.toFixed(2);
      this.root.dataset.mutedContrast = palette.mutedContrast.toFixed(2);
    }
    return Math.abs(this.amount - target) > .002;
  }
  sweep(mesh: THREE.Mesh, active: boolean, mobile: boolean) {
    if (!this.field) return;
    const envelope = active ? Number(mesh.material instanceof THREE.ShaderMaterial ? mesh.material.uniforms.uSeam.value : 0) : 0;
    this.field.style.opacity = (envelope * (mobile ? .13 : .2)).toFixed(3);
    if (active) {
      this.field.style.width = `${(mesh.scale.x * 1.8).toFixed(1)}px`;
      this.field.style.height = `${(3 + mesh.scale.y * envelope * .6).toFixed(1)}px`;
      this.field.style.transform = `translate3d(${mesh.position.x.toFixed(1)}px,${(-mesh.position.y).toFixed(1)}px,0) translate(-50%,-50%) rotate(${(mesh.rotation.y * 140).toFixed(1)}deg)`;
    }
  }
  reset() {
    if (this.index === -1 && this.amount === 0) return;
    for (const property of ["--paper", "--ink", "--muted", "--accent", "--surface", "--hairline"]) this.root.style.removeProperty(property);
    if (this.field) this.field.style.opacity = "0";
    delete this.root.dataset.atmosphere; delete this.root.dataset.bodyContrast; delete this.root.dataset.mutedContrast;
    this.amount = 0; this.index = -1; this.accent.setHex(0xa43128);
  }
}
