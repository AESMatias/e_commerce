"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./EarthHero.module.css";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const SCROLL_STEP_PX = 16;

/**
 * The hero's stage: a window onto space with the Earth's horizon rising from
 * the bottom. On load the planet spins up from small while a flash of light
 * opens over it; scrolling down keeps it turning and growing, night falls,
 * the cities light up and satellites drift in.
 *
 * The component only publishes --p, from 0 (page top) to 1 (hero scrolled
 * away); every effect is derived from it in CSS.
 */
export function EarthHero({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let lastStep = -1;

    const update = () => {
      frame = 0;
      const step = Math.round(window.scrollY / SCROLL_STEP_PX);
      if (step === lastStep) return;
      lastStep = step;
      const quantizedScrollY = step * SCROLL_STEP_PX;
      const p = clamp(quantizedScrollY / Math.max(stage.offsetHeight, 1), 0, 1);
      stage.style.setProperty("--p", p.toFixed(4));
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
    <div ref={ref} className={cx(styles.stage, className)}>
      <div className={styles.stars} aria-hidden="true" />

      <div className={styles.globe} aria-hidden="true">
        <div className={styles.day} />
        <div className={styles.shade} />
      </div>

      <div className={styles.satellites} aria-hidden="true">
        <Satellite className={styles.satelliteA} />
        <Satellite className={styles.satelliteB} />
      </div>

      {/* The load flash, like the page's own, repeated here because the stage
          is opaque and would hide the one behind it. */}
      <div className={styles.bloomCore} aria-hidden="true" />
      <div className={styles.bloomRing} aria-hidden="true" />

      <div className={styles.content}>{children}</div>
    </div>
  );
}

function Satellite({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 72 32" width="72" height="32">
      <g fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1">
        <rect x="1" y="9" width="22" height="14" rx="1.5" />
        <rect x="49" y="9" width="22" height="14" rx="1.5" />
      </g>
      <g stroke="#60a5fa" strokeWidth="0.8">
        <path d="M8 9v14M15 9v14M56 9v14M63 9v14M1 16h22M49 16h22" />
      </g>
      <path d="M23 16h5M44 16h5" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="28" y="8" width="16" height="16" rx="3" fill="#e2e8f0" />
      <rect x="31" y="11" width="10" height="4" rx="1" fill="#94a3b8" />
      <path d="M36 8V2" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle className={styles.beacon} cx="36" cy="2" r="2" fill="#f87171" />
    </svg>
  );
}
