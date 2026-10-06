import { ContinuumSection } from "@/components/continuum-section";
import { WorkStage } from "./work-stage";

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

        <WorkStage />

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
