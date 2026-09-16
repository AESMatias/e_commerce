"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

/** Height of the shrunken bar, plus a little air. */
const HEADER_OFFSET = 72;

/** Anything closer than this is not worth a second move. */
const TOLERANCE = 6;

/**
 * Brings the section's content to rest just under the bar.
 *
 * It measures twice: the bar shrinks while the page is moving, and the
 * sections resize with it, so the first move always lands a few dozen pixels
 * short. The correction runs once the browser says the scroll has settled.
 */
function scrollToContent(section: Element): void {
  const content = section.firstElementChild ?? section;

  const move = () => {
    const delta = content.getBoundingClientRect().top - HEADER_OFFSET;
    if (Math.abs(delta) > TOLERANCE) {
      window.scrollBy({ top: delta, behavior: "smooth" });
    }
  };

  move();

  let corrected = false;
  const correct = () => {
    if (corrected) return;
    corrected = true;
    window.removeEventListener("scrollend", correct);
    move();
  };

  // "scrollend" fires when a smooth scroll finishes; the timer covers the
  // browsers that do not support it yet.
  window.addEventListener("scrollend", correct, { once: true });
  window.setTimeout(correct, 700);
}

/**
 * Anchor links that glide instead of jumping.
 *
 * On the page that owns the section we scroll it into view ourselves, which
 * honours the browser's smooth behaviour and leaves the address bar tidy.
 * From any other page it falls back to a normal navigation.
 */
export function HashLink({
  href,
  className,
  children,
}: {
  /** Of the form "/#section". */
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [path, hash] = href.split("#");
  const isSamePage = (path === "/" ? "/" : path?.replace(/\/$/, "")) === pathname;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isSamePage || !hash) return;

    const section = document.getElementById(hash);
    if (!section) return;

    event.preventDefault();
    scrollToContent(section);
    window.history.replaceState(null, "", `#${hash}`);
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
