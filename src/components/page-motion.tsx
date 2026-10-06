"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
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
    let scroll: Lenis | undefined;
    let disposed = false;
    let frame = 0;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const destroyScroll = () => {
      cancelAnimationFrame(frame);
      scroll?.destroy();
      scroll = undefined;
    };
    const tick = (time: number) => {
      scroll?.raf(time);
      if (!disposed && scroll && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && scroll) frame = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", visibility);
    const configureScroll = async () => {
      destroyScroll();
      if (preference.matches) return;
      const { default: Lenis } = await import("lenis");
      if (disposed || preference.matches || scroll) return;
      scroll = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        stopInertiaOnNavigate: true,
        // A deliberate drag owns its wheel events; ordinary touch remains native.
        prevent: (node) => Boolean(node.closest("[data-lenis-prevent]")),
      });
      frame = requestAnimationFrame(tick);
    };
    // Preserve native anchor history and keyboard focus. Lenis smooths wheel input,
    // without intercepting links, fragment navigation, touch or browser Find.
    const syncAnchor = () => {
      // A native fragment jump must replace any pending wheel destination.
      scroll?.stop();
      scroll?.start();
      scroll?.resize();
    };
    const anchorIntent = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest?.("a");
      if (anchor instanceof HTMLAnchorElement && anchor.hash &&
          anchor.origin === location.origin && anchor.pathname === location.pathname) syncAnchor();
    };
    document.addEventListener("click", anchorIntent, true);
    preference.addEventListener("change", configureScroll);
    window.addEventListener("hashchange", syncAnchor);
    void configureScroll();
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
      disposed = true;
      document.removeEventListener("visibilitychange", visibility);
      destroyScroll();
      document.removeEventListener("click", anchorIntent, true);
      preference.removeEventListener("change", configureScroll);
      window.removeEventListener("hashchange", syncAnchor);
      navigationObserver?.disconnect();
    };
  }, [entranceActive]);

  return null;
}
