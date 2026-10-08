import { EventHorizonScroll } from "./event-horizon-scroll";
import Link from "next/link";
import { ReplayIntroLink } from "../room/replay-intro-link";
import styles from "./event-horizon.module.css";

export function EventHorizon({bridge=false}:{bridge?:boolean}){return <main className={styles.experience} data-event-horizon data-bridge={bridge || undefined}>
  <div className={styles.viewport}>
    <div className={styles.visual} aria-hidden="true"><EventHorizonScroll bridge={bridge} /></div>
    {bridge && <p className={styles.scrollCue} data-black-hole-cue aria-hidden="true">Scroll to enter <span>↓</span></p>}
    <nav className={styles.controls} aria-label="Introduction">
      {bridge ? <><Link href="/?room=1" prefetch={false} data-room-shortcut>Room <span aria-hidden="true">↗</span></Link><Link href="/?portfolio" prefetch={false} data-website-shortcut>Website <span aria-hidden="true">↗</span></Link></> : <a href="#identity" data-skip-intro>Skip intro <span aria-hidden="true">↗</span></a>}
    </nav>
    {bridge && <ReplayIntroLink className={styles.fullMotion}>Play full-motion intro ↗</ReplayIntroLink>}
    <section className={styles.identity} aria-labelledby="identity-title" data-identity aria-hidden={bridge || undefined} inert={bridge}>
      <span className={styles.rule} data-reform="0" aria-hidden="true" />
      <p className={styles.name} data-reform="1">ADITYA GAYAL</p>
      <p className={styles.role} data-reform="2">DEVELOPER / BUILDER</p>
      <h1 id="identity-title" tabIndex={-1}><span data-reform="3">ADITYA</span><span data-reform="4">GAYAL</span></h1>
      <p className={styles.narrative}>Space, time, and light lose their familiar order. Words stretch and fracture, before collapsing into darkness and a single point of light.</p>
      <p className={styles.bio} data-reform="5">I like making things and figuring out why they don’t work yet.</p>
      <Link className={styles.continue} href="/" prefetch={false} data-reform="5">Meet the person behind the question <span aria-hidden="true">↗</span></Link>
    </section>
  </div>
  <div id="identity" className={styles.destination} aria-hidden="true" />
</main>;}
