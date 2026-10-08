import { featuredWork, links, work } from "../portfolio-data";
import { TrackedMedia } from "./media";
import { EditorialStage } from "./stage";
import { MotionLine } from "./motion-line";
import { ReplayIntroLink } from "../room/replay-intro-link";
import styles from "./editorial.module.css";

const experiments = [
  { title: "What did the agent actually do?", label: "Agents / evidence", href: work[0].href },
  { title: "Can the interface change the idea?", label: "This website / interaction", href: "https://github.com/AntiDynamic/aditya-gayal-portfolio" },
  { title: "Where should automation stop?", label: "Browsers / boundaries", href: work[4].href },
];

export function EditorialPortfolio() {
  return <main className={styles.page} data-editorial data-workbench-stage data-ready="false">
    <EditorialStage />
    <header className={styles.header}><a href="#hero-title" className={styles.wordmark}>AG<span>Aditya Gayal</span></a><nav aria-label="Portfolio"><a href="#about">Me</a><a href="#work">Work</a><a href="#lately">Lately</a><a href="#contact">Say hi ↗</a></nav></header>
    <section className={styles.hero} data-chapter="hero" aria-labelledby="hero-title">
      <div className={styles.heroTop}><span>Ideas, attempts, and things I’ve made.</span><ReplayIntroLink>Watch the intro ↗</ReplayIntroLink></div>
      <h1 id="hero-title" className={styles.heroTitle} tabIndex={-1} aria-label="Aditya Gayal">{["ADITYA", "GAYAL"].map((word, row) => <span key={word} className={styles.heroWord} data-word={row} aria-hidden="true">{Array.from(word).map((letter, index) => <span className={styles.letterMask} key={index}><span data-letter data-index={row * 6 + index}>{letter}</span></span>)}</span>)}</h1>
      <span className={styles.heroRule} data-red-anchor="hero" aria-hidden="true" />
      <div className={styles.heroBottom}><p>I like making things and figuring out<br />why they don’t work yet.</p><a href="#about">Scroll to look closer <span>↓</span></a><span>What happens if I try this?</span></div>
    </section>
    <section tabIndex={-1} id="about" className={styles.about} data-chapter="about">
      <div className={styles.sectionLabel} data-reveal><span>01 / A bit about me</span><span>Following the question.</span></div>
      <figure className={styles.portrait}><TrackedMedia src="/media/personal/aditya-standing-900.webp" small="/media/personal/aditya-standing-450.webp" alt="Aditya in a pink-red striped shirt, standing with blue sky and the city behind him." kind="portrait" width={899} height={1599} eager /><figcaption>Aditya.</figcaption><span data-red-anchor="about" className={styles.portraitEdge} aria-hidden="true" /></figure>
      <div className={styles.aboutHeading} data-reveal data-spatial><h2><span data-occlude="portrait"><MotionLine>I’m Aditya.</MotionLine></span><MotionLine>I tend to follow</MotionLine><MotionLine><em>the question.</em></MotionLine></h2></div>
      <div className={styles.aboutCopy} data-reveal><p>Usually it starts with something small. A tool that could work differently. An awkward interaction. A problem I can’t leave alone.</p><p>I get an idea into code, see where it breaks, and try another version. That’s taken me into AI agents, browsers, and creative tools.</p><a href={links[1].href} target="_blank" rel="noreferrer">Follow the unfinished bits ↗</a></div>
      <div className={styles.aboutFoot} data-reveal><span>Curiosity tends to leave a trail.</span><a href="#work">A few things along the way ↓</a></div>
    </section>
    <section tabIndex={-1} id="work" className={styles.work} data-chapter="work">
      <div className={styles.workHeading} data-reveal data-spatial><span className={styles.label}>02 / Selected work</span><h2><MotionLine><span data-flow-clear>Some things</span></MotionLine><MotionLine><em data-flow-clear>made it out.</em></MotionLine></h2><span className={styles.workRule} data-red-anchor="work" aria-hidden="true" /></div>
      {featuredWork.map((item, index) => <article key={item.id} className={styles.project} data-project={item.id}>
        <div className={styles.projectInfo} data-reveal data-spatial><span className={styles.label}>{String(index + 1).padStart(2, "0")} / {item.descriptor}</span><h3><MotionLine>{item.name}</MotionLine></h3><p>{item.description}</p><a href={item.href} target="_blank" rel="noreferrer">Explore the repository <span>↗</span></a>{item.visual?.credit && <a className={styles.mediaCredit} href={item.visual.creditHref} target="_blank" rel="noreferrer">{item.visual.credit}</a>}</div>
<a className={styles.projectMedia} href={item.href} aria-label={`View ${item.name}`} target="_blank" rel="noreferrer"><TrackedMedia src={item.visual?.src || `/media/work/${item.id}.webp`} alt={item.visual?.alt || `${item.name} project interface`} kind="project" eager={index === 0} width={1440} height={1000} /><span className={styles.imageAction}>Look closer +</span></a>
      </article>)}
    </section>
    <section className={styles.interlude} data-chapter="interlude" aria-label="Personal photograph">
      <div className={styles.interludeCaption} data-reveal><span className={styles.label}>03 / Between things</span><p><MotionLine>Taking</MotionLine><MotionLine><em>a minute.</em></MotionLine></p></div>
      <figure className={styles.secondPortrait}><TrackedMedia src="/media/personal/aditya-open-900.webp" small="/media/personal/aditya-open-450.webp" alt="Aditya wearing his striped pink-red shirt and a dark jacket, with arms open and a cityscape behind him." kind="interlude" width={899} height={1599} /><span className={styles.interludeRule} data-red-anchor="interlude" aria-hidden="true" /></figure>
    </section>
<section tabIndex={-1} id="lately" className={styles.lately} data-chapter="lately"><div data-reveal><span className={styles.label}>04 / Lately</span><h2>Still asking.</h2></div><span className={styles.latelyRule} data-red-anchor="lately" aria-hidden="true" /><div className={styles.experiments}>{experiments.map((item, index) => <a key={item.title} href={item.href} target="_blank" rel="noreferrer" data-reveal data-experiment><span className={styles.label}>0{index + 1} / {item.label}</span><h3>{item.title}</h3><span className={styles.experimentArrow}>↗</span><span className={styles.experimentLine} aria-hidden="true" /></a>)}</div></section>
    <footer tabIndex={-1} id="contact" className={styles.contact} data-chapter="contact"><span className={styles.label} data-reveal>05 / Something on your mind?</span><a href={links[0].href} className={styles.sayHi} data-reveal>Say hi.<span>↗</span></a><span className={styles.contactRule} data-red-anchor="contact" aria-hidden="true" /><div className={styles.footerLine}><span>Aditya Gayal</span><div>{links.map(link => <a key={link.id} href={link.href} target={link.id === "email" ? undefined : "_blank"} rel="noreferrer">{link.label} ↗</a>)}</div><a href="#hero-title">Back up ↑</a></div></footer>
  </main>;
}
