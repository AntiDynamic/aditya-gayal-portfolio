export type Discovery = "notebook" | "diagram" | "computer" | "shelf" | "drawer";
export type Viewpoint = "desk" | "notebook" | "shelf" | "wall" | "computer";

export const discoveries: Record<Discovery, { label: string; transcript: string }> = {
  notebook: { label: "Notebook", transcript: "why is this behaving like that. tried the obvious fix. didn't work. this version is worse lol. maybe the problem is somewhere else. ask someone tomorrow. okay that actually helped. don't touch this part anymore. try the weird version. nope." },
  diagram: { label: "Route drawing", transcript: "A black route is crossed out at a turn. A blue correction in another handwriting: this? A small reply in black: yeah. Other scraps show earlier versions." },
  computer: { label: "Computer", transcript: "/home/aditya: notes, work, old, screenshots, misc. Some files are damaged. Recover work. Five folders: continuum, tracepilot, netranagar, video-editor, ai4browser. Open portfolio." },
  shelf: { label: "Shelf", transcript: "A small cream street model, layered timeline strips, three stacked window frames, and an editing control repaired with tape. One label says: worked technically." },
  drawer: { label: "Cable drawer", transcript: "A drawer labelled cables. Coiled adapters, two different plugs joined with an extension, and a note: worked yesterday." },
};

export const viewpointOrder: Viewpoint[] = ["desk", "notebook", "shelf", "wall", "computer"];
export const viewpointDiscovery: Partial<Record<Viewpoint, Discovery>> = { notebook: "notebook", shelf: "shelf", wall: "diagram", computer: "computer" };

export const ease = (value: number) => {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
};

export type Bounds = { left: number; right: number; back: number; front: number };
export const collisionBounds: Bounds[] = [
  { left: -1.91, right: 0.57, back: -2.56, front: -1.34 },
  { left: 2.17, right: 3.17, back: -2.20, front: -0.62 },
  { left: 2.30, right: 3.17, back: 0.93, front: 1.90 },
  { left: -0.70, right: -0.10, back: -1.11, front: -0.50 },
  { left: 0.70, right: 1.32, back: -1.27, front: -0.59 },
];

export function positionAllowed(horizontal: number, depth: number, radius = 0.24) {
  if (horizontal < -3.17 + radius || horizontal > 3.17 - radius || depth < -2.73 + radius || depth > 2.73 - radius) return false;
  return !collisionBounds.some(bounds => horizontal > bounds.left - radius && horizontal < bounds.right + radius && depth > bounds.back - radius && depth < bounds.front + radius);
}
