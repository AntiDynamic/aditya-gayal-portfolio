import type { ReactNode } from "react";
import styles from "./editorial.module.css";

export function MotionLine({ children }: { children: ReactNode }) {
  return <span className={styles.motionLine}><span data-line-content>{children}</span></span>;
}
