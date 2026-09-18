import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { siteConfig } from "@/config/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p>
          © {year} {siteConfig.name}. All rights reserved.
        </p>
        <p className={styles.credits}>
          <span>
            Built by <span className={styles.author}>{siteConfig.author}</span>
          </span>
          <span>Earth imagery: NASA</span>
        </p>
        <nav aria-label="Legal" className={styles.legal}>
          <Link href="/privacy" className={styles.legalLink}>
            Privacy
          </Link>
          <Link href="/terms" className={styles.legalLink}>
            Terms
          </Link>
        </nav>
        <SocialLinks handle={siteConfig.author} />
      </Container>
    </footer>
  );
}
