"use client";

import styles from "./ThemeToggle.module.css";

// Renamed when light became the default, so choices saved under the old
// dark-by-default key do not keep returning visitors on dark.
export const THEME_STORAGE_KEY = "wholeheartedly-theme";

/**
 * Sets data-theme on <html> before the page paints. Light is the default, so
 * only a visitor who picked dark gets dark. Inlined in the root layout.
 */
export const themeInitScript = `
try {
  var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  document.documentElement.dataset.theme = stored === "dark" ? "dark" : "light";
} catch (error) {
  document.documentElement.dataset.theme = "light";
}
`;

export function ThemeToggle({ className }: { className?: string }) {
  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing or blocked storage: the choice just won't be remembered.
    }
  }

  return (
    <button
      type="button"
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      onClick={toggleTheme}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
    >
      {/* Both icons are rendered; CSS shows the one matching the active theme,
          which keeps the button identical on the server and after hydration. */}
      <svg className={styles.sun} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <svg className={styles.moon} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
