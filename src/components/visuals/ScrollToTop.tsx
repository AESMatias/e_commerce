"use client";

import { useEffect } from "react";

/**
 * Browsers restore the previous scroll position on reload, which drops the
 * visitor halfway down the page and past the opening animation. This pins a
 * reload to the top, unless the URL points at a specific section.
 */
export function ScrollToTop() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return null;
}
