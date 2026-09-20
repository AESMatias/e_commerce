"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Reveal.module.css";

type Direction = "left" | "right" | "up" | "up3d";

/**
 * Reveals its children the first time they scroll into view: text slides in
 * from one side, cards rise and tip forward out of the page.
 *
 * It only ever reveals — once shown, the element stays put, so scrolling
 * back up does not replay the section. Reduced motion is handled in the
 * stylesheet, which keeps everything visible from the start.
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  from?: Direction;
  /** Milliseconds, used to stagger a row of cards. */
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (delay) node.style.setProperty("--reveal-delay", `${delay}ms`);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setShown(true);
          observer.disconnect();
        }
      },
      // A little inside the viewport, so nothing animates at the very edge
      // of the screen where it would be missed.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={cx(styles.reveal, styles[from], className)} data-shown={shown ? "true" : undefined}>
      {children}
    </Tag>
  );
}
