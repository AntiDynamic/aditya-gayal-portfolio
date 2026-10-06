"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import s from "./personal-scenes.module.css";

const notes = [
  {
    title: "What did the agent actually do?",
    back: "AI systems × developer tools. I keep coming back to the space between a result and the steps that produced it.",
    tone: "#ffdb55",
  },
  {
    title: "Can the instrument change the idea?",
    back: "Creative software × interaction. Sometimes changing how you make something changes what you make.",
    tone: "#a4d3dc",
  },
  {
    title: "Where should automation stop?",
    back: "Browsers × security. Helpful is a starting point. Boundaries are part of the question.",
    tone: "#ef6651",
  },
];
const clamp = (n: number, limit: number) =>
  Math.max(-limit, Math.min(limit, n));

export function NowNotes() {
  const [flipped, setFlipped] = useState<number | null>(null);
  const [positions, setPositions] = useState(notes.map(() => ({ x: 0, y: 0 })));
  const gesture = useRef<{
    index: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
  } | null>(null);
  const skipClick = useRef(false);

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = gesture.current;
    if (!drag) return;
    drag.dx = clamp(event.clientX - drag.x + positions[drag.index].x, 100);
    drag.dy = clamp(event.clientY - drag.y + positions[drag.index].y, 70);
    event.currentTarget.style.setProperty("--note-x", `${drag.dx}px`);
    event.currentTarget.style.setProperty("--note-y", `${drag.dy}px`);
  };
  const finish = (event: PointerEvent<HTMLButtonElement>, cancel = false) => {
    const drag = gesture.current;
    if (!drag) return;
    gesture.current = null;
    const old = positions[drag.index];
    skipClick.current =
      !cancel && Math.hypot(drag.dx - old.x, drag.dy - old.y) > 8;
    if (cancel) {
      event.currentTarget.style.setProperty("--note-x", `${old.x}px`);
      event.currentTarget.style.setProperty("--note-y", `${old.y}px`);
    } else
      setPositions((current) =>
        current.map((p, i) =>
          i === drag.index ? { x: drag.dx, y: drag.dy } : p,
        ),
      );
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section id="now" className={s.nowSection} aria-labelledby="now-title">
      <div className={s.nowIntro}>
        <span className={s.micro}>OPEN QUESTIONS / STILL UNFINISHED</span>
        <h2 id="now-title">
          Still
          <br />
          <em>asking.</em>
        </h2>
        <p>
          These are questions I keep coming back to. No neat conclusion yet.
        </p>
      </div>
      <p id="note-help" className="sr-only">
        Turn a note over with Enter or a tap. Arrow keys move the note. Mouse
        users can also arrange them by dragging.
      </p>
      <div className={s.notes}>
        {notes.map((note, i) => (
          <button
            type="button"
            key={note.title}
            aria-describedby="note-help"
            aria-pressed={flipped === i}
            style={
              {
                background: note.tone,
                "--note-angle": `${i === 1 ? 5 : -4}deg`,
                "--note-x": `${positions[i].x}px`,
                "--note-y": `${positions[i].y}px`,
              } as CSSProperties
            }
            onPointerDown={(event) => {
              if (event.pointerType !== "mouse" || event.button !== 0) return;
              skipClick.current = false;
              gesture.current = {
                index: i,
                x: event.clientX,
                y: event.clientY,
                dx: positions[i].x,
                dy: positions[i].y,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={move}
            onPointerUp={(event) => finish(event)}
            onPointerCancel={(event) => finish(event, true)}
            onLostPointerCapture={(event) => finish(event, true)}
            onClick={() => {
              if (skipClick.current) {
                skipClick.current = false;
                return;
              }
              setFlipped(flipped === i ? null : i);
            }}
            onKeyDown={(event) => {
              if (!event.key.startsWith("Arrow")) return;
              event.preventDefault();
              setPositions((current) =>
                current.map((p, j) =>
                  j !== i
                    ? p
                    : {
                        x: clamp(
                          p.x +
                            (event.key === "ArrowRight"
                              ? 15
                              : event.key === "ArrowLeft"
                                ? -15
                                : 0),
                          100,
                        ),
                        y: clamp(
                          p.y +
                            (event.key === "ArrowDown"
                              ? 15
                              : event.key === "ArrowUp"
                                ? -15
                                : 0),
                          70,
                        ),
                      },
                ),
              );
            }}
          >
            <span className={s.micro}>
              0{i + 1} / {flipped === i ? "THE OTHER SIDE" : "AN OPEN QUESTION"}
            </span>
            <span className={flipped === i ? s.noteBack : s.noteFront}>
              {flipped === i ? note.back : note.title}
            </span>
            <span className={s.noteFlip}>
              {flipped === i ? "Back to the question" : "Look underneath"} ↗
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
