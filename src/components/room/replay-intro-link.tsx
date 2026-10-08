"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function ReplayIntroLink({ className, children }: { className?: string; children: ReactNode }) {
  const href = "/?replay=1&motion=full";
  return <Link href={href} prefetch={false} className={className} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, "", href);
    location.reload();
  }}>{children}</Link>;
}
