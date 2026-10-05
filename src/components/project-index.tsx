import { ContinuumSection } from "@/components/continuum-section";
import { projects } from "./projects";

export function ProjectIndex() {
  return (
    <section className="work-section" id="work" aria-labelledby="work-title">
      <div className="work-inner">
        <div className="work-kicker" data-enter="notation">
          <span>A FEW THINGS I’VE MADE</span>
          <span>SELECTED WORK · 01—05</span>
        </div>
        <div className="work-intro">
          <h2 id="work-title" data-enter="slice">Some places these ideas became real systems.</h2>
          <p data-enter="lift">Different questions, different people, different kinds of making. A few things I’m glad I stayed with.</p>
        </div>

        <ol className="work-list" data-enter="rows">
          {projects.map((project) => (
            <li className="work-row" key={project.id} data-project={project.id}>
              <span className="work-number">{project.number}</span>
              <div className="work-name-block">
                <h3>{project.name}</h3>
                <p>{project.descriptor}</p>
              </div>
              <a
                className="work-open"
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.name} on GitHub (opens in a new tab)`}
              >
                <span>Open on GitHub</span><span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ol>

        <details className="continuum-deep-dive">
          <summary>
            <span>Go deeper: Continuum</span>
            <span className="continuum-toggle-mark" aria-hidden="true">+</span>
          </summary>
          <ContinuumSection />
        </details>
      </div>
    </section>
  );
}
