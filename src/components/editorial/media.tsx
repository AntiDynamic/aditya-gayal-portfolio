import styles from "./editorial.module.css";

type Props = { src: string; alt: string; kind: "portrait" | "interlude" | "project"; width: number; height: number; small?: string; eager?: boolean };

export function TrackedMedia({ src, alt, kind, width, height, small, eager = false }: Props) {
  return <div className={styles.media} data-media={kind}>
    <picture>{small && <source srcSet={`${small} 450w, ${src} 900w`} sizes="(max-width: 700px) 85vw, 45vw" />}<Image unoptimized src={src} width={width} height={height} alt={alt} loading="eager" fetchPriority={eager ? "high" : "auto"} decoding="async" /></picture>
  </div>;
}
import Image from "next/image";
