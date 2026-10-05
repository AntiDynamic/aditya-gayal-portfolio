const github = "https://github.com/AntiDynamic";
const linkedin = "https://in.linkedin.com/in/adityagayal";
const email = "gayaladitya9@gmail.com";

const waysOfWorking = [
  {
    number: "01",
    title: "Follow the question",
    note: "I like exploring the odd angle before deciding what the answer should be.",
    color: "cobalt",
  },
  {
    number: "02",
    title: "Make it together",
    note: "Sharing early thoughts and listening to other perspectives makes the idea stronger.",
    color: "tomato",
  },
  {
    number: "03",
    title: "Stay for the hard part",
    note: "I keep debugging, revising, and refining until the useful idea actually works.",
    color: "saffron",
  },
];

export function AboutSection() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-inner">
        <div className="about-section-mark">
          <p><span>02</span> / THE PERSON BEHIND THE BUILDS</p>
          <p className="about-side-note">Curiosity is a good place to start.</p>
        </div>

        <div className="about-main">
          <h2 className="about-title" id="about-title">
            <span>I LOVE THE PART</span>
            <span className="about-title-offset">BETWEEN</span>
            <span className="about-question">“WHAT IF?”</span>
            <span className="about-title-ending">AND <b>“IT WORKS.”</b></span>
          </h2>

          <div className="about-story">
            <p className="about-lede">
              I’m Aditya, a developer who loves what technology makes possible. Coding is how I get my hands on an idea: test it, shape it, and find out where it can go.
            </p>
            <p>
              I like the creative part of exploring an unusual question, and I like making things with other people. Trading early thoughts, listening to a different angle, and solving the tricky bits together usually gets us somewhere better.
            </p>
            <p>
              I’m happy in the stubborn middle, too: tracing bugs, trying another route, and giving the details the time they need until the useful idea actually works.
            </p>
            <span className="about-story-signoff">curiosity → shared thinking → follow-through</span>
          </div>
        </div>

        <div className="about-working-heading">
          <span>HOW I LIKE TO WORK</span>
          <span>THREE THINGS I BRING ALONG</span>
        </div>
        <div className="about-steps-wrap">
          <svg className="about-connection" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true">
            <path d="M166 34 C246 34 284 17 365 22 S462 47 500 31 S631 14 708 27 S786 34 834 24" />
            <circle cx="166" cy="34" r="7" />
            <circle cx="500" cy="31" r="7" />
            <circle cx="834" cy="24" r="7" />
          </svg>
          <ol className="about-steps">
            {waysOfWorking.map((item) => (
              <li className={`about-step about-step-${item.color}`} key={item.number}>
                <span className="about-step-number">{item.number} / {item.color === "cobalt" ? "CURIOSITY" : item.color === "tomato" ? "TEAMWORK" : "PERSISTENCE"}</span>
                <h3>{item.title}</h3>
                <p>{item.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-inner">
        <div className="contact-section-mark">
          <span>03 / OPEN LINE</span>
          <span>IDEAS WELCOME — ESPECIALLY THE ODD ONES</span>
        </div>
        <div className="contact-main">
          <div className="contact-copy">
            <h2 id="contact-title">Have a good “what if?”</h2>
            <p>Tell me what you’re curious about. I’m always up for talking technology, code, and ideas that might turn into something real.</p>
          </div>
          <div className="contact-links">
            <a className="contact-email" href={`mailto:${email}`}>
              {email}<span aria-hidden="true">↗</span>
            </a>
            <nav className="contact-socials" aria-label="Find Aditya online">
              <a href={github} target="_blank" rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
              </a>
            </nav>
          </div>
        </div>
        <div className="contact-endline" aria-hidden="true">
          <span>ADITYA GAYAL</span>
          <span>KEEP FOLLOWING THE QUESTION <b>↗</b></span>
        </div>
      </div>
    </section>
  );
}
