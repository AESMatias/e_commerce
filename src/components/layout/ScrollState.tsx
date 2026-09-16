"use client";

import { useEffect } from "react";

/** Nothing happens for the first few pixels, so a nudge does not disturb the bar. */
const START_AT = 64;

/**
 * How long the change takes, as a share of the viewport height, clamped so it
 * always completes well within one screen — short pages included.
 */
const TRAVEL_SCREENS = 0.32;
const TRAVEL_MIN = 160;
const TRAVEL_MAX = 320;

/**
 * Publishes how far the page has scrolled as --bar-progress (0 to 1) on
 * <html>, so the header can shrink and change colour in step with the scroll
 * instead of snapping at a threshold. Updated once per frame.
 */
export function ScrollState() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const apply = () => {
      frame = 0;
      // Never ask for more scroll than the page has: on a short page the
      // change has to be done by the time you reach the bottom.
      const scrollable = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const travel = Math.max(
        Math.min(window.innerHeight * TRAVEL_SCREENS, TRAVEL_MAX, scrollable * 0.45),
        Math.min(TRAVEL_MIN, scrollable),
      );
      const progress = Math.min(Math.max((window.scrollY - START_AT) / travel, 0), 1);
      root.style.setProperty("--bar-progress", progress.toFixed(4));
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      root.style.removeProperty("--bar-progress");
    };
  }, []);

  return null;
}
