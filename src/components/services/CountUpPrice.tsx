"use client";

import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/format";

const DURATION_MS = 1100;

/**
 * A price that counts up from zero the first time it scrolls into view. The
 * server renders the real price, so it is correct without JavaScript and for
 * search engines; screen readers always get the final value. The count is
 * written straight to the DOM, so it costs no React renders.
 */
export function CountUpPrice({ cents, currency }: { cents: number; currency: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = formatPrice(cents, currency);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    element.textContent = formatPrice(0, currency);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / DURATION_MS, 1);
          const eased = 1 - (1 - t) ** 3;
          element.textContent = formatPrice(Math.round((cents * eased) / 100) * 100, currency);
          if (t < 1) frame = window.requestAnimationFrame(tick);
        };
        frame = window.requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      element.textContent = formatPrice(cents, currency);
    };
  }, [cents, currency]);

  return <span ref={ref}>{final}</span>;
}
