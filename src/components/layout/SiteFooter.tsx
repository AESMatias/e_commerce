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
        <p>
          Built by <span className={styles.author}>{siteConfig.author}</span> · Earth imagery:
          NASA
        </p>
        <SocialLinks handle={siteConfig.author} />
      </Container>
    </footer>
  );
}
