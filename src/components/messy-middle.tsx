import { DestructionLab } from "@/components/build-sequence";

export function MessyMiddle() {
  return (
    <section className="messy-section" id="building" aria-labelledby="messy-title">
      <div className="messy-inner">
        <div className="messy-mark" data-enter="notation">
          <span>A BUILDING NOTE</span>
          <span>Some attempts are only useful because they fail.</span>
        </div>

        <div className="messy-heading">
          <h2 id="messy-title" data-enter="slice">I LIKE THE<br /><span>MESSY MIDDLE.</span></h2>
          <p data-enter="lift">The snag is annoying for a minute. Then it becomes a clue. I like staying with it until the idea holds up.</p>
        </div>

        <p className="messy-invitation" data-enter="notation">BREAK SOMETHING. SEE WHAT IT WAS HOLDING TOGETHER.</p>
        <DestructionLab />
      </div>
    </section>
  );
}
