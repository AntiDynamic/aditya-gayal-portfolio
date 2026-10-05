"use client";

import { useState, type CSSProperties } from "react";

const stages = [
  {
    short: "PREPARE",
    title: "Repository → context",
    detail: "Index a repository, then assemble source-backed context for the task at hand.",
  },
  {
    short: "OBSERVE",
    title: "Run → evidence",
    detail: "Keep the evidence an adapter exposes: tool events, Git changes, test exits, and usage when available.",
  },
  {
    short: "ASSESS",
    title: "Evidence → outcome",
    detail: "Review or compare runs, then record whether the person considers the work complete.",
  },
];

function cubicPoint(t: number, points: [[number, number], [number, number], [number, number], [number, number]]) {
  const [p0, p1, p2, p3] = points;
  const inverse = 1 - t;
  const x = inverse ** 3 * p0[0] + 3 * inverse ** 2 * t * p1[0] + 3 * inverse * t ** 2 * p2[0] + t ** 3 * p3[0];
  const y = inverse ** 3 * p0[1] + 3 * inverse ** 2 * t * p1[1] + 3 * inverse * t ** 2 * p2[1] + t ** 3 * p3[1];
  return [x, y] as const;
}

export function ContinuumTrace() {
  const [value, setValue] = useState(0);
  const [dragging, setDragging] = useState(false);
  const activeStage = value < 33 ? 0 : value < 67 ? 1 : 2;
  const segment = value <= 50 ? 0 : 1;
  const progress = segment === 0 ? value / 50 : (value - 50) / 50;
  const markerPosition = segment === 0
    ? cubicPoint(progress, [[70, 198], [300, 198], [390, 88], [600, 88]])
    : cubicPoint(progress, [[600, 88], [810, 88], [900, 198], [1130, 198]]);
  const controlStyle = { "--trace-progress": `${value}%` } as CSSProperties;

  return (
    <div className="continuum-trace" data-active-stage={activeStage} data-dragging={dragging}>
      <div className="continuum-trace-head">
        <span>ONE RUN, SEEN FROM THE OUTSIDE</span>
        <span className="continuum-trace-current">
          {String(activeStage + 1).padStart(2, "0")} / 03&nbsp;·&nbsp;{stages[activeStage].short}
        </span>
      </div>

      <svg className="continuum-trace-svg" viewBox="0 0 1200 270" preserveAspectRatio="none" aria-hidden="true">
        <path className="continuum-trace-echo" d="M70 211 C300 211 390 101 600 101 C810 101 900 211 1130 211" />
        <path className="continuum-trace-base" d="M70 198 C300 198 390 88 600 88 C810 88 900 198 1130 198" />
        <path
          className="continuum-trace-progress"
          d="M70 198 C300 198 390 88 600 88 C810 88 900 198 1130 198"
          pathLength="1000"
          strokeDasharray="1000"
          strokeDashoffset={1000 - value * 10}
        />
        <g className="continuum-trace-ticks">
          <path d="M70 182v32M600 72v32M1130 182v32" />
        </g>
        <g className="continuum-trace-stops">
          <circle cx="70" cy="198" r="6" />
          <circle cx="600" cy="88" r="6" />
          <circle cx="1130" cy="198" r="6" />
        </g>
        <g className="continuum-trace-marker" transform={`translate(${markerPosition[0]} ${markerPosition[1]})`}>
          <path d="M-19 -8 -8 -18 13 -16 21 -4 11 12 -10 13 -20 3Z" />
          <path className="continuum-marker-cut" d="m-7 0 6 6 12-13" />
          <circle cx="-11" cy="-8" r="2" />
        </g>
      </svg>

      <div className="continuum-range-wrap">
        <label className="continuum-range-label" htmlFor="continuum-scrubber">Move through the trace</label>
        <input
          className="continuum-range"
          id="continuum-scrubber"
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          style={controlStyle}
          aria-label="Move through the Continuum run"
          aria-valuetext={`${stages[activeStage].short}: ${stages[activeStage].title}`}
          aria-controls="continuum-stages"
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              setValue((current) => current < 50 ? 50 : 100);
            } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              setValue((current) => current > 50 ? 50 : 0);
            }
          }}
          onChange={(event) => setValue(event.currentTarget.valueAsNumber)}
        />
      </div>

      <ol className="continuum-stages" id="continuum-stages">
        {stages.map((stage, index) => (
          <li className="continuum-stage" key={stage.short} aria-current={index === activeStage ? "step" : undefined}>
            <span className="continuum-stage-number">0{index + 1} / {stage.short}</span>
            <h3>{stage.title}</h3>
            <p>{stage.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
