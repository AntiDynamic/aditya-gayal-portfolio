import { getEntranceComposition, getEntranceInterior } from "./entrance-manifest";
import styles from "./entrance.module.css";
import { getBreakAssembly, type BreakSnapshot } from "./entrance-break";

function SurfaceDrawing({ mobile, state }: { mobile: boolean; state: BreakSnapshot }) {
  const composition = getEntranceComposition(mobile);
  const assembly = getBreakAssembly(mobile);
  const pieces = state.damage === 0 ? composition.pieces : composition.pieces.flatMap(piece => piece.id === "raised-flap" ? [assembly.body, ...(state.phase === "detached" ? [] : [assembly.fragment])] : [piece]);
  const prefix = mobile ? "surface-mobile" : "surface-desktop";
  const polygonPath = (points: [number, number][]) => `M${points.map((point) => point.join(",")).join("L")}Z`;
  return (
    <svg viewBox={`0 0 ${composition.width} ${composition.height}`} preserveAspectRatio="xMidYMid meet" focusable="false">
      <defs>
        <filter id={`${prefix}-contact`} x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="5" dy="15" stdDeviation="10" floodColor="#29251e" floodOpacity=".2" /></filter>
        {pieces.map((piece) => <clipPath key={piece.id} id={`${prefix}-${piece.id}`}><polygon points={piece.points.map((point) => point.join(",")).join(" ")} /></clipPath>)}
      </defs>
      <rect width={composition.width} height={composition.height} fill="#f2ebdd" />
      {getEntranceInterior(mobile).toSorted((a, b) => a.z - b.z).map((layer) => <path key={layer.id} d={polygonPath(layer.points) + (layer.opening ? polygonPath(layer.opening) : "")} fillRule="evenodd" fill={layer.color} />)}
      <polygon points={assembly.fragment.points.map(point=>point.join(",")).join(" ")} fill="#123ba4" />
      <polygon points={assembly.fragment.points.map(([x,y])=>`${(mobile ? 322 : 1020)+(x-(mobile ? 322 : 1020))*.76},${(mobile ? 423 : 500)+(y-(mobile ? 423 : 500))*.76}`).join(" ")} fill="#081c54" />
      {pieces.toSorted((a, b) => a.z + a.depth - b.z - b.depth).map((piece) => (
        <g key={piece.id}>
          <polygon points={piece.points.map((point) => `${point[0] + 3},${point[1] + piece.depth * .35}`).join(" ")} fill={piece.material === "aluminum" ? "#7d7d79" : "#c7beb0"} />
          {piece.material === "paper" && <polygon points={piece.points.map((point) => `${point[0] + .4},${point[1] + 1.3}`).join(" ")} fill="#e2d6c3" />}
          <polygon points={piece.points.map((point) => point.join(",")).join(" ")} fill={piece.color} fillOpacity={piece.material === "acrylic" ? .38 : 1} filter={`url(#${prefix}-contact)`} />
          {piece.role === "primary" && <g clipPath={`url(#${prefix}-${piece.id})`} fill="#22211f" fontFamily="var(--font-display), Arial, sans-serif" fontWeight="800" letterSpacing="-.045em">
            {composition.titleLines.map((line, index) => <text key={index} x={line.x} y={line.y} fontSize={line.size}>{line.text}</text>)}
          </g>}
        </g>
      ))}
      {state.damage > 0 && state.phase !== "detached" && <g fill="none" stroke="#34372f" strokeWidth={state.damage > 2 ? 1.4 : .7}>
        <path d={`M${assembly.cut.slice(0,state.damage === 1 ? 4 : state.damage === 2 ? 7 : assembly.cut.length).map(point=>point.join(",")).join("L")}`} />
        <path d={`M${assembly.branches[state.variant].map(point=>point.join(",")).join("L")}`} />
      </g>}
    </svg>
  );
}

export function EntranceFallback({ state }: { state: BreakSnapshot }) {
  return <><div className={styles.desktopDrawing}><SurfaceDrawing mobile={false} state={state} /></div><div className={styles.mobileDrawing}><SurfaceDrawing mobile state={state} /></div></>;
}
