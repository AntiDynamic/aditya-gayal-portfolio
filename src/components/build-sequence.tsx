"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import styles from "./build-sequence.module.css";

type Material = "paper" | "ceramic" | "metal" | "rubber" | "acrylic";
type Piece = {
  id: string;
  label: string;
  material: Material;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  fallX: number;
  fallY: number;
  fallRotate: number;
  repairX: number;
  repairY: number;
  neighbors: number[];
  support?: "a" | "b" | "c";
  dependent?: "a" | "b" | "c";
};

const pieces: Piece[] = [
  { id: "first-pass", label: "FIRST ATTEMPT", material: "paper", x: 5, y: 12, w: 25, h: 17, rotate: -3, fallX: -16, fallY: 40, fallRotate: -17, repairX: -3, repairY: 1, neighbors: [1, 5], dependent: "a" },
  { id: "margin", label: "leave room", material: "paper", x: 31, y: 8, w: 18, h: 15, rotate: 2, fallX: 18, fallY: 54, fallRotate: 21, repairX: 2, repairY: 0, neighbors: [0, 2, 6] },
  { id: "joint-a", label: "A", material: "ceramic", x: 50, y: 18, w: 8, h: 11, rotate: 9, fallX: 24, fallY: 68, fallRotate: 34, repairX: 1, repairY: 2, neighbors: [1, 3, 6], support: "a" },
  { id: "rail-top", label: "TRACE A", material: "metal", x: 63, y: 12, w: 29, h: 6, rotate: -2, fallX: 24, fallY: 46, fallRotate: 9, repairX: -4, repairY: 1, neighbors: [2, 4], dependent: "b" },
  { id: "acrylic-window", label: "LOOK AGAIN", material: "acrylic", x: 76, y: 22, w: 19, h: 21, rotate: 4, fallX: 18, fallY: 76, fallRotate: 23, repairX: 3, repairY: -2, neighbors: [3, 8], dependent: "b" },
  { id: "nope", label: "NOPE.", material: "rubber", x: 7, y: 36, w: 17, h: 8, rotate: 1, fallX: -20, fallY: 38, fallRotate: -12, repairX: 1, repairY: -2, neighbors: [0, 6] },
  { id: "ceramic-a", label: "WHY?", material: "ceramic", x: 27, y: 31, w: 18, h: 17, rotate: -4, fallX: 8, fallY: 82, fallRotate: -28, repairX: -2, repairY: 2, neighbors: [1, 2, 7], dependent: "a" },
  { id: "draft", label: "rough notes", material: "paper", x: 48, y: 40, w: 20, h: 15, rotate: 3, fallX: -20, fallY: 56, fallRotate: -14, repairX: 3, repairY: 1, neighbors: [6, 8, 9] },
  { id: "joint-b", label: "B", material: "ceramic", x: 70, y: 49, w: 8, h: 11, rotate: -8, fallX: 18, fallY: 76, fallRotate: 27, repairX: 0, repairY: -1, neighbors: [4, 7, 9], support: "b" },
  { id: "metal-line", label: "TRACE B", material: "metal", x: 79, y: 61, w: 18, h: 6, rotate: 2, fallX: 24, fallY: 42, fallRotate: -11, repairX: 3, repairY: 0, neighbors: [8, 10, 13], dependent: "c" },
  { id: "paper-note", label: "ASK SOMEONE", material: "paper", x: 4, y: 64, w: 24, h: 16, rotate: -2, fallX: -12, fallY: 60, fallRotate: -21, repairX: -2, repairY: -1, neighbors: [5, 11] },
  { id: "acrylic-slice", label: "CLOSER", material: "acrylic", x: 32, y: 60, w: 17, h: 19, rotate: 5, fallX: -16, fallY: 78, fallRotate: -23, repairX: 2, repairY: -2, neighbors: [10, 12] },
  { id: "joint-c", label: "C", material: "ceramic", x: 53, y: 72, w: 8, h: 11, rotate: 7, fallX: 12, fallY: 72, fallRotate: 31, repairX: -1, repairY: 1, neighbors: [11, 13, 14], support: "c" },
  { id: "rubber-foot", label: "STILL WRONG", material: "rubber", x: 66, y: 82, w: 19, h: 8, rotate: -1, fallX: 10, fallY: 42, fallRotate: 13, repairX: -3, repairY: 0, neighbors: [9, 12, 14] },
  { id: "last-strip", label: "WORKS, FOR NOW", material: "metal", x: 83, y: 82, w: 14, h: 7, rotate: -3, fallX: 14, fallY: 50, fallRotate: 18, repairX: 1, repairY: 2, neighbors: [12, 13] },
];

const maxDamage: Record<Material, number> = { paper: 1, ceramic: 2, metal: 2, rubber: 2, acrylic: 2 };
const firstDamage = () => pieces.map(() => 0);

function pieceStatus(piece: Piece, amount: number) {
  if (amount === 0) return "intact";
  return amount >= maxDamage[piece.material] ? "open" : piece.material === "metal" ? "dented" : piece.material === "rubber" ? "compressed" : "cracked";
}

export function DestructionLab() {
  const [damage, setDamage] = useState<number[]>(firstDamage);
  const [pressedPiece, setPressedPiece] = useState<number | null>(null);
  const [impact, setImpact] = useState<{ id: number; x: number; y: number; force: "light" | "heavy" } | null>(null);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuilt, setRebuilt] = useState(false);
  const [message, setMessage] = useState("Tap a piece. Hold it for half a second, then release for a heavier hit.");
  const pressStartRef = useRef(0);
  const pressedIndexRef = useRef<number | null>(null);
  const skipClickRef = useRef(false);
  const impactIdRef = useRef(0);
  const rebuildTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (rebuildTimerRef.current !== null) window.clearTimeout(rebuildTimerRef.current);
  }, []);

  const changedCount = damage.filter((amount) => amount > 0).length;
  const openCount = damage.filter((amount, index) => amount >= maxDamage[pieces[index].material]).length;
  const supportA = damage[2] >= maxDamage.ceramic;
  const supportB = damage[8] >= maxDamage.ceramic;
  const supportC = damage[12] >= maxDamage.ceramic;

  const impactPiece = (index: number, force: "light" | "heavy") => {
    if (rebuildTimerRef.current !== null) window.clearTimeout(rebuildTimerRef.current);
    setRebuilding(false);
    setRebuilt(false);
    const piece = pieces[index];
    const current = damage[index];
    impactIdRef.current += 1;
    setImpact({ id: impactIdRef.current, x: piece.x + piece.w / 2, y: piece.y + piece.h / 2, force });

    if (current >= maxDamage[piece.material]) {
      setMessage("That layer is already open. Try another one.");
      return;
    }

    const next = damage.slice();
    next[index] = Math.min(maxDamage[piece.material], current + (force === "heavy" ? 2 : 1));
    if (force === "heavy") {
      piece.neighbors.forEach((neighbor) => {
        const neighborMax = maxDamage[pieces[neighbor].material];
        next[neighbor] = Math.min(neighborMax, next[neighbor] + 1);
      });
    }
    setDamage(next);
    const disturbed = next.filter((amount) => amount > 0).length;
    if (disturbed >= 8) setMessage(`${disturbed} pieces moved. Enough damage. Put it back together when you’re ready.`);
    else if (disturbed >= 5) setMessage("The break is information. Follow the part that moved first.");
    else if (disturbed >= 2) setMessage("A good-looking surface can still hide a bad assumption.");
    else setMessage("There. Now there’s something real to inspect.");
  };

  const onPiecePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    pressStartRef.current = performance.now();
    pressedIndexRef.current = index;
    skipClickRef.current = false;
    setPressedPiece(index);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPiecePointerUp = (index: number) => {
    if (pressedIndexRef.current !== index) return;
    pressedIndexRef.current = null;
    setPressedPiece(null);
    if (performance.now() - pressStartRef.current >= 500) {
      skipClickRef.current = true;
      impactPiece(index, "heavy");
    }
  };

  const onPieceClick = (index: number) => {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }
    impactPiece(index, "light");
  };

  const rebuild = () => {
    if (rebuildTimerRef.current !== null) window.clearTimeout(rebuildTimerRef.current);
    setRebuilding(true);
    setImpact(null);
    setMessage("Paper drifts back. The route finds a better line.");
    rebuildTimerRef.current = window.setTimeout(() => {
      setDamage(firstDamage());
      setRebuilding(false);
      setRebuilt(true);
      setMessage("Not the same arrangement. A better place to start.");
      rebuildTimerRef.current = null;
    }, 760);
  };

  return (
    <div className={styles.lab} data-enter="settle">
      <div className={styles.labHeading}>
        <p>FINISHED THINGS HIDE A LOT.</p>
        <p>One surface. A few supports. Plenty underneath.</p>
      </div>

      <div
        className={styles.board}
        role="group"
        data-support-a={supportA}
        data-support-b={supportB}
        data-support-c={supportC}
        data-rebuilding={rebuilding}
        data-rebuilt={rebuilt}
        data-damaged={changedCount > 0}
        aria-label="A layered construction holding a rough idea together"
      >
        <svg className={styles.underDrawing} viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
          <path className={styles.routeMain} d="M56 105 C230 105 284 171 412 171 S674 114 928 181" />
          <path className={styles.routeDetour} d="M85 313 C213 313 232 243 360 243 S510 316 642 316 S821 252 936 252" />
          <path className={styles.routeBase} d="M78 431 H919" />
          <path className={styles.supportLine} d="M303 55 V454 M718 46 V460" />
          <circle cx="303" cy="171" r="6" /><circle cx="718" cy="316" r="6" />
        </svg>

        <p className={styles.revealNote} data-open={changedCount >= 2} style={{ "--note-x": "9%", "--note-y": "46%" } as CSSProperties}>FIRST ATTEMPT</p>
        <p className={styles.revealNote} data-open={changedCount >= 4} style={{ "--note-x": "36%", "--note-y": "26%" } as CSSProperties}>NOPE. WHY?</p>
        <p className={styles.revealNote} data-open={changedCount >= 6} style={{ "--note-x": "68%", "--note-y": "38%" } as CSSProperties}>ASK SOMEONE</p>
        <p className={styles.revealNote} data-open={changedCount >= 8} style={{ "--note-x": "46%", "--note-y": "77%" } as CSSProperties}>CLOSER.</p>

        <div className={styles.pieces} role="group" aria-label="Breakable parts. Tap to damage; hold for half a second before release for a heavier impact.">
          {pieces.map((piece, index) => {
            const amount = damage[index];
            const state = pieceStatus(piece, amount);
            return (
              <button
                key={piece.id}
                className={styles.piece}
                type="button"
                data-material={piece.material}
                data-damage={amount}
                data-status={state}
                data-dependent={piece.dependent}
                data-pressing={pressedPiece === index}
                aria-label={`${piece.label}, ${piece.material}, ${state}. Tap to damage; hold and release for a heavier impact.`}
                style={{
                  "--piece-x": `${piece.x}%`,
                  "--piece-y": `${piece.y}%`,
                  "--piece-w": `${piece.w}%`,
                  "--piece-h": `${piece.h}%`,
                  "--piece-rotate": `${piece.rotate}deg`,
                  "--fall-x": `${piece.fallX}px`,
                  "--fall-y": `${piece.fallY}px`,
                  "--fall-rotate": `${piece.fallRotate}deg`,
                  "--repair-x": `${piece.repairX}px`,
                  "--repair-y": `${piece.repairY}px`,
                } as CSSProperties}
                onPointerDown={(event) => onPiecePointerDown(event, index)}
                onPointerUp={() => onPiecePointerUp(index)}
                onPointerCancel={() => { pressedIndexRef.current = null; setPressedPiece(null); }}
                onClick={() => onPieceClick(index)}
              >
                <span className={styles.pieceLabel}>{piece.label}</span>
                <span className={styles.pieceState}>{state}</span>
              </button>
            );
          })}
        </div>

        {impact && (
          <span
            key={impact.id}
            className={`${styles.impact} ${impact.force === "heavy" ? styles.impactHeavy : styles.impactLight}`}
            style={{ left: `${impact.x}%`, top: `${impact.y}%` } as CSSProperties}
            aria-hidden="true"
          />
        )}

        {rebuilt && <p className={styles.finalStatement} aria-live="polite">BREAK IT.<br />UNDERSTAND IT.<br /><span>BUILD IT BETTER.</span></p>}
      </div>

      <div className={styles.labControls}>
        <p aria-live="polite" aria-atomic="true">{message}</p>
        <div className={styles.controlGroup}>
          <span className={styles.progressLabel}>{String(changedCount).padStart(2, "0")} / 15 moved · {openCount} open</span>
          {changedCount >= 8 && !rebuilt && (
            <button className={styles.rebuildButton} type="button" onClick={rebuild} disabled={rebuilding}>
              {rebuilding ? "FINDING THE JOINTS…" : "PUT IT BACK TOGETHER"}<span aria-hidden="true">↗</span>
            </button>
          )}
          {rebuilt && (
            <button className={styles.rebuildButton} type="button" onClick={() => { setRebuilt(false); setMessage("Tap a piece. Hold it for half a second, then release for a heavier hit."); }}>
              TAKE ANOTHER PASS<span aria-hidden="true">↺</span>
            </button>
          )}
        </div>
      </div>

      <ul className="sr-only" aria-label="What the surface conceals">
        <li>First attempt.</li><li>Nope. Why?</li><li>Ask someone.</li><li>Closer.</li>
        <li>Break it. Understand it. Build it better.</li>
      </ul>
      <p className={styles.instruction}>Tap to chip. Hold for half a second, release for a heavier hit. Every piece is keyboard accessible.</p>
    </div>
  );
}
