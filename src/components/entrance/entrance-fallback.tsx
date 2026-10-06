import { getEntranceComposition, getEntranceInterior } from "./entrance-manifest";
import styles from "./entrance.module.css";
import { getBreakAssembly, type BreakSnapshot } from "./entrance-break";

function SurfaceDrawing({ mobile, state, unfolding = false }: { mobile: boolean; state: BreakSnapshot; unfolding?: boolean }) {
  const composition = getEntranceComposition(mobile);
  const assembly = getBreakAssembly(mobile);
  const pieces = state.damage < 2 ? composition.pieces : composition.pieces.flatMap(piece => piece.id === "raised-flap" ? [assembly.body, ...(state.phase === "detached" ? [] : [assembly.fragment])] : [piece]);
  const prefix = mobile ? "surface-mobile" : "surface-desktop";
  const polygonPath = (points: [number, number][]) => `M${points.map((point) => point.join(",")).join("L")}Z`;
  return (
    <svg viewBox={`0 0 ${composition.width} ${composition.height}`} preserveAspectRatio="xMidYMid meet" focusable="false">
      <defs>
        <filter id={`${prefix}-contact`} x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="5" dy="15" stdDeviation="10" floodColor="#29251e" floodOpacity=".2" /></filter>
        {pieces.map((piece) => <clipPath key={piece.id} id={`${prefix}-${piece.id}`}><polygon points={piece.points.map((point) => point.join(",")).join(" ")} /></clipPath>)}
      </defs>
      <rect data-unfold-interior={unfolding || undefined} width={composition.width} height={composition.height} fill="#f2ebdd" />
      {getEntranceInterior(mobile).toSorted((a, b) => a.z - b.z).map((layer) => <path key={layer.id} d={polygonPath(layer.points) + (layer.opening ? polygonPath(layer.opening) : "")} fillRule="evenodd" fill={layer.color} />)}
      <polygon points={assembly.fragment.points.map(point=>point.join(",")).join(" ")} fill="#091b46" />
      <path d={mobile ? "M320 358v104h12" : "M1030 420v138h22"} stroke="#1c4284" strokeWidth={mobile ? 5 : 8} fill="none" />
      {state.phase==="detached" && <path d={mobile ? "M319 452h13" : "M1021 544h22"} stroke="#b6c9e4" strokeWidth="1" />}
      {pieces.toSorted((a, b) => a.z + a.depth - b.z - b.depth).map((piece) => (
        <g key={piece.id} data-unfold-piece={unfolding ? piece.id : undefined} transform={state.phase==="detached" && piece.id==="lower-shell" ? `translate(0 ${mobile ? 7 : 10})` : undefined}>
          <polygon points={piece.points.map((point) => `${point[0] + 3},${point[1] + piece.depth * .35}`).join(" ")} fill={piece.material === "aluminum" ? "#7d7d79" : "#c7beb0"} />
          {piece.material === "paper" && <polygon points={piece.points.map((point) => `${point[0] + .4},${point[1] + 1.3}`).join(" ")} fill="#e2d6c3" />}
          <polygon points={piece.points.map((point) => point.join(",")).join(" ")} fill={piece.color} fillOpacity={piece.material === "acrylic" ? .38 : 1} filter={`url(#${prefix}-contact)`} />
          {piece.role === "primary" && <g clipPath={`url(#${prefix}-${piece.id})`} fill="#22211f" fontFamily="var(--font-display), Arial, sans-serif" fontWeight="800" letterSpacing="-.045em">
            {composition.titleLines.map((line, index) => <text key={index} x={line.x} y={line.y} fontSize={line.size}>{line.text}</text>)}
          </g>}
        </g>
      ))}
      {state.damage > 0 && state.phase !== "detached" && <g fill="none" stroke="#34372f" strokeWidth={state.damage > 2 ? 1.4 : .7}>
        {state.damage>=2 && <path d={`M${assembly.cut.slice(0,state.damage === 2 ? 4 : assembly.cut.length).map(point=>point.join(",")).join("L")}`} />}
        <path d={`M${assembly.branches[state.variant].map(point=>point.join(",")).join("L")}`} />
      </g>}
    </svg>
  );
}

export function EntranceFallback({ state, unfolding = false }: { state: BreakSnapshot; unfolding?: boolean }) {
  return <><div className={styles.desktopDrawing}><SurfaceDrawing mobile={false} state={state} unfolding={unfolding} /></div><div className={styles.mobileDrawing}><SurfaceDrawing mobile state={state} unfolding={unfolding} /></div></>;
}
