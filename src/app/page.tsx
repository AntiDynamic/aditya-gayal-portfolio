import { ProjectIndex } from "@/components/project-index";
import { ContactSection } from "@/components/about-section";
import { IdentityJourney } from "@/components/journey/identity-journey";
import { PageMotion } from "@/components/page-motion";
import { NowNotes } from "@/components/now-notes";
import { SoundtrackControl } from "@/components/soundtrack/soundtrack-player";
import experience from "./experience.module.css";

export default function Home() {
  return (
    <main className={`portfolio-shell text-field-ink font-reading ${experience.page}`}>
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
          <SoundtrackControl variant="site" />
        </nav>
      </header>

      <IdentityJourney />
      <ProjectIndex />
      <NowNotes />
      <ContactSection />
    </main>
  );
}
