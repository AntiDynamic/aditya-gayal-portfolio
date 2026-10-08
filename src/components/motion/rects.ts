export type CachedRect = { element: HTMLElement; left: number; top: number; width: number; height: number };

export class RectSampler {
  readonly entries = new Map<HTMLElement, CachedRect>();
  reads = 0;
  dirty = true;
  private resizeObserver: ResizeObserver;
  constructor(elements: HTMLElement[], private wake: () => void) {
    for (const element of elements) this.entries.set(element, { element, left: 0, top: 0, width: 0, height: 0 });
    this.resizeObserver = new ResizeObserver(() => { this.dirty = true; this.wake(); });
    elements.forEach(element => this.resizeObserver.observe(element));
    this.resizeObserver.observe(document.body);
  }
  sample(scroll: number) {
    this.reads = 0;
    if (!this.dirty) return;
    for (const entry of this.entries.values()) {
      const bounds = entry.element.getBoundingClientRect();
      entry.left = bounds.left + (Number(entry.element.dataset.occlusionOffset) || 0);
      let translation = 0;
      let ancestor: HTMLElement | null = entry.element;
      while (ancestor) {
        if (ancestor.hasAttribute("data-reveal")) translation += parseFloat(ancestor.style.getPropertyValue("--reveal-y")) || 0;
        ancestor = ancestor.parentElement;
      }
      entry.top = bounds.top + scroll - translation;
      entry.width = bounds.width;
      entry.height = bounds.height;
      this.reads++;
    }
    this.dirty = false;
  }
  get(element: HTMLElement) { return this.entries.get(element)!; }
  invalidate() { this.dirty = true; this.wake(); }
  dispose() { this.resizeObserver.disconnect(); this.entries.clear(); }
}
