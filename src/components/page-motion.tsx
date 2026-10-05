"use client";

import { useEffect } from "react";

const sectionsForNavigation: Record<string, string> = {
  thinking: "thinking",
  now: "now",
  building: "thinking",
  collaboration: "thinking",
  work: "work",
  contact: "contact",
};

export function PageMotion() {
  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-enter]"));
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const alreadyRevealed = new WeakSet<HTMLElement>();
    let revealObserver: IntersectionObserver | undefined;

    const showEverything = () => {
      revealObserver?.disconnect();
      document.documentElement.classList.remove("has-enter-motion");
      revealItems.forEach((item) => {
        item.dataset.enterState = "shown";
        alreadyRevealed.add(item);
      });
    };

    const prepareReveals = () => {
      revealObserver?.disconnect();
      if (motionPreference.matches || !("IntersectionObserver" in window)) {
        showEverything();
        return;
      }

      const pending: HTMLElement[] = [];
      revealItems.forEach((item) => {
        const bounds = item.getBoundingClientRect();
        const alreadyVisible = alreadyRevealed.has(item) || (bounds.top < window.innerHeight * 0.92 && bounds.bottom > 0);
        item.dataset.enterState = alreadyVisible ? "shown" : "waiting";
        if (alreadyVisible) alreadyRevealed.add(item);
        if (!alreadyVisible) pending.push(item);
      });

      document.documentElement.classList.add("has-enter-motion");
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const item = entry.target as HTMLElement;
          item.dataset.enterState = "shown";
          alreadyRevealed.add(item);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });

      pending.forEach((item) => revealObserver?.observe(item));
    };

    prepareReveals();
    motionPreference.addEventListener("change", prepareReveals);

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
      revealObserver?.disconnect();
      navigationObserver?.disconnect();
      motionPreference.removeEventListener("change", prepareReveals);
      document.documentElement.classList.remove("has-enter-motion");
    };
  }, []);

  return null;
}
