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
const SCROLL_STEP_PX = 8;
const LOGO_OPACITY_STEPS = 10;

/**
 * Publishes how far the page has scrolled as --bar-progress (0 to 1) on
 * <html>, so the header can shrink and change colour in step with the scroll
 * instead of snapping at a threshold. Updated once per frame.
 */
export function ScrollState() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let lastStep = -1;
    let lastOpacityStep = -1;
    let travel = 1;

    const calculateTravel = () => {
      const scrollable = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      travel = Math.max(
        Math.min(window.innerHeight * TRAVEL_SCREENS, TRAVEL_MAX, scrollable * 0.45),
        Math.min(TRAVEL_MIN, scrollable),
      );
    };

    const apply = () => {
      frame = 0;
      const step = Math.round(window.scrollY / SCROLL_STEP_PX);
      const quantizedScrollY = step * SCROLL_STEP_PX;
      const progress = Math.min(Math.max((quantizedScrollY - START_AT) / travel, 0), 1);

      if (step !== lastStep) {
        lastStep = step;
        root.style.setProperty("--bar-progress", progress.toFixed(4));
      }

      const opacityProgress = Math.abs(2 * progress - 1);
      const opacityStep = Math.round(opacityProgress * LOGO_OPACITY_STEPS);
      if (opacityStep !== lastOpacityStep) {
        lastOpacityStep = opacityStep;
        const logoOpacity = opacityStep / LOGO_OPACITY_STEPS;
        root.style.setProperty("--logo-opacity", logoOpacity.toFixed(1));
      }
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(apply);
    };

    calculateTravel();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      calculateTravel();
      lastStep = -1;
      lastOpacityStep = -1;
      onScroll();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      root.style.removeProperty("--bar-progress");
      root.style.removeProperty("--logo-opacity");
    };
  }, []);

  return null;
}
