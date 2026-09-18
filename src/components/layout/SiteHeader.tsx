import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { GitHubLink } from "@/components/layout/GitHubLink";
import { HashLink } from "@/components/layout/HashLink";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { siteConfig } from "@/config/site";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      {/* Two beams of light that leave the middle of the bar as the page
          scrolls and reach the far corners when the change completes. */}
      <span className={styles.beam} aria-hidden="true" />
      <Container className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logoMark} aria-hidden="true">
            {"</>"}
          </span>
          <span className={styles.brandName}>
            Whole<span className={styles.brandAccent}>heartedly</span>
          </span>
        </Link>

        <span className={styles.byline}>
          <GitHubLink username={siteConfig.author} />
        </span>

        <nav aria-label="Main" className={styles.nav}>
          <HashLink href="/#advisor" className={styles.navLink}>
            AI advisor
          </HashLink>
          <HashLink href="/#services" className={styles.navLink}>
            Packages
          </HashLink>
          <HashLink href="/#how-it-works" className={styles.navLink}>
            How it works
          </HashLink>
        </nav>

        <div className={styles.actions}>
          <span className={styles.divider} aria-hidden="true" />
          <ThemeToggle className={styles.themeToggle} />
        </div>
      </Container>
    </header>
  );
}
