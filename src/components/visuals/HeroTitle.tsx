import { Fragment } from "react";
import { cx } from "@/lib/cx";
import styles from "./HeroTitle.module.css";

/**
 * Splits the heading into words so each can arrive, and be lit, on its own
 * beat. Words from `accentFrom` on keep the brand colour. Keep the heading to
 * ten words: the stagger is written as nth-child rules, not inline delays.
 */
export function HeroTitle({
  text,
  accentFrom,
  accentClassName,
  mobileBreakAfter,
  className,
}: {
  text: string;
  /** Index of the first word that should be highlighted. */
  accentFrom: number;
  accentClassName?: string;
  mobileBreakAfter?: number;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <h1 className={cx(styles.title, className)}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            className={cx(
              styles.word,
              index >= accentFrom && styles.accent,
              index >= accentFrom && accentClassName,
            )}
          >
            {word}
          </span>
          {index === mobileBreakAfter ? <br className={styles.mobileBreak} /> : null}
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  );
}
