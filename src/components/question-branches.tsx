"use client";

import { useState } from "react";

const branches = [
  {
    id: "trace",
    number: "01",
    label: "Trace the change",
    question: "What happened just before?",
    next: "follow the first thing that moved.",
  },
  {
    id: "try",
    number: "02",
    label: "Try the unlikely route",
    question: "Which assumption could loosen?",
    next: "make a version that tests the assumption.",
  },
  {
    id: "share",
    number: "03",
    label: "Bring in another view",
    question: "What am I too close to notice?",
    next: "leave room for someone else to move the frame.",
  },
] as const;

export function QuestionBranches() {
  const [active, setActive] = useState(0);
  const selected = branches[active];

  return (
    <div className="question-field" data-branch={selected.id} data-enter="trace">
      <div className="question-seed">
        <span className="question-overline">A SMALL FRICTION</span>
        <p>Why did it behave that way?</p>
        <span className="question-seed-mark" aria-hidden="true">↘</span>
      </div>

      <svg className="question-routes" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" className={active === 0 ? "is-active" : undefined} d="M312 315 C370 286 390 106 500 106" />
        <path pathLength="1" className={active === 1 ? "is-active" : undefined} d="M312 315 C385 315 405 198 500 198" />
        <path pathLength="1" className={active === 2 ? "is-active" : undefined} d="M312 315 C370 335 410 289 500 289" />
      </svg>

      <div className="question-choices" role="group" aria-label="Choose where to follow the question">
        {branches.map((branch, index) => (
          <button
            className="question-choice"
            type="button"
            key={branch.id}
            aria-pressed={active === index}
            aria-controls="question-followup"
            onClick={() => setActive(index)}
          >
            <span className="question-choice-index">{branch.number}</span>
            <span className="question-choice-copy">
              <span className="question-choice-label">{branch.label}</span>
              <span className="question-choice-prompt">{branch.question}</span>
            </span>
            <span className="question-choice-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
        <p className="question-followup" id="question-followup" aria-live="polite" aria-atomic="true">
          <span>SO I</span> {selected.next}
        </p>
      </div>
    </div>
  );
}
