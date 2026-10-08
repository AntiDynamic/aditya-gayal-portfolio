import Lenis from "lenis";
import { RectSampler, type CachedRect } from "./rects";
import { clamp, damp, mix, smooth } from "./math";
import { WebGLBridge, type MotionFrame } from "../webgl/bridge";
import { Atmosphere } from "./atmosphere";
import { EditorialCursor } from "./cursor";

type Reveal = { element: HTMLElement; value: number; hoverOffset: number; lines: HTMLElement[]; entered: boolean };

export class MotionDirector {
  private bridge?: WebGLBridge;
  private sampler: RectSampler;
  private lenis?: Lenis;
  private media: HTMLElement[];
  private chapters: HTMLElement[];
  private anchors: HTMLElement[];
  private letters: HTMLElement[];
  private reveals: Reveal[];
  private occlusions: HTMLElement[];
  private reduced = matchMedia("(prefers-reduced-motion: reduce)");
  private fullMotion = new URLSearchParams(location.search).get("motion") === "full";
  private get reducedMotion() { return this.reduced.matches && !this.fullMotion; }
  private raf = 0;
  private disposed = false;
  private last = 0;
  private elapsed = 0;
  private scrollTime = 0;
  private previousScroll = scrollY;
  private reportTime = 0;
  private slowFrames = 0;
  private quality = innerWidth < 700 ? 1.25 : 1.5;
  private rawX = innerWidth * .5;
  private rawY = innerHeight * .5;
  private pointerVelocityX = 0;
  private pointerVelocityY = 0;
  private frame: MotionFrame = { scroll: scrollY, width: innerWidth, height: innerHeight, delta: .016, velocity: 0, pointerX: innerWidth * .5, pointerY: innerHeight * .5, inside: false, reduced: false, mobile: innerWidth < 700, monitor: false };
  private rulePosition = { left: 0, top: 0, width: 0, height: 0 };
  private ruleAngle = 0;
  private initialized = false;
  private frozen = false;
  private hadMonitor = false;
  private atmosphere: Atmosphere;
  private cursor: EditorialCursor;
  private surfaceObserver: MutationObserver;
  private getRect = (element: HTMLElement) => this.sampler.get(element);
  constructor(private root: HTMLElement, private host: HTMLElement) {
    this.root.dataset.reduced = String(this.reducedMotion);
    this.cursor = new EditorialCursor(root.querySelector("[data-editorial-cursor]"));
    this.atmosphere = new Atmosphere(root, root.querySelector<HTMLElement>("[data-background-field]"));
    this.media = Array.from(root.querySelectorAll<HTMLElement>("[data-media]"));
    this.chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"));
    this.anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-red-anchor]"));
    this.letters = Array.from(root.querySelectorAll<HTMLElement>("[data-letter]"));
    this.reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]")).map(element => ({ element, value: 0, hoverOffset: 0, lines: Array.from(element.querySelectorAll<HTMLElement>("[data-line-content]")), entered: false }));
    this.occlusions = Array.from(root.querySelectorAll<HTMLElement>("[data-occlude]"));
    this.sampler = new RectSampler([...this.media, ...this.chapters, ...this.anchors, ...this.occlusions, ...this.reveals.map(reveal => reveal.element)], this.wake);
    addEventListener("scroll", this.wake, { passive: true });
    addEventListener("pointermove", this.pointer, { passive: true });
    addEventListener("resize", this.resize);
    addEventListener("blur", this.pointerExit);
    root.addEventListener("click", this.navigate);
    root.addEventListener("pointerdown", this.press);
    document.documentElement.addEventListener("pointerleave", this.pointerExit);
    document.addEventListener("visibilitychange", this.visibility);
    this.reduced.addEventListener("change", this.preference);
    addEventListener("prologue-stage", this.surfaceChanged);
    addEventListener("pageshow", this.surfaceChanged);
    this.surfaceObserver = new MutationObserver(this.surfaceChanged);
    if (root.parentElement) this.surfaceObserver.observe(root.parentElement, { attributes: true, attributeFilter: ["data-monitor-surface"] });
    void document.fonts.ready.then(async () => {
      await Promise.race([
        Promise.all(this.media.map(element => element.querySelector<HTMLImageElement>("img")!.decode().catch(() => {}))),
        new Promise(resolve => setTimeout(resolve, 4500)),
      ]);
      if (this.disposed) return;
      try {
        this.bridge = new WebGLBridge(host, this.media, this.wake, this.fallback, this.restore);
        if (!this.reducedMotion) await this.bridge.renderer.compileAsync(this.bridge.scene, this.bridge.camera);
        if (this.disposed) return;
        this.root.dataset.webgl = this.frozen ? "failed" : "ready";
      }
      catch { this.root.dataset.webgl = "failed"; }
      this.root.dataset.ready = "true";
      this.resize();
    });
  }
  private surfaceChanged = () => {
    if (this.disposed) return;
    this.sampler.invalidate();
    this.wake();
  };
  private createScroll() {
    if (this.lenis || this.reducedMotion || this.frame.monitor) return;
    this.lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: .085 });
    this.lenis.on("scroll", this.wake);
    this.lenis.on("virtual-scroll", this.wake);
  }
  private navigate = (event: MouseEvent) => {
    if (!this.lenis || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || link.target) return;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", link.hash);
    this.lenis.scrollTo(target, { offset: -25, duration: 1.1, onComplete: () => target.focus({ preventScroll: true }) });
    this.wake();
  };
  private pointer = (event: PointerEvent) => {
    if (event.pointerType === "touch" || this.reducedMotion) return;
    this.rawX = event.clientX; this.rawY = event.clientY; this.frame.inside = true; this.cursor.pointer(event); this.wake();
  };
  private press = () => { this.cursor.down(); this.wake(); };
  private pointerExit = () => { this.frame.inside = false; this.rawX = this.frame.width * .5; this.rawY = this.frame.height * .5; this.wake(); };
  private preference = () => { this.root.dataset.reduced = String(this.reducedMotion); this.lenis?.destroy(); this.lenis = undefined; this.sampler.invalidate(); this.resize(); };
  private visibility = () => {
    if (document.hidden) { cancelAnimationFrame(this.raf); this.raf = 0; this.last = 0; this.lenis?.stop(); this.pointerExit(); }
    else { this.lenis?.start(); this.previousScroll = scrollY; this.wake(); }
  };
  private fallback = () => {
    this.bridge?.restoreNative();
    this.root.dataset.webgl = "lost";
    delete this.root.dataset.motion;
    delete this.root.dataset.mediaFlow;
    this.atmosphere.reset();
    this.cursor.dispose();
    for (const element of this.occlusions) { element.style.removeProperty("transform"); element.style.removeProperty("clip-path"); delete element.dataset.occlusionOffset; }
    for (const letter of this.letters) { letter.style.removeProperty("transform"); letter.style.removeProperty("opacity"); letter.parentElement!.style.removeProperty("clip-path"); }
    for (const reveal of this.reveals) {
      reveal.element.style.removeProperty("--reveal"); reveal.element.style.removeProperty("--reveal-y"); reveal.element.style.removeProperty("--hover-x");
      for (const line of reveal.lines) line.style.removeProperty("--line-y");
    }
    this.frozen = true;
    this.lenis?.destroy(); this.lenis = undefined;
    cancelAnimationFrame(this.raf); this.raf = 0;
  };
  private restore = () => { this.frozen = false; this.bridge?.renderer.domElement.style.removeProperty("visibility"); this.root.dataset.webgl = "ready"; this.root.dataset.motion = "true"; this.resize(); };
  private resize = () => {
    if (this.disposed) return;
    this.frame.width = this.host.clientWidth || innerWidth;
    this.frame.height = this.host.clientHeight || innerHeight;
    this.frame.mobile = innerWidth < 700;
    this.quality = Math.min(this.quality, this.frame.mobile ? 1.25 : 1.5);
    this.bridge?.resize(this.frame.width, this.frame.height, this.quality);
    this.sampler.invalidate();
    this.lenis?.resize();
    this.wake();
  };
  private updateLetters() {
    const hero = this.sampler.get(this.chapters[0]);
    const progress = smooth(0, hero.height * .95, this.frame.scroll);
    const spatial = smooth(.12, .48, progress) * (1 - smooth(.65, .9, progress));
    for (let index = 0; index < this.letters.length; index++) {
      const letter = this.letters[index];
      const entrance = this.frame.reduced ? 1 : smooth(index * .025, .8 + index * .025, this.elapsed);
      const row = Number(letter.dataset.index) >= 6 ? 1 : -1;
      const depth = this.frame.reduced ? 0 : spatial * (row === 1 ? 88 : 48) * (this.frame.mobile ? .3 : 1);
      const cursor = this.frame.reduced ? 0 : (this.frame.pointerX / this.frame.width - .5) * spatial * 8;
      const horizontal = this.frame.reduced ? 0 : row * spatial * 16 + cursor;
      const vertical = this.frame.reduced ? 0 : (1 - entrance) * hero.height * .07 - spatial * 14;
      letter.style.transform = `translate3d(${horizontal.toFixed(2)}px,${vertical.toFixed(2)}px,${depth.toFixed(2)}px) rotateY(${(row * spatial * (this.frame.reduced ? 0 : 4)).toFixed(2)}deg)`;
      letter.style.opacity = entrance.toFixed(3);
      letter.parentElement!.style.clipPath = entrance < .999 ? `inset(0 0 ${((1 - entrance) * 100).toFixed(2)}% 0)` : "none";
    }
    this.root.dataset.heroDepth = this.frame.reduced ? "0" : (spatial * 88).toFixed(1);
  }
  private updateOcclusion() {
    for (const element of this.occlusions) {
      const layer = this.bridge?.layers.find(layer => layer.element.dataset.media === element.dataset.occlude);
      const rect = this.sampler.get(element);
      const active = layer && layer.mesh.visible && !layer.element.dataset.flow && !this.frame.reduced && !this.frame.mobile;
      const travel = active ? Math.min(120, layer.depth * 4) : 0;
      element.style.transform = `translate3d(${-travel.toFixed(2)}px,0,0)`;
      const top = rect.top - this.frame.scroll;
      const overlaps = active && top < layer.bounds.bottom && top + rect.height > layer.bounds.top;
      const cut = overlaps ? Math.max(0, layer.bounds.right - rect.left + travel) : 0;
      element.style.clipPath = cut ? `inset(0 0 0 ${cut.toFixed(2)}px)` : "none";
      element.dataset.occlusionOffset = travel.toFixed(2);
    }
  }
  private updateReveals() {
    let settling = false;
    for (const reveal of this.reveals) {
      const rect = this.sampler.get(reveal.element);
      const top = rect.top - this.frame.scroll;
      if (top > this.frame.height + 80) reveal.entered = false;
      if (top < this.frame.height * .92) reveal.entered = true;
      const target = this.frame.reduced || reveal.entered ? 1 : 0;
      reveal.value = this.frame.reduced ? 1 : damp(reveal.value, target, 6.5, this.frame.delta);
      if (Math.abs(reveal.value - target) > .002) settling = true;
      reveal.element.style.setProperty("--reveal", reveal.value.toFixed(3));
      reveal.element.style.setProperty("--reveal-y", `${((1 - reveal.value) * (reveal.lines.length ? 12 : 38)).toFixed(2)}px`);
      for (let index = 0; index < reveal.lines.length; index++) {
        const delay = Math.min(index * .13, .4);
        const progress = this.frame.reduced ? 1 : smooth(delay, 1, reveal.value);
        reveal.lines[index].style.setProperty("--line-y", `${((1 - progress) * 110).toFixed(2)}%`);
      }
      if (reveal.element.hasAttribute("data-experiment")) {
        const inside = this.frame.inside && !this.frame.reduced && !this.frame.mobile && this.frame.pointerX > rect.left && this.frame.pointerX < rect.left + rect.width && this.frame.pointerY > top && this.frame.pointerY < top + rect.height;
        const targetOffset = inside ? (this.frame.pointerX - rect.left - rect.width * .5) / rect.width * 12 : 0;
        reveal.hoverOffset = damp(reveal.hoverOffset, targetOffset, 12, this.frame.delta);
        reveal.element.style.setProperty("--hover-x", `${reveal.hoverOffset.toFixed(2)}px`);
        settling = Math.abs(reveal.hoverOffset - targetOffset) > .01 || settling;
      }
    }
    return settling;
  }
  private updateRule() {
    if (!this.bridge) return false;
    if (this.frame.reduced) { this.bridge.rule.visible = false; return false; }
    const anchors = this.anchors;
    let first: CachedRect = this.sampler.get(anchors[0]);
    let second = first;
    let progress = 0;
    for (let index = 1; index < anchors.length; index++) {
      const candidate = this.sampler.get(anchors[index]);
      const final = index === anchors.length - 1;
      const start = Math.max(0, candidate.top - this.frame.height * (final ? 1.5 : .85));
      const end = Math.max(start + 1, candidate.top - this.frame.height * (final ? .9 : .15));
      if (this.frame.scroll >= start) {
        first = this.sampler.get(anchors[index - 1]); second = candidate;
        progress = smooth(start, end, this.frame.scroll);
      }
    }
    const targetLeft = mix(first.left + first.width * .5, second.left + second.width * .5, progress);
    const targetTop = mix(first.top + first.height * .5, second.top + second.height * .5, progress) - this.frame.scroll;
    const targetWidth = mix(Math.max(first.width, first.height), Math.max(second.width, second.height), progress);
    const targetHeight = 3;
    const targetAngle = mix(first.width >= first.height ? 0 : -Math.PI * .5, second.width >= second.height ? 0 : -Math.PI * .5, progress);
    const response = this.frame.reduced ? 1000 : 12;
    const position = this.rulePosition;
    if (!position.width) { position.left = targetLeft; position.top = targetTop; position.width = targetWidth; position.height = targetHeight; }
    position.left = damp(position.left, targetLeft, response, this.frame.delta);
    position.top = targetTop;
    position.width = damp(position.width, targetWidth, response, this.frame.delta);
    position.height = damp(position.height, targetHeight, response, this.frame.delta);
    this.ruleAngle = damp(this.ruleAngle, targetAngle, response, this.frame.delta);
    const rule = this.bridge.rule;
    rule.visible = !this.bridge.flow.mesh.visible && position.top < this.frame.height + position.height && position.top + position.height > -100;
    rule.position.set(position.left - this.frame.width * .5, this.frame.height * .5 - position.top, 0);
    rule.scale.set(Math.max(2, position.width), Math.max(2, position.height), 1);
    rule.rotation.z = this.ruleAngle;
    rule.material.opacity = smooth(0, 1.4, this.elapsed);
    return Math.abs(position.left - targetLeft) + Math.abs(position.width - targetWidth) + Math.abs(position.height - targetHeight) + Math.abs(this.ruleAngle - targetAngle) * 100 > .05;
  }
  private tick = (timestamp: number) => {
    this.raf = 0;
    if (this.disposed || document.hidden || this.frozen) { this.last = 0; return; }
    this.frame.monitor = Boolean(this.host.closest("[data-monitor-surface]"));
    if (this.frame.monitor) { this.hadMonitor = true; this.sampler.dirty = true; this.last = 0; return; }
    this.createScroll();
    this.frame.delta = Math.min(.04, this.last ? (timestamp - this.last) / 1000 : .016);
    this.last = timestamp;
    this.scrollTime += this.frame.delta * 1000;
    this.lenis?.raf(this.scrollTime);
    this.frame.scroll = scrollY;
    this.frame.reduced = this.reducedMotion;
    this.elapsed += this.frame.delta;
    const velocity = clamp(Math.abs(this.frame.scroll - this.previousScroll) / this.frame.delta / 2600);
    this.frame.velocity = damp(this.frame.velocity, velocity, velocity > this.frame.velocity ? 20 : 6, this.frame.delta);
    this.previousScroll = this.frame.scroll;
    this.pointerVelocityX += ((this.rawX - this.frame.pointerX) * 42 - this.pointerVelocityX * 13) * this.frame.delta;
    this.pointerVelocityY += ((this.rawY - this.frame.pointerY) * 42 - this.pointerVelocityY * 13) * this.frame.delta;
    this.frame.pointerX += this.pointerVelocityX * this.frame.delta;
    this.frame.pointerY += this.pointerVelocityY * this.frame.delta;
    this.sampler.sample(this.frame.scroll);
    if (!this.initialized) {
      this.initialized = true;
      this.elapsed = this.hadMonitor ? 2 : 1.2;
      this.root.dataset.motion = "true";
    }
    this.updateLetters();
    let settling = this.updateReveals();
    settling = this.cursor.update(this.frame) || settling;
    settling = this.atmosphere.update(this.frame, this.getRect(this.chapters[1]), this.getRect(this.chapters[2]), this.getRect(this.chapters[3])) || settling;
    if (this.bridge && this.root.dataset.webgl === "ready") {
      this.bridge.accent.copy(this.atmosphere.accent);
      this.bridge.rule.material.color.copy(this.atmosphere.accent);
      this.bridge.flow.reset();
      for (const layer of this.bridge.layers) settling = this.bridge.update(layer, this.sampler.get(layer.element), this.frame) || settling;
      this.bridge.flow.update(this.bridge.layers, this.getRect, this.frame, this.bridge.camera);
      this.root.dataset.mediaFlow = String(this.bridge.flow.mesh.visible);
      this.atmosphere.sweep(this.bridge.flow.mesh, this.bridge.flow.mesh.visible, this.frame.mobile);
      this.updateOcclusion();
      settling = this.updateRule() || settling;
      this.bridge.render();
    }
    this.root.dataset.scroll = this.frame.scroll.toFixed(2);
    if (timestamp - this.reportTime > 1000) {
      this.host.dataset.layoutReads = String(this.sampler.reads);
      this.host.dataset.resolution = `${this.bridge?.renderer.domElement.width || 0}x${this.bridge?.renderer.domElement.height || 0}`;
      this.host.dataset.quality = this.quality.toFixed(2);
      this.reportTime = timestamp;
    }
    if (this.frame.delta > .03) this.slowFrames++; else this.slowFrames = Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 75 && this.quality > .8) { this.quality = Math.max(.8, this.quality - .15); this.slowFrames = 0; this.bridge?.resize(this.frame.width, this.frame.height, this.quality); }
    const pointerSettling = Math.abs(this.frame.pointerX - this.rawX) + Math.abs(this.frame.pointerY - this.rawY) > .1;
    if (this.elapsed < 2 || settling || this.frame.velocity > .001 || pointerSettling || this.lenis?.isScrolling) this.wake();
    else { this.last = 0; this.host.dataset.idle = "true"; }
  };
  private wake = () => {
    if (this.disposed || document.hidden || this.frozen || this.raf) return;
    delete this.host.dataset.idle;
    this.raf = requestAnimationFrame(this.tick);
  };
  dispose() {
    this.disposed = true;
    this.atmosphere.reset();
    this.cursor.dispose();
    cancelAnimationFrame(this.raf); this.lenis?.destroy(); this.bridge?.dispose(); this.sampler.dispose();
    removeEventListener("scroll", this.wake); removeEventListener("pointermove", this.pointer); removeEventListener("resize", this.resize); removeEventListener("blur", this.pointerExit);
    this.root.removeEventListener("click", this.navigate);
    this.root.removeEventListener("pointerdown", this.press);
    document.documentElement.removeEventListener("pointerleave", this.pointerExit);
    document.removeEventListener("visibilitychange", this.visibility); this.reduced.removeEventListener("change", this.preference);
    removeEventListener("prologue-stage", this.surfaceChanged); removeEventListener("pageshow", this.surfaceChanged); this.surfaceObserver.disconnect();
    delete this.root.dataset.motion;
    delete this.root.dataset.reduced;
    delete this.root.dataset.mediaFlow;
    for (const letter of this.letters) { letter.style.removeProperty("transform"); letter.style.removeProperty("opacity"); letter.parentElement!.style.removeProperty("clip-path"); }
    for (const reveal of this.reveals) { reveal.element.style.removeProperty("--reveal"); reveal.element.style.removeProperty("--reveal-y"); reveal.element.style.removeProperty("--hover-x"); for (const line of reveal.lines) line.style.removeProperty("--line-y"); }
    for (const element of this.occlusions) { element.style.removeProperty("transform"); element.style.removeProperty("clip-path"); delete element.dataset.occlusionOffset; }
  }
}
