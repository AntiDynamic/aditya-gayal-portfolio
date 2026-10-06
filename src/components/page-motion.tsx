"use client";

import { useEffect } from "react";
import { useEntranceActive } from "./entrance/entrance-context";

const sectionsForNavigation: Record<string, string> = {
  thinking: "thinking",
  curiosity: "thinking",
  now: "now",
  building: "thinking",
  collaboration: "thinking",
  work: "work",
  contact: "contact",
};

export function PageMotion() {
  const entranceActive = useEntranceActive();
  useEffect(() => {
    if (entranceActive) return;
    // Scene mechanics carry motion. Reading never waits for a generic entrance effect.
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".site-nav a[href^='#']"));
    const navSections = Object.keys(sectionsForNavigation)
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const navigationObserver = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          const current = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];

          if (!current) return;
          const activeSection = sectionsForNavigation[(current.target as HTMLElement).id];
          navLinks.forEach((link) => {
            if (link.hash === `#${activeSection}`) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }, { rootMargin: "-38% 0px -38% 0px", threshold: 0 })
      : undefined;

    navSections.forEach((section) => navigationObserver?.observe(section));

    return () => {
      navigationObserver?.disconnect();
    };
  }, [entranceActive]);

  return null;
}
