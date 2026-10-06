"use client";
import { useState, useRef, type PointerEvent } from "react";
import s from "./personal-scenes.module.css";
export function CollaborationSwitch() {
  const [shared, setShared] = useState(false);
  const start = useRef(0);
  const dragged = useRef(false);
  const down = (e: PointerEvent<HTMLButtonElement>) => {
    start.current = e.clientX;
    dragged.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  return (
    <div className={s.collaboration} data-shared={shared}>
      <div className={s.perspectiveLabel}>
        {shared ? "OUR BETTER VERSION" : "MY FIRST PASS"}
      </div>
      <div className={s.collabDrawing}>
        <svg viewBox="0 0 1000 430" aria-hidden="true">
          <path
            d="M60 300 C220 300 235 150 430 150 L610 150"
            className={s.firstPass}
          />
          <path d="M610 85v140" stroke="#ffdb5b" strokeWidth="5" />
          <text x="620" y="125" fill="#ffdb5b">
            fix the visible end
          </text>
          <circle cx="60" cy="300" r="9" fill="#fff8ed" />
        </svg>
        <div className={s.tracingOverlay}>
          <svg viewBox="0 0 1000 430" aria-hidden="true">
            <path
              d="M60 300 C300 300 235 85 470 85 S660 310 920 220"
              className={s.betterPass}
              pathLength="1"
            />
            <path
              d="M625 112l210 20m-208 4l209-24"
              stroke="#ffdf64"
              strokeWidth="2"
            />
            <text x="640" y="177" fill="#22211f">
              look a little upstream
            </text>
            <path
              d="M450 96l22-22 22 22"
              fill="none"
              stroke="#22211f"
              strokeWidth="3"
            />
          </svg>
          <span className={s.overlayAnnotation}>another way in ↙</span>
        </div>
      </div>
      <div className={s.collabEnd}>
        <p aria-live="polite">
          {shared
            ? "The idea changed. That’s why I build with people."
            : "Sometimes I’m too close to the thing I’m trying to fix."}
        </p>
        <button
          className={s.action}
          type="button"
          aria-pressed={shared}
          onPointerDown={down}
          onPointerUp={(e) => {
            if (Math.abs(e.clientX - start.current) > 35) {
              dragged.current = true;
              setShared(true);
            }
          }}
          onClick={() => {
            if (!dragged.current) setShared((v) => !v);
            dragged.current = false;
          }}
        >
          {shared ? "See the first pass" : "Bring another view"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}
