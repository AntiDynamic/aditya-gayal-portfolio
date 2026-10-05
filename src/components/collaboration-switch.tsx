"use client";

import { useState } from "react";

export function CollaborationSwitch() {
  const [shared, setShared] = useState(false);

  return (
    <div className="collaboration-piece" data-shared={shared}>
      <svg className="collaboration-drawing" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" className="collaboration-route collaboration-route-first" d="M48 246 C178 239 236 204 322 111 L444 111" />
        <path pathLength="1" className="collaboration-route collaboration-route-join" d="M444 111 C556 111 543 272 682 272 C790 272 794 157 954 144" />
        <path pathLength="1" className="collaboration-route collaboration-route-shared" d="M48 246 C184 242 242 225 322 160 C407 91 487 91 550 151 S628 271 716 272 C818 274 821 157 954 144" />
        <path className="collaboration-cut collaboration-cut-a" d="M418 98 l34 13 -34 13 -23 -13Z" />
        <path className="collaboration-cut collaboration-cut-b" d="M482 210 l26 -22 27 26 -29 20Z" />
        <circle className="collaboration-joint" cx="444" cy="111" r="9" />
        <path className="collaboration-pencil" d="M504 56l33-15m-28 21 33-15" />
      </svg>

      <div className="collaboration-note collaboration-note-first">
        <span>MY FIRST PASS</span>
        <p>fix the visible end</p>
      </div>
      <div className="collaboration-note collaboration-note-second">
        <span>ANOTHER WAY IN</span>
        <p>look a little further upstream</p>
      </div>

      <div className="collaboration-action">
        <p aria-live="polite" aria-atomic="true">
          {shared ? "The route changed. That’s the point." : "One path ends here. Another can begin somewhere else."}
        </p>
        <button className="collaboration-button" type="button" aria-pressed={shared} onClick={() => setShared((value) => !value)}>
          {shared ? "Return to the first pass" : "Let another angle in"}
          <span aria-hidden="true">{shared ? "↶" : "↗"}</span>
        </button>
      </div>
    </div>
  );
}
