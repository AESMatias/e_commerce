"use client";

import { useEffect, useRef } from "react";
import { cx } from "@/lib/cx";
import styles from "./FloatingObject.module.css";

type FloatingObjectProps = {
  name: "robot" | "parcel";
  className?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * A small decorative object that sits in the content, next to a section
 * title, and turns in 2.5D as the page scrolls. The artwork is inline SVG so
 * hovering can animate its parts: the robot squints and lights its antenna,
 * the parcel opens its lid. While the AI advisor is answering, the robot's
 * antenna pulses; that is pure CSS, keyed off the chat's own data-busy flag.
 *
 * Once per frame the section's travel through the viewport is written to the
 * element as --p, from -1 (below the screen) to 1 (above it), and --ap, its
 * absolute value; the stylesheet turns them into each object's motion.
 */
export function FloatingObject({ name, className }: FloatingObjectProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const section = element?.closest("section");
    if (!element || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const half = window.innerHeight / 2;
      const p = clamp((half - (rect.top + rect.height / 2)) / (half + rect.height / 2), -1, 1);
      element.style.setProperty("--p", p.toFixed(4));
      element.style.setProperty("--ap", Math.abs(p).toFixed(4));
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
    <div ref={ref} className={cx(styles.object, className)} data-name={name} aria-hidden="true">
      {/* A soft glow that moves at half speed: a second layer for depth. */}
      <div className={styles.glow} />
      <div className={styles.mover}>
        {name === "robot" ? <RobotArt /> : <ParcelArt />}
      </div>
    </div>
  );
}

/* Drawn nose up in a 240 × 240 box. Ids are prefixed: they are global to the page. */
function RobotArt() {
  return (
    <svg className={styles.art} viewBox="0 0 240 240">
      <defs>
        <linearGradient id="robot-shell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbe6fb" />
        </linearGradient>
        <linearGradient id="robot-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1b4d" />
          <stop offset="1" stopColor="#1d3a8f" />
        </linearGradient>
        <radialGradient id="robot-jet" cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#93c5fd" stopOpacity="0.9" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="robot-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fde68a" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="212" rx="46" ry="18" fill="url(#robot-jet)">
        <animate attributeName="rx" values="46;38;46" dur="2.4s" repeatCount="indefinite" />
      </ellipse>

      {/* Antenna: the bulb lights up and grows on hover. */}
      <line x1="120" y1="30" x2="120" y2="62" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" />
      <circle className={styles.halo} cx="120" cy="22" r="30" fill="url(#robot-halo)" />
      <circle className={styles.bulb} cx="120" cy="22" r="13" fill="#3b82f6">
        <animate attributeName="opacity" values="1;0.6;1" dur="1.6s" repeatCount="indefinite" />
      </circle>

      <rect x="28" y="96" width="22" height="50" rx="10" fill="#93c5fd" />
      <rect x="190" y="96" width="22" height="50" rx="10" fill="#93c5fd" />

      <rect x="44" y="60" width="152" height="124" rx="40" fill="url(#robot-shell)" stroke="#bfd2f5" strokeWidth="2" />
      <rect x="62" y="78" width="116" height="84" rx="28" fill="url(#robot-face)" />

      {/* Eyes: blink on their own, squint on hover. */}
      <g className={styles.eyes} fill="#60a5fa">
        <ellipse cx="96" cy="114" rx="11" ry="14">
          <animate attributeName="ry" values="14;14;1.5;14;14" keyTimes="0;0.9;0.94;0.98;1" dur="4s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="144" cy="114" rx="11" ry="14">
          <animate attributeName="ry" values="14;14;1.5;14;14" keyTimes="0;0.9;0.94;0.98;1" dur="4s" repeatCount="indefinite" />
        </ellipse>
      </g>
      <path d="M100 140 q20 14 40 0" fill="none" stroke="#93c5fd" strokeWidth="6" strokeLinecap="round" />

      <g transform="translate(168 30)">
        <rect width="58" height="40" rx="14" fill="#2f6bff" />
        <path d="M10 40 l-6 12 l18 -12z" fill="#2f6bff" />
        <circle cx="17" cy="20" r="4.5" fill="#fff" />
        <circle cx="29" cy="20" r="4.5" fill="#fff" fillOpacity="0.8" />
        <circle cx="41" cy="20" r="4.5" fill="#fff" fillOpacity="0.6" />
      </g>
    </svg>
  );
}

const SPARKLE = "M0 -14 l5 9 l9 5 l-9 5 l-5 9 l-5 -9 l-9 -5 l9 -5z";

function ParcelArt() {
  return (
    <svg className={styles.art} viewBox="0 0 240 240">
      <defs>
        <radialGradient id="parcel-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1d4ed8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="212" rx="70" ry="14" fill="url(#parcel-shadow)" />

      <g transform="translate(120 112)">
        {/* The open box: its dark inside shows once the lid lifts. */}
        <path d="M0 -70 L86 -27 L0 16 L-86 -27 Z" fill="#92400e" />
        <path d="M0 -58 L62 -27 L0 4 L-62 -27 Z" fill="#78350f" />
        <path d="M-86 -27 L0 16 L0 104 L-86 61 Z" fill="#f59e0b" />
        <path d="M86 -27 L0 16 L0 104 L86 61 Z" fill="#fbbf24" />
        <path d="M42 -5 L42 83 L30 77 L30 -11 Z" fill="#fcd34d" />
        <path d="M-70 10 L-26 32 L-26 58 L-70 36 Z" fill="#fff" fillOpacity="0.85" />
        <path d="M-64 22 L-34 37" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <path d="M-64 32 L-42 43" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

        {/* Lid, hinged on its left corner. */}
        <g className={styles.lid}>
          <path d="M0 -70 L86 -27 L0 16 L-86 -27 Z" fill="#fef3c7" />
          <path d="M-44 -48 L42 -5 L42 17 L-44 -26 Z" fill="#fde68a" />
        </g>
      </g>

      <g transform="translate(186 52)">
        <circle r="26" fill="#2f6bff" />
        <path d="M-11 1 l7 7 l15 -16" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Sparkles: always visible, brighter and joined by more on hover. */}
      <g>
        <path d={SPARKLE} transform="translate(44 54)" fill="#2f6bff">
          <animate attributeName="opacity" values="1;0.45;1" dur="2s" repeatCount="indefinite" />
        </path>
        <path d={SPARKLE} transform="translate(212 150) scale(0.8)" fill="#f59e0b">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.6s" repeatCount="indefinite" />
        </path>
        {/* Placed by the group, so the hover transform does not replace the position. */}
        <g transform="translate(224 104) scale(0.9)">
          <path className={styles.extraSparkle} d={SPARKLE} fill="#f59e0b" />
        </g>
        <g transform="translate(30 150) scale(0.7)">
          <path className={styles.extraSparkle} d={SPARKLE} fill="#2f6bff" />
        </g>
      </g>
    </svg>
  );
}
