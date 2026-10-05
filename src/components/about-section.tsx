import { QuestionBranches } from "@/components/question-branches";

const github = "https://github.com/AntiDynamic";
const linkedin = "https://in.linkedin.com/in/adityagayal";
const email = "gayaladitya9@gmail.com";

export function AboutSection() {
  return (
    <section className="thinking-section" id="thinking" aria-labelledby="thinking-title">
      <div className="thinking-inner">
        <div className="thinking-mark" data-enter="notation">
          <p><span>STARTING POINT</span></p>
          <p>Usually the thing that feels slightly off.</p>
        </div>

        <div className="thinking-intro">
          <h2 id="thinking-title" data-enter="slice">
            I FOLLOW<br />
            <span>THE QUESTION.</span>
          </h2>

          <div className="thinking-copy" data-enter="lift">
            <p className="thinking-lede">
              I’m Aditya—a developer who loves getting an idea into code and finding out what it can become.
            </p>
            <p>
              I tend to follow the odd detail before I decide what the answer should be. Then I try it, trace the stubborn bit, and let another person’s perspective change the route.
            </p>
          </div>
        </div>

        <QuestionBranches />
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-inner">
        <div className="contact-section-mark" data-enter="notation">
          <span>ONE MORE THING</span>
          <span>THE INBOX IS OPEN</span>
        </div>
        <div className="contact-main">
          <div className="contact-copy" data-enter="slice">
            <h2 id="contact-title">Have a good “what if?”</h2>
            <p>Tell me what you’re curious about. I’m always up for talking technology, code, and ideas that might turn into something real.</p>
          </div>
          <div className="contact-links" data-enter="lift">
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
