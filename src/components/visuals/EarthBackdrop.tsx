"use client";

import { useEffect, useRef } from "react";
import styles from "./EarthBackdrop.module.css";

/**
 * Fixed Earth backdrop (NASA imagery) that drifts as the page scrolls.
 *
 * The parallax is written to a CSS custom property from a rAF-throttled
 * scroll listener rather than a scroll-driven animation, so it behaves the
 * same in every browser. It is skipped entirely when the visitor asked for
 * reduced motion.
 */
export function EarthBackdrop() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = window.scrollY / Math.max(window.innerHeight, 1);
      layer.style.setProperty("--parallax", `${Math.min(progress, 6).toFixed(3)}`);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.layer} ref={layerRef}>
        <div className={styles.earthLight} />
        <div className={styles.earthDark} />
      </div>
      <div className={styles.veil} />
      {/* The load bloom: a white core opens at the centre, then a blue ring
          carries the light out to the edges and fades away. */}
      <div className={styles.bloomCore} />
      <div className={styles.bloomRing} />
    </div>
  );
}
