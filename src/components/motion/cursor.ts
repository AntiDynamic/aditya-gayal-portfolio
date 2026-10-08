import type { MotionFrame } from "../webgl/bridge";
import { damp } from "./math";

export class EditorialCursor {
  private mode = "";
  private press = 0;
  constructor(private element: HTMLElement | null) {}
  pointer(event: PointerEvent) {
    const target = event.target instanceof Element ? event.target : null;
    this.mode = target?.closest("[data-project] a:has([data-media])") ? "view" : target?.closest("a,button") ? "link" : "";
  }
  down = () => { this.press = 1; };
  update(frame: MotionFrame) {
    if (!this.element) return false;
    const visible = frame.inside && !frame.mobile && !frame.reduced && !frame.monitor;
    this.element.style.opacity = visible ? "1" : "0";
    this.press = damp(this.press, 0, 18, frame.delta);
    this.element.style.transform = `translate3d(${frame.pointerX.toFixed(2)}px,${frame.pointerY.toFixed(2)}px,0) scale(${(1 - this.press * .18).toFixed(3)})`;
    this.element.dataset.mode = this.mode;
    return this.press > .002;
  }
  dispose() { if (this.element) { this.element.style.opacity = "0"; this.element.style.removeProperty("transform"); } }
}
