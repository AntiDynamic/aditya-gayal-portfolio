import { CuriosityConnections } from "@/components/curiosity-connections";

export function CuriosityField() {
  return (
    <section className="curiosity-section" id="curiosity" aria-labelledby="curiosity-title">
      <div className="curiosity-inner">
        <div className="curiosity-mark" data-enter="notation">
          <span>OPEN TABS — NOT ALL OF THEM STAY OPEN</span>
          <span>THINGS I KEEP COMING BACK TO</span>
        </div>

        <div className="curiosity-heading">
          <h2 id="curiosity-title" data-enter="slice">
            <span>MY BRAIN HAS</span>
            <span>TOO MANY</span>
            <span>TABS OPEN.</span>
          </h2>
          <p data-enter="lift">AI, agents, tools, browsers, cities. I keep wondering what happens when these systems bump into each other — and the people using them.</p>
        </div>

        <div data-enter="settle"><CuriosityConnections /></div>
      </div>
    </section>
  );
}
