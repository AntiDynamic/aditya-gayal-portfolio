"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./interactions.module.css";

type Media = { src: string; alt: string; title: string; href?: string; bounds: DOMRect; width: number; height: number };

export function MediaViewer() {
  const dialog = useRef<HTMLDialogElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [media, setMedia] = useState<Media | null>(null);
  const closing = useRef(false);
  const reduced = () => dialog.current?.closest<HTMLElement>("[data-editorial]")?.dataset.reduced === "true";
  const close = () => {
    if (!dialog.current || closing.current) return;
    closing.current = true;
    const finish = () => { dialog.current?.close(); opener.current?.focus({ preventScroll: true }); closing.current = false; };
    if (reduced()) finish();
    else {
      const target = image.current?.getBoundingClientRect();
      const bounds = media?.bounds;
      const translation = target && bounds ? `translate(${bounds.x + bounds.width / 2 - target.x - target.width / 2}px,${bounds.y + bounds.height / 2 - target.y - target.height / 2}px) scale(${bounds.width / target.width},${bounds.height / target.height})` : "none";
      const animation = image.current?.animate([{ transform: "none", opacity: 1 }, { transform: translation, opacity: 0.35 }], { duration: 420, easing: "cubic-bezier(.4,0,.2,1)" }) ?? dialog.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-out" });
      void animation.finished.then(finish).catch(finish);
    }
  };
  useEffect(() => {
    const root = dialog.current?.closest("[data-editorial]");
    if (!root) return;
    const open = (event: Event) => {
      const click = event as MouseEvent;
      if (click.defaultPrevented || click.button !== 0 || click.ctrlKey || click.metaKey || click.shiftKey || click.altKey) return;
      const target = click.target instanceof Element ? click.target.closest<HTMLElement>("[data-project] a:has([data-media]), [data-photo-zoom]") : null;
      const source = target?.matches("[data-photo-zoom]") ? target.closest("figure")?.querySelector<HTMLImageElement>("img") : target?.querySelector<HTMLImageElement>("img");
      if (!source || !source.complete || !source.naturalWidth || !target) return;
      click.preventDefault();
      opener.current = target;
      setMedia({ src: source.currentSrc, alt: source.alt, title: target.closest("[data-project]")?.querySelector("h3")?.textContent || "Photograph", href: target instanceof HTMLAnchorElement ? target.href : undefined, bounds: source.getBoundingClientRect(), width: source.naturalWidth, height: source.naturalHeight });
    };
    root.addEventListener("click", open);
    return () => root.removeEventListener("click", open);
  }, []);
  useEffect(() => {
    if (!media || !dialog.current || !image.current) return;
    dialog.current.showModal();
    if (reduced()) return;
    const target = image.current.getBoundingClientRect();
    if (!target.width || !target.height) return;
    const deltaX = media.bounds.x + media.bounds.width / 2 - target.x - target.width / 2;
    const deltaY = media.bounds.y + media.bounds.height / 2 - target.y - target.height / 2;
    image.current.animate([
      { transform: `translate(${deltaX}px,${deltaY}px) scale(${media.bounds.width / target.width},${media.bounds.height / target.height})` },
      { transform: "translate(0,0) scale(1)" },
    ], { duration: 650, easing: "cubic-bezier(.16,1,.3,1)" });
  }, [media]);
  return <dialog ref={dialog} className={styles.viewer} data-portfolio-viewer data-lenis-prevent aria-labelledby="media-viewer-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
    <div className={styles.viewerBar}><h2 id="media-viewer-title">{media?.title}</h2><button type="button" onClick={close} autoFocus>Close ×</button></div>
    {media && <Image unoptimized ref={image} src={media.src} alt={media.alt} width={media.width} height={media.height} />}
    <div className={styles.viewerFoot}><span>Escape to go back</span>{media?.href && <a href={media.href} target="_blank" rel="noreferrer">Explore the repository ↗</a>}</div>
  </dialog>;
}
