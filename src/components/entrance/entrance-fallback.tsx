import { getEntranceComposition, getEntranceSeam } from "./entrance-manifest";
import styles from "./entrance.module.css";

function SurfaceDrawing({ mobile }: { mobile: boolean }) {
  const composition = getEntranceComposition(mobile);
  const prefix = mobile ? "surface-mobile" : "surface-desktop";
  return (
    <svg viewBox={`0 0 ${composition.width} ${composition.height}`} preserveAspectRatio="xMidYMid meet" focusable="false">
      <defs>
        <filter id={`${prefix}-contact`} x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="5" dy="15" stdDeviation="10" floodColor="#29251e" floodOpacity=".2" /></filter>
        {composition.pieces.map((piece) => <clipPath key={piece.id} id={`${prefix}-${piece.id}`}><polygon points={piece.points.map((point) => point.join(",")).join(" ")} /></clipPath>)}
      </defs>
      <rect width={composition.width} height={composition.height} fill="#f2ebdd" />
      <polygon points={getEntranceSeam(mobile).map((point) => point.join(",")).join(" ")} fill="#173fb8" />
      {composition.pieces.toSorted((a, b) => a.z + a.depth - b.z - b.depth).map((piece) => (
        <g key={piece.id}>
          <polygon points={piece.points.map((point) => `${point[0] + 3},${point[1] + piece.depth * .35}`).join(" ")} fill={piece.material === "aluminum" ? "#7d7d79" : "#c7beb0"} />
          <polygon points={piece.points.map((point) => point.join(",")).join(" ")} fill={piece.color} filter={`url(#${prefix}-contact)`} />
          {piece.role === "primary" && <g clipPath={`url(#${prefix}-${piece.id})`} fill="#22211f" fontFamily="var(--font-display), Arial, sans-serif" fontWeight="800" letterSpacing="-.045em">
            {composition.titleLines.map((line, index) => <text key={index} x={line.x} y={line.y} fontSize={line.size}>{line.text}</text>)}
          </g>}
        </g>
      ))}
    </svg>
  );
}

export function EntranceFallback() {
  return <><div className={styles.desktopDrawing}><SurfaceDrawing mobile={false} /></div><div className={styles.mobileDrawing}><SurfaceDrawing mobile /></div></>;
}
