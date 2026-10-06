import { getEntranceComposition, type EntrancePiece } from "./entrance-manifest";

export type Point = [number, number];
export type BreakPhase = "pristine" | "stress" | "hairline" | "fractured" | "detached";
export type Impact = {
  entity: "enamel-corner";
  normalized: Point;
  world: [number, number, number];
  normal: [number, number, number];
  direction: [number, number, number];
  force: number;
  charge: number;
  approachVelocity: number;
  material: "enamel";
  previousDamage: number;
  timestamp: number;
  joint: "rubber-restraint";
};
export type BreakSnapshot = {
  damage: number; phase: BreakPhase; variant: number; charging: boolean;
  impact: Impact | null; reset: number; note: string;
};

export function inPolygon(x: number, y: number, points: Point[]) {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [ax, ay] = points[i], [bx, by] = points[j];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) hit = !hit;
  }
  return hit;
}

/** One complementary cut: no overlapping panels, texture decal, or fracture library. */
export function getBreakAssembly(mobile: boolean) {
  const original = getEntranceComposition(mobile).pieces.find(p => p.id === "raised-flap")!;
  const cut: Point[] = mobile
    ? [[310,523],[342,483],[329,450],[357,417],[331,390],[349,355],[320,334],[324,307],[288,292],[267,302]]
    : [[1003,655],[1092,580],[1080,510],[1046,480],[1070,437],[1022,404],[1045,362],[958,348],[916,364],[876,370]];
  const left: Point[] = mobile
    ? [[267,302],[300,326],[306,395],[302,462],[310,523]]
    : [[876,370],[958,400],[983,478],[977,558],[1003,655]];
  const first = original.points.findIndex(([x,y]) => x === cut[0][0] && y === cut[0][1]);
  const last = original.points.findIndex(([x,y]) => x === cut.at(-1)![0] && y === cut.at(-1)![1]);
  const body: EntrancePiece = { ...original, points: [...original.points.slice(0, first), ...cut, ...original.points.slice(last + 1)] };
  const fragment: EntrancePiece = { ...original, id: "enamel-corner", points: [...left, ...cut.slice(1, -1)] };
  const focus: Point = mobile ? [260,325] : [868,409];
  const pivot: Point = mobile ? [305,392] : [990,482];
  const hit: Point = mobile ? [320,375] : [1020,450];
  const branches: Point[][] = mobile
    ? [[[320,334],[313,351],[320,367],[306,395]],[[349,355],[334,366],[339,381],[331,390]],[[329,450],[313,436],[317,418],[305,403]],[[342,483],[324,476],[315,462],[302,462]]]
    : [[[1022,404],[1001,422],[1011,449],[983,478]],[[1045,362],[1016,377],[1020,393],[1000,413]],[[1080,510],[1044,526],[1028,549],[977,558]],[[1092,580],[1051,576],[1038,600],[1010,615]]];
  return { body, fragment, cut, branches, focus, pivot, hit };
}

const phases: BreakPhase[] = ["pristine", "stress", "hairline", "fractured", "detached"];
const initial = (): BreakSnapshot => ({ damage: 0, phase: "pristine", variant: 0, charging: false, impact: null, reset: 0, note: "" });

/** Application transitions are immutable snapshots; charge timing is imperative. */
export class EntranceBreakStore {
  private snapshot = initial();
  private listeners = new Set<() => void>();
  private pressedAt = 0;
  private contact: { point: Point; mobile: boolean; speed: number } | null = null;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => this.snapshot;
  private publish(next: BreakSnapshot) { this.snapshot = next; this.listeners.forEach(listener => listener()); }
  charge = (at = performance.now()) => this.snapshot.charging ? Math.max(0,Math.min(1, (at - this.pressedAt) / 500)) : 0;
  begin(point: Point, mobile: boolean, speed = 0, at = performance.now()) {
    const assembly = getBreakAssembly(mobile);
    const atJoint = Math.hypot(point[0] - assembly.focus[0], point[1] - assembly.focus[1]) < (mobile ? 32 : 45);
    if (!inPolygon(...point, assembly.fragment.points) && !atJoint) return false;
    if (this.snapshot.phase === "detached") {
      this.publish({ ...this.snapshot, note: "That part is already open." }); return false;
    }
    this.pressedAt = at; this.contact = { point, mobile, speed };
    this.publish({ ...this.snapshot, charging: true }); return true;
  }
  cancel = () => { this.contact = null; if (this.snapshot.charging) this.publish({ ...this.snapshot, charging: false }); };
  release = (at = performance.now()) => {
    if (!this.contact || !this.snapshot.charging) return;
    const { point, mobile, speed } = this.contact;
    const charge = this.charge(at);
    const composition = getEntranceComposition(mobile);
    const force = charge >= .8 ? 2 : 1;
    const damage = Math.min(4, this.snapshot.damage + force);
    const branches = getBreakAssembly(mobile).branches;
    const distance = (index:number) => Math.min(...branches[index].map(([x,y]) => Math.hypot(point[0]-x,point[1]-y)));
    const variant = this.snapshot.damage ? this.snapshot.variant : branches.reduce((best,_,index) => distance(index) < distance(best) ? index : best,0);
    const impact: Impact = { entity: "enamel-corner", normalized: [point[0]/composition.width, point[1]/composition.height], world: [(point[0]-composition.width/2)/100,(composition.height/2-point[1])/100,.47], normal:[0,0,1], direction:[.15,-.12,-1], force, charge, approachVelocity:speed, material:"enamel", previousDamage:this.snapshot.damage, timestamp:performance.now(), joint:"rubber-restraint" };
    this.contact = null;
    this.publish({ ...this.snapshot, damage, phase: phases[damage], variant, charging:false, impact, note:damage === 4 ? "Yep. That was structural." : "" });
  };
  reset = () => { this.contact = null; this.publish({ ...initial(), reset:this.snapshot.reset + 1 }); };
}

export const BREAK_DESCRIPTIONS: Record<BreakPhase,string> = {
  pristine: "Touch the seam. See what gives.",
  stress: "A little pressure. A different question.",
  hairline: "The first answer is rarely the whole answer.",
  fractured: "Now the structure is showing.",
  detached: "Underneath: wrong turns, better questions, another attempt.",
};
