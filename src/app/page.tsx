import { AdvisorChat } from "@/components/advisor/AdvisorChat";
import { Container } from "@/components/layout/Container";
import { HashLink } from "@/components/layout/HashLink";
import { EarthBackdrop } from "@/components/visuals/EarthBackdrop";
import { EarthHero } from "@/components/visuals/EarthHero";
import { FloatingObject } from "@/components/visuals/FloatingObject";
import { HeroTitle } from "@/components/visuals/HeroTitle";
import { ScrollToTop } from "@/components/visuals/ScrollToTop";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/server";
import { getCatalog } from "@/lib/catalog";
import text from "@/styles/text.module.css";
import styles from "./page.module.css";

export default async function HomePage() {
  // Rendered per request: the language comes from the visitor's cookie.
  const { locale, t } = await getDictionary();
  const services = await getCatalog(locale);

  return (
    <>
      <ScrollToTop />
      <EarthBackdrop />

      <section className={styles.hero}>
        <EarthHero>
            <div className={styles.heroInner}>
          <HeroTitle
            text={t.home.heroTitle}
            accentFrom={t.home.heroAccentFrom}
            accentClassName={styles.goldAccent}
            mobileBreakAfter={t.home.heroBreakAfter}
            className={styles.heroTitle}
          />
          <p className={text.lead}>{t.home.heroLead}</p>
          <div className={styles.actions}>
            <Button asChild size="lg" className={styles.glowButton}>
              <HashLink href="/#advisor">{t.home.talkToAdvisor}</HashLink>
            </Button>
            <Button asChild size="lg" variant="secondary" className={styles.goldButton}>
              <HashLink href="/#services">{t.home.browsePackages}</HashLink>
            </Button>
          </div>
            </div>
        </EarthHero>
      </section>

      <section id="advisor" className={`${styles.sectionAlt} ${styles.advisorSection}`}>
        <Container className={styles.advisorLayout}>
          <header className={styles.artHeader}>
            <FloatingObject name="robot" className={styles.artObject} />
            <div className={styles.artIntro}>
              <h2 className={text.heading}>{t.home.advisorTitle}</h2>
              <p className={text.lead}>{t.home.advisorLead}</p>
            </div>
          </header>
          <AdvisorChat />
        </Container>
      </section>

      <section id="services" className={styles.section}>
        <Container>
          <header className={styles.artHeader}>
            <FloatingObject name="parcel" className={styles.artObject} />
            <div className={styles.artIntro}>
              <h2 className={text.heading}>{t.home.servicesTitle}</h2>
              <p className={text.lead}>{t.home.servicesLead}</p>
            </div>
          </header>

          <ul role="list" className={styles.grid}>
            {services.map((service) => (
              <li key={service.slug} className={styles.gridItem}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="how-it-works" className={styles.sectionAlt}>
        <Container>
          <header className={styles.sectionHeader}>
            <h2 className={text.heading}>{t.home.stepsTitle}</h2>
          </header>

          <ol role="list" className={styles.steps}>
            {t.home.steps.map((step) => (
              <li key={step.title} className={styles.step}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

    </>
  );
}
