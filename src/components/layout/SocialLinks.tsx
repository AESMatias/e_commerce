"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import styles from "./SocialLinks.module.css";

const GITHUB_PATH =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z";

const X_PATH =
  "M12.6 0h2.45l-5.36 6.13L16 16h-4.94l-3.87-5.06L2.76 16H.31l5.73-6.55L0 0h5.06l3.5 4.63L12.6 0Zm-.86 14.54h1.36L4.32 1.38H2.87l8.87 13.16Z";

const DISCORD_PATH =
  "M13.55 2.93A13.2 13.2 0 0 0 10.3 2c-.14.25-.3.59-.42.86a12.3 12.3 0 0 0-3.66 0A9.5 9.5 0 0 0 5.8 2c-1.13.19-2.22.53-3.24.93C.5 6.05-.07 9.09.21 12.09A13.3 13.3 0 0 0 4.24 14c.33-.44.62-.91.87-1.4-.48-.18-.93-.4-1.36-.66.11-.08.22-.17.33-.26a9.5 9.5 0 0 0 8.08 0l.33.26c-.43.26-.89.48-1.37.66.25.49.54.96.87 1.4a13.2 13.2 0 0 0 4.03-1.91c.33-3.48-.57-6.49-2.47-9.16ZM5.35 10.26c-.79 0-1.44-.72-1.44-1.6 0-.89.63-1.61 1.44-1.61.8 0 1.45.72 1.44 1.6 0 .89-.64 1.61-1.44 1.61Zm5.3 0c-.79 0-1.44-.72-1.44-1.6 0-.89.63-1.61 1.44-1.61.8 0 1.45.72 1.44 1.6 0 .89-.64 1.61-1.44 1.61Z";

const FACEBOOK_PATH =
  "M9.6 8.9H8.2V16H5.25V8.9H4V6.4h1.25V4.8C5.25 3.65 5.8 2 8.25 2L10.45 2.01v2.43H8.85c-.26 0-.65.13-.65.68v1.28h2.3L10.2 8.9Z";

function Icon({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/**
 * The three accounts, all under the same handle. Discord has no public profile
 * URL for a username, so that one copies the handle instead of linking out.
 */
export function SocialLinks({ handle, labels }: { handle: string; labels: Dictionary["social"] }) {
  const [copied, setCopied] = useState(false);

  async function copyDiscord() {
    try {
      await navigator.clipboard.writeText(handle);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <ul role="list" className={styles.list}>
      <li>
        <a
          className={styles.link}
          href={`https://github.com/${handle}`}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${handle} ${labels.github}`}
        >
          <Icon path={GITHUB_PATH} />
        </a>
      </li>
      <li>
        <a
          className={styles.link}
          href={`https://x.com/${handle}`}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${handle} ${labels.x}`}
        >
          <Icon path={X_PATH} />
        </a>
      </li>
      <li>
        <a
          className={styles.link}
          href="https://www.facebook.com/profile.php?id=61594707801072"
          target="_blank"
          rel="noreferrer noopener"
          aria-label={labels.facebook}
        >
          <Icon path={FACEBOOK_PATH} />
        </a>
      </li>
      <li>
        <button
          type="button"
          className={styles.link}
          onClick={copyDiscord}
          aria-label={`${labels.copyDiscord} ${handle}`}
        >
          <Icon path={DISCORD_PATH} />
          <span className={styles.tooltip}>{copied ? labels.copied : handle}</span>
        </button>
      </li>
    </ul>
  );
}
