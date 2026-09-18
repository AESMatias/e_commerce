import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/server";
import styles from "./SiteFooter.module.css";

export async function SiteFooter() {
  const year = new Date().getFullYear();
  const { locale, t } = await getDictionary();

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p>
          © {year} {siteConfig.name}. {t.footer.rights}
        </p>
        <p className={styles.credits}>
          <span>
            {t.footer.builtBy} <span className={styles.author}>{siteConfig.author}</span>
          </span>
          <span>{t.footer.imagery}</span>
        </p>
        <nav aria-label={t.footer.legalNav} className={styles.legal}>
          <Link href="/privacy" className={styles.legalLink}>
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className={styles.legalLink}>
            {t.footer.terms}
          </Link>
          <LanguageSwitcher current={locale} label={t.footer.language} />
        </nav>
        <SocialLinks handle={siteConfig.author} labels={t.social} />
      </Container>
    </footer>
  );
}
