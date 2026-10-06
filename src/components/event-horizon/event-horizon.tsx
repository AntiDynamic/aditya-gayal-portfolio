import { EventHorizonScroll } from "./event-horizon-scroll";
import { SoundtrackControl } from "@/components/soundtrack/soundtrack-player";
import Link from "next/link";
import styles from "./event-horizon.module.css";

export function EventHorizon(){return <main className={styles.experience} data-event-horizon>
  <div className={styles.viewport}>
    <div className={styles.visual} aria-hidden="true"><EventHorizonScroll /></div>
    <nav className={styles.controls} aria-label="Introduction">
      <Link href="/" prefetch={false}>AG<span> / ADITYA GAYAL</span></Link>
      <SoundtrackControl variant="threshold" className={styles.soundtrackControl} />
      <button type="button" data-motion-choice hidden>Reduce motion</button>
      <a href="#identity" data-skip-intro>Skip intro <span aria-hidden="true">↗</span></a>
    </nav>
    <div className={styles.prelude} data-prelude aria-hidden="true"><span>ADITYA GAYAL</span><span>DEVELOPER / BUILDER</span></div>
    <p className={styles.invitation} data-invitation aria-hidden="true">A question can pull you in.<span>SCROLL TO FOLLOW IT ↓</span></p>
    <section className={styles.identity} aria-labelledby="identity-title" data-identity>
      <span className={styles.rule} data-reform="0" aria-hidden="true" />
      <p className={styles.name} data-reform="1">ADITYA GAYAL</p>
      <p className={styles.role} data-reform="2">DEVELOPER / BUILDER</p>
      <h1 id="identity-title" tabIndex={-1}><span data-reform="3">STRANGE QUESTIONS.</span><span data-reform="4">USEFUL SYSTEMS.</span></h1>
      <p className={styles.bio} data-reform="5">Curiosity gets me into code.<br />The hard part usually keeps me there.</p>
      <Link className={styles.continue} href="/" prefetch={false} data-reform="5">Meet the person behind the question <span aria-hidden="true">↗</span></Link>
    </section>
  </div>
  <div id="identity" className={styles.destination} aria-hidden="true" />
</main>;}
