"use client";
import { useState } from "react";
import { projects } from "./projects";
import s from "./personal-scenes.module.css";
const captions = [
  "Time makes more sense when you can follow the trace.",
  "Find the break. Understand it. Reconnect the path.",
  "Make the city’s signals easier to read.",
  "An idea takes shape one cut at a time.",
  "Look at the layers. Notice what doesn’t belong.",
];
export function WorkStage() {
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
  return (
    <div className={s.workExperience}>
      <div
        className={s.projectStage}
        data-world={project.id}
        style={{
          background: project.color,
          color:
            selected === 2 || selected === 3 || selected === 4
              ? "#171b1b"
              : "#fff8ed",
        }}
      >
        <span className={s.stageLabel}>
          {project.number} / {project.descriptor}
        </span>
        <svg key={project.id} viewBox="0 0 600 500" aria-hidden="true">
          {selected === 0 && (
            <g className={s.timeWorld}>
              {[0, 1, 2, 3, 4].map((i) => (
                <g
                  key={i}
                  opacity={1 - i * 0.15}
                  transform={`translate(${i * 25} ${i * -27})`}
                >
                  <path
                    d="M50 390H165V175H340V310H510"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <circle cx="340" cy="175" r="12" fill="currentColor" />
                </g>
              ))}
            </g>
          )}
          {selected === 1 && (
            <g>
              <path
                d="M60 380L200 240 275 250M325 190L410 120 550 220"
                stroke="currentColor"
                fill="none"
                strokeWidth="9"
              />
              <path
                className={s.repairPath}
                pathLength="1"
                d="M275 250 C285 245 290 190 325 190"
                stroke="#ffda73"
                fill="none"
                strokeWidth="9"
              />
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M${280 + i * 12} ${223 - i * 10}l22 11`}
                  stroke="#ffda73"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}
          {selected === 2 && (
            <g className={s.cityWorld}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <g
                  key={i}
                  transform={`translate(${100 + (i % 4) * 100} ${195 + Math.floor(i / 4) * 135})`}
                >
                  <path
                    d="M0 0l38-22 44 25-38 24z"
                    fill="currentColor"
                    opacity=".85"
                  />
                  <path
                    d="M0 0v52l44 25V27M44 77l38-23V3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </g>
              ))}
              <path
                d="M50 160Q270-50 560 180"
                stroke="currentColor"
                fill="none"
                strokeDasharray="5 9"
              />
              <g transform="translate(360 65)">
                <path
                  d="M-25-10l50 20m-50 0l50-20"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <circle r="5" fill="currentColor" />
              </g>
            </g>
          )}
          {selected === 3 && (
            <g className={s.clipWorld}>
              {[0, 1, 2].map((i) => (
                <g
                  key={i}
                  transform={`translate(${35 + i * 40} ${125 + i * 90})`}
                >
                  <rect width={480 - i * 55} height="60" fill="currentColor" />
                  <path
                    d="M25 8v44m40-44v44m90-44v44m75-44v44m110-44v44"
                    stroke="#c5e53c"
                    strokeWidth="2"
                  />
                </g>
              ))}
              <path d="M300 65v365" stroke="currentColor" strokeWidth="3" />
              <path d="M285 65h30l-15 20z" fill="currentColor" />
            </g>
          )}
          {selected === 4 && (
            <g className={s.browserWorld}>
              {[2, 1, 0].map((i) => (
                <g
                  key={i}
                  transform={`translate(${100 + i * 35} ${100 + i * 45}) rotate(${-i * 4} 200 140)`}
                >
                  <rect
                    width="350"
                    height="235"
                    rx="3"
                    fill={i === 0 ? "#f3eee1" : "#159baa"}
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M0 40h350M25 20h80"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M30 75h240m-240 30h160m-160 80h230"
                    stroke="currentColor"
                    opacity=".4"
                    strokeWidth="4"
                  />
                </g>
              ))}
              <rect
                className={s.inspectWindow}
                x="255"
                y="210"
                width="120"
                height="100"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
            </g>
          )}
        </svg>
        <h3>{project.name}</h3>
        <p>{captions[selected]}</p>
      </div>
      <ol className={s.projectSelectors}>
        {projects.map((p, i) => (
          <li key={p.id} data-current={i === selected}>
            <button
              type="button"
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
            >
              <small>{p.number}</small>
              <span>
                {p.name}
                <em>{p.descriptor}</em>
              </span>
            </button>
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${p.name} on GitHub (new tab)`}
            >
              ↗
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
