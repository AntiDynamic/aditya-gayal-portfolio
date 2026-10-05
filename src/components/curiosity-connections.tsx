"use client";

import { useState } from "react";

const connections = [
  {
    id: "agents",
    topics: ["AI SYSTEMS", "AGENTIC SYSTEMS", "DEVELOPER TOOLS"],
    question: "How can people see what a system is doing?",
    color: "cobalt",
  },
  {
    id: "browser",
    topics: ["BROWSERS", "SECURITY", "AUTOMATION"],
    question: "What can a person inspect, change, and trust?",
    color: "cyan",
  },
  {
    id: "civic",
    topics: ["CIVIC TECHNOLOGY", "VISUAL SYSTEMS / INTERACTION"],
    question: "Who gets to read a city's signals?",
    color: "sun",
  },
  {
    id: "creative",
    topics: ["CREATIVE SOFTWARE", "EXPERIMENTAL ENGINEERING"],
    question: "Could the tool itself become part of the idea?",
    color: "acid",
  },
] as const;

export function CuriosityConnections() {
  const [active, setActive] = useState(0);

  return (
    <div className="curiosity-field" data-active-connection={connections[active].id}>
      <svg className="curiosity-routes" viewBox="0 0 1000 440" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" className={active === 0 ? "is-active" : undefined} d="M106 100 C260 100 298 96 466 100 S730 104 900 100" />
        <path pathLength="1" className={active === 1 ? "is-active" : undefined} d="M106 210 C294 210 330 206 518 210 S760 214 900 210" />
        <path pathLength="1" className={active === 2 ? "is-active" : undefined} d="M106 320 C274 320 325 316 480 320 S727 324 900 320" />
        <path pathLength="1" className={active === 3 ? "is-active" : undefined} d="M106 430 C278 430 338 426 504 430 S756 434 900 430" />
      </svg>

      <ol className="curiosity-links" aria-label="Ways these interests connect">
        {connections.map((connection, index) => (
          <li key={connection.id}>
            <button
              className={`curiosity-link curiosity-link-${connection.color}`}
              type="button"
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <span className="curiosity-link-number">0{index + 1}</span>
              <span className="curiosity-link-content">
                <span className="curiosity-topics">
                  {connection.topics.map((topic, topicIndex) => (
                    <span className="curiosity-topic" key={topic}>
                      {topicIndex > 0 && <span className="curiosity-cross" aria-hidden="true">×</span>}
                      {topic}
                    </span>
                  ))}
                </span>
                <span className="curiosity-question">{connection.question}</span>
              </span>
              <span className="curiosity-link-mark" aria-hidden="true">↗</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
