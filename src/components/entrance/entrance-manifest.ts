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
    ? [[242,90],[255,90],[222,291],[406,304],[405,322],[-30,320],[-30,303],[207,288]]
    : [[825,122],[844,125],[771,386],[1448,381],[1453,416],[749,406],[-104,462],[-105,433],[743,381]];
}

function piece(id: string, material: EntranceMaterial, points: [number, number][], depth: number, z: number, color: string, role: EntrancePiece["role"] = "support"): EntrancePiece {
  return { id, material, points, depth, z, color, role };
}

export function getEntranceComposition(mobile: boolean): EntranceComposition {
  if (mobile) return {
    width: 390, height: 844,
    titleLines: [
      { text: "STRANGE", x: 23, y: 211, size: 53 },
      { text: "QUESTIONS.", x: 23, y: 270, size: 53 },
      { text: "USEFUL", x: 23, y: 353, size: 53 },
      { text: "SYSTEMS.", x: 23, y: 412, size: 53 },
    ],
    pieces: [
      piece("sweep", "paper", [[-35,132],[16,114],[100,102],[216,92],[241,103],[229,165],[216,237],[206,285],[129,298],[45,306],[-35,302]], 11, 12, "#f4eddf", "primary"),
      piece("raised-flap", "enamel", [[250,89],[321,65],[375,74],[421,109],[419,294],[354,291],[300,289],[215,285],[226,238],[242,162]], 17, 19, "#fbf7ef", "primary"),
      piece("lower-shell", "enamel", [[-28,316],[85,313],[194,300],[283,302],[411,318],[427,427],[395,459],[330,482],[260,483],[219,474],[182,460],[141,454],[72,463],[9,450],[-26,420]], 18, 11, "#efe7d8", "primary"),
      piece("fold-under", "paper", [[16,469],[70,482],[145,472],[209,489],[205,511],[127,515],[63,504],[24,491]], 8, 5, "#ddd1bf"),
      piece("rubber-join", "rubber", [[211,276],[245,271],[252,287],[219,296]], 9, 5, "#292a27"),
      piece("metal-lip", "aluminum", [[209,282],[231,274],[251,279],[248,288],[226,296],[211,291]], 5, 42, "#c6c7c0"),
      piece("cyan-insert", "acrylic", [[317,463],[364,446],[376,454],[367,490],[324,505],[313,492]], 13, 28, "#20bed0"),
      piece("small-cut", "paper", [[-13,420],[45,427],[59,452],[30,469],[-12,457]], 5, 6, "#e5dccd"),
      piece("heel", "rubber", [[253,469],[290,477],[278,494],[248,489]], 7, 6, "#333530"),
    ],
  };
  return {
    width: 1440, height: 1000,
    titleLines: [
      { text: "STRANGE QUESTIONS.", x: 88, y: 350, size: 112 },
      { text: "USEFUL SYSTEMS.", x: 88, y: 490, size: 112 },
    ],
    pieces: [
      piece("sweep", "paper", [[-100,234],[-20,206],[137,173],[328,140],[571,113],[784,108],[827,128],[813,189],[790,267],[764,337],[745,383],[590,391],[419,407],[253,425],[82,441],[-105,433]], 18, 16, "#f4eddf", "primary"),
      piece("raised-flap", "enamel", [[840,126],[994,70],[1135,58],[1240,87],[1324,136],[1390,218],[1451,297],[1490,367],[1389,376],[1209,368],[1071,365],[902,378],[757,384],[777,334],[802,259],[824,187]], 28, 29, "#fbf7ef", "primary"),
      piece("lower-shell", "enamel", [[-102,454],[63,459],[276,438],[469,417],[651,409],[748,398],[877,394],[1072,382],[1274,388],[1451,408],[1489,506],[1455,579],[1373,624],[1260,649],[1136,650],[1024,632],[901,615],[785,621],[647,651],[493,687],[342,694],[228,679],[106,632],[-12,604],[-107,576]], 30, 16, "#eee6d7", "primary"),
      piece("fold-under", "paper", [[155,642],[262,697],[399,713],[534,698],[662,669],[694,690],[590,728],[440,751],[301,739],[211,707]], 13, 5, "#dbcfbd"),
      piece("rubber-join", "rubber", [[728,366],[794,353],[811,385],[756,408],[724,394]], 15, 6, "#292a27"),
      piece("metal-lip", "aluminum", [[721,381],[764,366],[807,374],[802,389],[761,404],[725,397]], 9, 65, "#c6c7c0"),
      piece("cyan-insert", "acrylic", [[1187,629],[1264,606],[1306,619],[1291,674],[1212,702],[1181,679]], 20, 43, "#20bed0"),
      piece("small-cut", "paper", [[-21,561],[81,557],[152,602],[122,651],[34,669],[-24,643]], 10, 8, "#e5dccd"),
      piece("heel", "rubber", [[935,602],[1001,611],[1015,636],[962,655],[927,641]], 14, 9, "#333530"),
    ],
  };
}
