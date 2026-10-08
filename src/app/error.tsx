"use client";

import Link from "next/link";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <main className="recovery">
    <h1>That didn’t load.</h1>
    <p>Try again, or open the portfolio without the prologue.</p>
    <button type="button" onClick={retry}>Try again</button>
    <Link href="/?portfolio" prefetch={false} onNavigate={event => { event.preventDefault(); window.location.assign(new URL("/?portfolio", window.location.origin).href); }}>Open the portfolio ↗</Link>
  </main>;
}
