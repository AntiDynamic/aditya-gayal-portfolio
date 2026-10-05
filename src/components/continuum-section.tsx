import { ContinuumTrace } from "@/components/continuum-trace";

const repository = "https://github.com/AntiDynamic/Continuum";

export function ContinuumSection() {
  return (
    <section className="continuum-section" id="continuum" aria-labelledby="continuum-title">
      <div className="continuum-inner">
        <div className="continuum-section-mark">
          <span><b>01</b> / FIRST FIELD</span>
          <span>CONTEXT → OBSERVATION → OUTCOME</span>
        </div>

        <div className="continuum-intro">
          <h2 className="continuum-title" id="continuum-title">
            <span>THE CODE IS</span>
            <span className="continuum-title-indent">ONLY PART</span>
            <span>OF THE STORY.</span>
          </h2>
          <div className="continuum-intro-copy">
            <p className="continuum-kicker">CONTINUUM / A CODING-AGENT FIELD RECORDER</p>
            <p>
              Continuum delivers repository-grounded context, then keeps a local record of the evidence an agent exposes while it works. The code matters. So does the path that got there.
            </p>
            <a className="continuum-repo-link" href={repository} target="_blank" rel="noopener noreferrer">
              Explore Continuum on GitHub <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>

        <ContinuumTrace />

        <div className="continuum-boundary">
          <span aria-hidden="true" className="continuum-boundary-mark">↳</span>
          <p>
            It records signals its adapter exposes—not private model reasoning. Context token counts are estimates, not provider billing totals.
          </p>
          <span className="continuum-local-note">LOCAL RECORD / ADAPTER DEPENDENT</span>
        </div>
      </div>
    </section>
  );
}
