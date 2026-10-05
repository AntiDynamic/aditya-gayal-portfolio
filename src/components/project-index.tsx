"use client";

import { useEffect, useState } from "react";
import { PROJECT_RESET_EVENT, PROJECT_SELECT_EVENT, resetProject, selectProject } from "./project-events";
import { projects } from "./projects";

export function ProjectIndex() {
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected === null ? null : projects[selected];

  useEffect(() => {
    const onSelect = (event: Event) => {
      const index = (event as CustomEvent<{ index: number }>).detail?.index;
      if (Number.isInteger(index) && index >= 0 && index < projects.length) setSelected(index);
    };
    const onReset = () => setSelected(null);
    window.addEventListener(PROJECT_SELECT_EVENT, onSelect);
    window.addEventListener(PROJECT_RESET_EVENT, onReset);
    return () => {
      window.removeEventListener(PROJECT_SELECT_EVENT, onSelect);
      window.removeEventListener(PROJECT_RESET_EVENT, onReset);
    };
  }, []);

  return (
    <section className="project-index" id="work" aria-labelledby="index-title" data-active-project={active?.id ?? "none"}>
      <h2 className="index-heading" id="index-title">
        <span>Selected work</span>
        <span>01—05</span>
      </h2>
      <ol className="project-list">
        {projects.map((project) => (
          <li
            className="project-row"
            key={project.id}
            data-project={project.id}
            data-active={selected === project.index}
          >
            <button
              className="project-select"
              type="button"
              aria-pressed={selected === project.index}
              onClick={() => selectProject(project.index)}
            >
              <span className="project-number">{project.number}</span>
              <span className="project-name-wrap">
                <span className="project-name">{project.name}</span>
                <span className="project-description">{project.descriptor}</span>
              </span>
            </button>
            <a
              className="project-open"
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.name} on GitHub (opens in a new tab)`}
            >
              ↗
            </a>
          </li>
        ))}
      </ol>
      <div className="project-actions">
        <a
          className="active-project-link"
          href={active?.id === "continuum" ? "#continuum" : active?.href}
          target={active?.id === "continuum" ? undefined : "_blank"}
          rel={active?.id === "continuum" ? undefined : "noopener noreferrer"}
          hidden={active === null}
          aria-label={active?.id === "continuum"
            ? "Enter the Continuum project experience"
            : active ? `Open ${active.name} on GitHub (opens in a new tab)` : undefined}
        >
          {active?.id === "continuum" ? "Enter Continuum" : `Open ${active?.name ?? "project"}`}
          <span aria-hidden="true">{active?.id === "continuum" ? "↓" : "↗"}</span>
        </a>
        <button className="reset-project" type="button" onClick={resetProject} hidden={active === null}>Reset</button>
      </div>
      <span aria-live="polite" className="sr-only">
        {active?.id === "continuum"
          ? "Continuum selected. Enter Continuum experience link available."
          : active ? `${active.name} selected. Open project link available.` : "No project selected."}
      </span>
    </section>
  );
}
