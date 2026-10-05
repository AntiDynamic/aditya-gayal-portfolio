import { ProjectIndex } from "@/components/project-index";
import { RevealKey } from "@/components/reveal-key";
import { AboutSection, ContactSection } from "@/components/about-section";
import { ContinuumSection } from "@/components/continuum-section";

const github = "https://github.com/AntiDynamic";
const linkedin = "https://in.linkedin.com/in/adityagayal";

export default function Home() {
  return (
    <main className="portfolio-shell text-field-ink font-reading">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Aditya Gayal — home">
          <span>ADITYA</span>
          <span>GAYAL</span>
        </a>
        <nav aria-label="Main navigation" className="site-nav">
          <a className="nav-link" href="#about">About <span aria-hidden="true">↘</span></a>
          <a className="nav-link work-link" href="#work">Work <span aria-hidden="true">↘</span></a>
          <a className="nav-link" href={github} target="_blank" rel="noopener noreferrer">
            GitHub <span className="external-mark" aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="nav-link" href={linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn <span className="external-mark" aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Developer / builder / experimenter</p>
          <h1 className="hero-title" id="hero-title">
            <span className="title-line title-line-one">STRANGE QUESTIONS.</span>
            <span className="title-line title-line-two">USEFUL SYSTEMS.</span>
          </h1>
          <p className="intro-copy">
            As a developer, I work across AI systems, creative software, and the odd ideas between them.
          </p>
        </div>

        <div className="field-notes" aria-hidden="true">
          <span className="note note-top">curiosity, with a purpose</span>
          <span className="note-rule" />
          <span className="note note-bottom">observe → connect → make</span>
        </div>

        <RevealKey />
        <ProjectIndex />
        <div className="hero-footer" aria-hidden="true">
          <span>Solo experiments · shared builds</span>
          <span className="footer-mark">A FIELD OF WORKING IDEAS <b>01—05</b></span>
        </div>
      </section>
      <ContinuumSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
