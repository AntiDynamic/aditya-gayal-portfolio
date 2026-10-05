import { CollaborationSwitch } from "@/components/collaboration-switch";

export function CollaborationField() {
  return (
    <section className="collaboration-section" id="collaboration" aria-labelledby="collaboration-title">
      <div className="collaboration-inner">
        <div className="collaboration-mark" data-enter="notation">
          <span>BETTER IN GOOD COMPANY</span>
          <span>Another perspective can change the shape of an idea.</span>
        </div>

        <div className="collaboration-intro">
          <h2 id="collaboration-title" data-enter="slice">SOMEONE ELSE CAN SEE WHAT I’M TOO CLOSE TO SEE.</h2>
          <p data-enter="lift">
            I like building with other people because another perspective can change the question—not just help answer it. A good idea gets better when someone sees a way through that I missed.
          </p>
        </div>

        <div data-enter="trace"><CollaborationSwitch /></div>
      </div>
    </section>
  );
}
