import { ProjectIndex } from "@/components/project-index";
import { RevealKey } from "@/components/reveal-key";
import { AboutSection, ContactSection } from "@/components/about-section";
import { CuriosityField } from "@/components/curiosity-field";
import { MessyMiddle } from "@/components/messy-middle";
import { CollaborationField } from "@/components/collaboration-field";
import { PageMotion } from "@/components/page-motion";
import { EntranceGate } from "@/components/entrance/entrance-gate";

export default function Home() {
  return (
    <EntranceGate><main className="portfolio-shell text-field-ink font-reading">
      <PageMotion />
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Aditya Gayal — home">
          <span>ADITYA</span>
          <span>GAYAL</span>
        </a>
        <nav aria-label="Main navigation" className="site-nav">
          <a className="nav-link" href="#thinking">Thinking <span aria-hidden="true">↘</span></a>
          <a className="nav-link work-link" href="#work">Work <span aria-hidden="true">↘</span></a>
          <a className="nav-link" href="#now">Now <span aria-hidden="true">↘</span></a>
          <a className="nav-link" href="#contact">Contact <span aria-hidden="true">↘</span></a>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> ADITYA GAYAL · DEVELOPER / BUILDER</p>
          <div className="hero-title-stack">
            <div className="hero-title-echo" aria-hidden="true">
              <span>STRANGE QUESTIONS.</span>
              <span>USEFUL SYSTEMS.</span>
            </div>
            <h1 className="hero-title" id="hero-title" tabIndex={-1}>
              <span className="title-line title-line-one">STRANGE QUESTIONS.</span>
              <span className="title-line title-line-two">USEFUL SYSTEMS.</span>
            </h1>
          </div>
          <p className="intro-copy">
            Curiosity gets me started. I stay for the strange details, the hard debugging, and the moment it finally works.
          </p>
        </div>

        <div className="field-notes" aria-hidden="true">
          <span className="note note-top">follow the odd bit</span>
          <span className="note-rule" />
          <span className="note note-bottom">try → learn → make it work</span>
        </div>

        <RevealKey />
        <div className="hero-footer">
          <span>Curiosity gets me started. People make the work better.</span>
          <a className="hero-next" href="#thinking">A little more about how I work <b aria-hidden="true">↓</b></a>
        </div>
      </section>
      <AboutSection />
      <CuriosityField />
      <MessyMiddle />
      <CollaborationField />
      <ProjectIndex />
      <ContactSection />
    </main></EntranceGate>
  );
}
