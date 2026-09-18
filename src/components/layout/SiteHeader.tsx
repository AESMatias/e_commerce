import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { GitHubLink } from "@/components/layout/GitHubLink";
import { HashLink } from "@/components/layout/HashLink";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/server";
import styles from "./SiteHeader.module.css";

export async function SiteHeader() {
  const { t } = await getDictionary();

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
          <GitHubLink username={siteConfig.author} byLabel={t.header.by} />
        </span>

        <nav aria-label={t.header.mainNav} className={styles.nav}>
          <HashLink href="/#advisor" className={styles.navLink}>
            {t.header.advisor}
          </HashLink>
          <HashLink href="/#services" className={styles.navLink}>
            {t.header.packages}
          </HashLink>
          <HashLink href="/#how-it-works" className={styles.navLink}>
            {t.header.howItWorks}
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
