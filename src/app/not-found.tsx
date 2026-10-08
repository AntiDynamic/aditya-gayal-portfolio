export default function NotFound() {
  return <main className="recovery">
    <span>404</span>
    <h1>Nothing here.</h1>
    <p>The address may have changed. The portfolio is still here.</p>
    <Link href="/?portfolio" prefetch={false}>Open the portfolio ↗</Link>
  </main>;
}
import Link from "next/link";
