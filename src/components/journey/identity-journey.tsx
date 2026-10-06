import { JourneyMotion } from "./journey-motion";
import styles from "./journey.module.css";

const interests = ["AI systems", "Agentic systems", "Developer tools", "Creative software", "Browsers / security", "Civic technology", "Automation", "Experimental engineering", "Visual systems"];

/** Copy and reading order are server-rendered. Only the scene controller is client-side. */
export function IdentityJourney() {
  return (
    <section className={styles.journey} id="top" aria-label="Aditya — how I think and build" data-identity-journey>
      <div className={styles.viewport}>
        <div className={styles.colorField} aria-hidden="true" />
        <div className={styles.underType} aria-hidden="true">WHAT IF?</div>
        <svg className={styles.fallback} viewBox="0 0 1000 800" aria-hidden="true">
          <g transform="translate(590 410) rotate(-22)">
            <path d="M-110-175C155-225 235-22 120 170C-2 296-262 98-165-87" fill="none" stroke="#777d98" strokeWidth="55" transform="translate(16 24)" />
            <path d="M-110-175C155-225 235-22 120 170C-2 296-262 98-165-87" fill="none" stroke="#f2ebdd" strokeWidth="54" />
            <path d="M148-115C-84-271-266-26-70 133C80 231 234 20 112-49" fill="none" stroke="#e54832" strokeWidth="42" />
            <path d="M-210 30C-176-172 142-211 192 45" fill="none" stroke="#aeb4c5" strokeWidth="15" />
          </g>
        </svg>
        <JourneyMotion />
        <div className={styles.chapters}>
          <article className={`${styles.chapter} ${styles.first}`} data-journey-chapter>
            <p className={styles.kicker}>ADITYA GAYAL <span>DEVELOPER / BUILDER / EXPERIMENTER</span></p>
            <h1 id="hero-title" tabIndex={-1} aria-label="STRANGE QUESTIONS. USEFUL SYSTEMS.">
              <span className={styles.typeLine}><span>STRANGE</span></span>
              <span className={styles.typeLine}><span>QUESTIONS.</span></span>
              <span className={`${styles.typeLine} ${styles.smallLine}`}><span>USEFUL SYSTEMS.</span></span>
            </h1>
            <p className={styles.caption}>I’m Aditya. Curiosity gets me into code.<br />The hard part usually keeps me there.</p>
          </article>
          <article className={styles.chapter} data-journey-chapter>
            <p className={styles.kicker}>01 / OBSERVE <span>A SMALL DETAIL. A DIFFERENT QUESTION.</span></p>
            <h2 id="thinking-title" aria-label="I FOLLOW THE ODD DETAIL."><span>I FOLLOW</span><span>THE ODD</span><em>DETAIL.</em></h2>
            <p className={styles.caption}>Before deciding what the answer should be,<br className={styles.desktopBreak} /> I like finding out why it behaves that way.</p>
          </article>
          <article className={`${styles.chapter} ${styles.connections}`} data-journey-chapter>
            <p className={styles.kicker}>02 / CONNECT <span>THE INTERESTING PART IS OFTEN BETWEEN THINGS.</span></p>
            <h2 aria-label="TOO MANY OPEN TABS."><span>TOO MANY</span><em>OPEN TABS.</em></h2>
            <ul className={styles.interests} aria-label="Things that pull my attention">{interests.map(interest => <li key={interest}>{interest}</li>)}</ul>
            <p className={styles.caption}>Agents, tools, browsers, cities.<br />I keep wondering what happens when they meet.</p>
          </article>
          <article className={styles.chapter} data-journey-chapter>
            <p className={styles.kicker}>03 / REFINE <span>TRY. TRACE. CHANGE SOMETHING. TRY AGAIN.</span></p>
            <h2 aria-label="I STAY WITH THE HARD BIT."><span>I STAY WITH</span><span>THE HARD</span><em>BIT.</em></h2>
            <p className={styles.caption}>The stubborn bug. The almost-working idea.<br className={styles.desktopBreak} /> I like staying long enough to understand it.</p>
          </article>
          <article className={`${styles.chapter} ${styles.people}`} data-journey-chapter>
            <p className={styles.kicker}>04 / TOGETHER <span>MY FIRST PASS → OUR BETTER VERSION</span></p>
            <h2 aria-label="A DIFFERENT VIEW CHANGES THE WORK."><span>A DIFFERENT</span><span>VIEW CHANGES</span><em>THE WORK.</em></h2>
            <p className={styles.caption}>Someone else can see the bit I’m too close to.<br className={styles.desktopBreak} /> That’s why I like building with people.</p>
          </article>
        </div>
        <div className={styles.edgeNotes} aria-hidden="true"><span>UNDER THE SURFACE</span><span data-journey-index>00 / 04</span></div>
        <a className={styles.skip} href="#work">Straight to the work <span aria-hidden="true">↗</span></a>
        <div className={styles.scrollCue} aria-hidden="true"><span className={styles.scrollLine} /><span>SCROLL INTO IT</span></div>
      </div>
      <div className={styles.anchor} id="thinking" tabIndex={-1} role="region" aria-label="How I think" />
      <div className={`${styles.anchor} ${styles.curiosityAnchor}`} id="curiosity" tabIndex={-1} role="region" aria-label="What I’m curious about" />
      <div className={`${styles.anchor} ${styles.buildingAnchor}`} id="building" tabIndex={-1} role="region" aria-label="How I build" />
      <div className={`${styles.anchor} ${styles.peopleAnchor}`} id="collaboration" tabIndex={-1} role="region" aria-label="Building with people" />
    </section>
  );
}
