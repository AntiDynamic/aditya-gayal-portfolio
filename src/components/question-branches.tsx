"use client";
import { useState } from "react";
import s from "./personal-scenes.module.css";
const routes = [
  {
    name: "The visible symptom",
    end: "Nope. That’s the result, not the cause.",
    path: "M90 270 C190 270 200 90 340 90 L460 90",
    label: "A DEAD END",
    color: "#c62942",
  },
  {
    name: "My first assumption",
    end: "Back where I started. Try loosening the assumption.",
    path: "M90 270 C190 270 220 140 360 140 C560 140 560 360 390 360 C280 360 290 240 370 240",
    label: "LOOK AGAIN",
    color: "#b26717",
  },
  {
    name: "What changed just before?",
    end: "I usually follow the thing that changed first.",
    path: "M90 270 C260 270 230 410 420 410 S560 215 720 215 L880 215",
    label: "TRACE THE CHANGE.",
    color: "#173fb8",
  },
];
export function QuestionBranches() {
  const [selected, setSelected] = useState<number | null>(null);
  const [followed, setFollowed] = useState(false);
  return (
    <div className={s.investigation} data-route={selected ?? "none"}>
      <div className={s.question}>
        <span className={s.micro}>A SMALL FRICTION / FOLLOW IT</span>
        <h3>
          Why did it
          <br />
          behave
          <br />
          <em>that way?</em>
        </h3>
      </div>
      <svg
        className={s.questionDrawing}
        viewBox="0 0 1000 500"
        aria-hidden="true"
      >
        <path
          d="M90 270 C200 270 270 80 480 80 M90 270 C240 270 200 410 440 410 M90 270 C300 270 330 240 650 240"
          stroke="#c9c2b5"
          fill="none"
        />
        {selected !== null && (
          <g key={selected} style={{ color: routes[selected].color }}>
            <path
              className={s.selectedRoute}
              pathLength="1"
              d={routes[selected].path}
            />
            <circle
              cx={selected === 2 ? 880 : selected === 1 ? 370 : 460}
              cy={selected === 2 ? 215 : selected === 1 ? 240 : 90}
              r="10"
              fill="currentColor"
            />
            {selected === 0 && (
              <path
                d="M440 65l40 50m0-50l-40 50"
                stroke="currentColor"
                strokeWidth="3"
              />
            )}
            <text x="520" y="470">
              {followed
                ? "THE THING THAT CHANGED FIRST."
                : routes[selected].label}
            </text>
          </g>
        )}
        <circle cx="90" cy="270" r="9" fill="#22211f" />
      </svg>
      <div className={s.routeChoices}>
        {routes.map((r, i) => (
          <button
            type="button"
            key={r.name}
            aria-pressed={selected === i}
            onClick={() => {
              setSelected(i);
              setFollowed(false);
            }}
          >
            <span>0{i + 1}</span>
            {r.name}
            <b aria-hidden="true">↗</b>
          </button>
        ))}
      </div>
      <p className={s.routeOutcome} aria-live="polite">
        {selected === null
          ? "Pick a route. There isn’t a straight line to the answer."
          : followed
            ? "The first change becomes the next question. Now I can test something specific."
            : routes[selected].end}
      </p>
      {selected !== null && (
        <button
          className={s.followRoute}
          type="button"
          onClick={() => {
            if (selected !== 2) setSelected(2);
            setFollowed(true);
          }}
        >
          {followed ? "A clue, not a conclusion" : "Follow it upstream"}{" "}
          <span aria-hidden="true">↗</span>
        </button>
      )}
      <div className={s.routeNotes}>
        <span>follow the odd bit ↗</span>
        <span>wrong turns count, too.</span>
      </div>
    </div>
  );
}
