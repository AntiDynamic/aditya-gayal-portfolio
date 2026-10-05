"use client";

import { useState } from "react";

const steps = [
  { label: "QUESTION", note: "That tiny ‘wait, why?’ is enough to begin." },
  { label: "TRY SOMETHING", note: "Get a rough version into your hands." },
  { label: "HMM.", note: "Good. Now there’s something real to inspect." },
  { label: "WHY?", note: "Trace the snag until it explains itself." },
  { label: "ASK AGAIN", note: "Another perspective can change the route." },
  { label: "FIX ONE THING", note: "Change the part you understand." },
  { label: "TEST AGAIN", note: "Find out if the fix holds." },
  { label: "REFINE", note: "Give the small details another pass." },
  { label: "WORKING, FOR NOW", note: "A working version is a satisfying place to pause." },
] as const;

type Phase = "rough" | "finding" | "settled";

function getPhase(index: number): Phase {
  if (index < 3) return "rough";
  if (index < 6) return "finding";
  return "settled";
}

export function BuildSequence() {
  const [active, setActive] = useState(0);
  const step = steps[active];
  const last = active === steps.length - 1;

  return (
    <div className="build-sequence" data-enter="settle">
      <div className="messy-board" data-phase={getPhase(active)}>
        <svg className="messy-routes" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" className="messy-route messy-route-a" d="M64 253 C170 220 205 152 318 179" />
          <path pathLength="1" className="messy-route messy-route-b" d="M330 183 C430 208 437 91 543 127" />
          <path pathLength="1" className="messy-route messy-route-c" d="M546 127 C648 160 672 282 782 239" />
          <path pathLength="1" className="messy-route messy-route-d" d="M783 239 C861 208 876 143 946 161" />
          <path pathLength="1" className="messy-route messy-route-whole" d="M64 90 C174 90 220 90 330 90 S430 90 530 90 S800 90 930 90 C982 90 982 215 930 215 S700 215 530 215 S280 215 80 215 C28 215 -12 215 -12 255 C-12 320 -12 380 80 380 S320 380 530 380 S800 380 946 380" />
          <path pathLength="1" className="messy-route messy-route-detour" d="M318 179 C360 105 407 276 465 222 S508 117 552 127" />
          <circle className="messy-mark-point point-a" cx="64" cy="253" r="7" />
          <circle className="messy-mark-point point-b" cx="946" cy="161" r="7" />
        </svg>

        <ol className="messy-words" aria-label="A rough idea becoming a working system">
          {steps.map((item, index) => (
            <li
              className={`messy-word messy-word-${index + 1}`}
              key={item.label}
              aria-current={active === index ? "step" : undefined}
            >
              <span className="messy-word-number">0{index + 1}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="build-controls">
        <div className="build-readout" aria-live="polite" aria-atomic="true">
          <span>{String(active + 1).padStart(2, "0")} / 09 — {step.label}</span>
          <p>{step.note}</p>
        </div>
        <div className="build-buttons" role="group" aria-label="Move through a build pass">
          <button className="build-button build-previous" type="button" disabled={active === 0} onClick={() => setActive((value) => Math.max(0, value - 1))}>
            <span aria-hidden="true">←</span> Previous
          </button>
          <button className="build-button build-next" type="button" onClick={() => setActive((value) => last ? 0 : value + 1)}>
            {last ? "Start another pass" : "Next loose end"} <span aria-hidden="true">{last ? "↺" : "→"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
