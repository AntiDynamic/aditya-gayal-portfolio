/** Authored silhouettes, in the same editorial coordinates as the SVG fallback. */
export type EntranceMaterial = "paper" | "enamel" | "aluminum" | "rubber" | "acrylic";
export type EntrancePiece = {
  id: string;
  material: EntranceMaterial;
  points: [number, number][];
  depth: number;
  z: number;
  color: string;
  role: "primary" | "support";
};
export type EntranceComposition = {
  width: number;
  height: number;
  pieces: EntrancePiece[];
  titleLines: { text: string; x: number; y: number; size: number }[];
};

export function getEntranceSeam(mobile: boolean): [number, number][] {
  return mobile
    ? [[259,112],[279,120],[265,298],[299,327],[307,391],[274,378],[245,336],[173,334],[-30,327],[-30,311],[244,311]]
    : [[887,94],[921,108],[873,371],[961,401],[987,478],[944,472],[847,431],[682,436],[-105,463],[-105,442],[849,405]];
}

/** Construction planes, not decorative stripes: a lip, wall and recessed floor. */
export function getEntranceInterior(mobile: boolean) {
  const seam = getEntranceSeam(mobile);
  const focus: [number, number] = mobile ? [270, 335] : [897, 424];
  const opening: [number, number][] = mobile
    ? [[263,324],[277,330],[292,352],[297,377],[278,359],[263,335]]
    : [[872,399],[886,401],[945,423],[960,458],[941,448],[877,421]];
  const center: [number, number] = mobile ? [280, 348] : [919, 426];
  return [
    { id: "lip", points: seam, opening, color: "#234ed0", z: 18, depth: 8 },
    { id: "wall", points: seam.map(([x, y]): [number, number] => [x + 5, y + 8]), opening: opening.map(([x, y]): [number, number] => [center[0] + (x - center[0]) * .82, center[1] + (y - center[1]) * .82]), color: "#173fb8", z: -2, depth: 9 },
    { id: "floor", points: seam.map(([x, y]): [number, number] => [focus[0] + (x - focus[0]) * .99 + 8, focus[1] + (y - focus[1]) * .99 + 13]), opening: undefined, color: "#0c2469", z: -27, depth: 4 },
  ];
}

function piece(id: string, material: EntranceMaterial, points: [number, number][], depth: number, z: number, color: string, role: EntrancePiece["role"] = "support"): EntrancePiece {
  return { id, material, points, depth, z, color, role };
}

export function getEntranceComposition(mobile: boolean): EntranceComposition {
  if (mobile) return {
    width: 390, height: 844,
    titleLines: [
      { text: "STRANGE", x: 23, y: 220, size: 53 },
      { text: "QUESTIONS.", x: 23, y: 284, size: 53 },
      { text: "USEFUL", x: 23, y: 391, size: 53 },
      { text: "SYSTEMS.", x: 23, y: 456, size: 53 },
    ],
    pieces: [
      piece("sweep", "paper", [[-35,132],[20,115],[102,99],[211,94],[263,112],[257,174],[249,252],[243,304],[166,316],[64,323],[-35,317]], 3, 43, "#f4eddf", "primary"),
      piece("raised-flap", "enamel", [[279,118],[345,79],[406,84],[452,124],[449,433],[427,493],[397,523],[353,537],[310,523],[302,462],[306,395],[300,326],[267,302],[270,232]], 29, 8, "#f5f4ef", "primary"),
      piece("lower-shell", "paper", [[-35,335],[75,337],[166,334],[239,328],[264,359],[294,396],[307,452],[317,496],[247,531],[190,551],[107,557],[38,547],[-35,527]], 3, 38, "#f4eddf", "primary"),
      piece("fold-under", "paper", [[-5,534],[83,565],[167,568],[222,549],[241,553],[204,584],[126,594],[51,581],[8,560]], 2, 22, "#e6dccb"),
      piece("rubber-join", "rubber", [[240,315],[258,308],[274,326],[283,354],[270,354],[255,334]], 8, 23, "#292a27"),
      piece("metal-lip", "aluminum", [[241,310],[260,305],[275,319],[272,326],[258,321],[246,322]], 3, 47, "#b7b9b3"),
      piece("cyan-insert", "acrylic", [[285,348],[294,353],[298,385],[289,379]], 2, -8, "#20bed0"),
    ],
  };
  return {
    width: 1440, height: 1000,
    titleLines: [
      { text: "STRANGE QUESTIONS.", x: 88, y: 350, size: 118 },
      { text: "USEFUL SYSTEMS.", x: 88, y: 540, size: 118 },
    ],
    pieces: [
      piece("sweep", "paper", [[-105,226],[-20,199],[158,161],[373,122],[591,91],[784,83],[895,105],[882,181],[868,267],[850,342],[843,400],[666,417],[451,431],[224,448],[45,456],[-105,443]], 4, 52, "#f4eddf", "primary"),
      piece("raised-flap", "enamel", [[918,111],[1088,46],[1271,39],[1431,95],[1538,190],[1562,517],[1490,642],[1361,704],[1228,712],[1116,692],[1003,655],[977,558],[983,478],[958,400],[876,370],[895,252]], 40, 7, "#f5f4ef", "primary"),
      piece("lower-shell", "paper", [[-105,477],[86,480],[303,462],[520,446],[686,443],[843,431],[902,461],[976,501],[983,583],[1004,643],[895,699],[775,733],[604,751],[406,755],[232,730],[79,684],[-105,625]], 4, 45, "#f4eddf", "primary"),
      piece("fold-under", "paper", [[47,677],[238,739],[401,767],[588,770],[769,746],[822,742],[758,783],[591,813],[392,808],[211,773],[78,718]], 2, 24, "#e6dccb"),
      piece("rubber-join", "rubber", [[836,408],[868,388],[902,417],[922,451],[898,455],[872,427]], 10, 28, "#292a27"),
      piece("metal-lip", "aluminum", [[839,401],[864,393],[902,414],[898,425],[874,415],[845,416]], 4, 59, "#b7b9b3"),
      piece("cyan-insert", "acrylic", [[953,438],[963,448],[968,476],[957,470]], 3, -8, "#20bed0"),
    ],
  };
}
