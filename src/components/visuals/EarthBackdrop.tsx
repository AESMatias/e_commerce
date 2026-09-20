"use client";

import { useEffect, useRef } from "react";
import styles from "./EarthBackdrop.module.css";

const SCROLL_STEP_PX = 13.33;

/**
 * Fixed Earth backdrop (NASA imagery) that drifts and turns on its axis as
 * the page scrolls.
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
    let lastStep = -1;

    const update = () => {
      frame = 0;
      const step = Math.round(window.scrollY / SCROLL_STEP_PX);
      if (step === lastStep) return;
      lastStep = step;
      const quantizedScrollY = step * SCROLL_STEP_PX;
      const progress = quantizedScrollY / Math.max(window.innerHeight, 1);
      layer.style.setProperty("--parallax", `${Math.min(progress, 6).toFixed(3)}`);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      lastStep = -1;
      onScroll();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.layer} ref={layerRef}>
        <div className={styles.earthLight} />
      </div>
      <div className={styles.veil} />
      {/* The load bloom: a white core opens at the centre, then a blue ring
          carries the light out to the edges and fades away. */}
      <div className={styles.bloomCore} />
      <div className={styles.bloomRing} />
    </div>
  );
}
