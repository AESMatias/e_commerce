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
import { getCatalog } from "@/lib/catalog";
import text from "@/styles/text.module.css";
import styles from "./page.module.css";

// The catalog rarely changes: regenerate the page at most once per hour.
export const revalidate = 3600;

const steps = [
  {
    title: "Describe your project",
    description: "Tell our AI advisor about your business problem and get the package that fits best.",
  },
  {
    title: "Book a kickoff call",
    description: "Pick an available date and time for a one-on-one call to scope the details.",
  },
  {
    title: "Secure your slot",
    description: "Pay the kickoff deposit securely with Stripe to confirm your booking.",
  },
  {
    title: "Get it built",
    description: "We deliver on a fixed scope and timeline, with updates at every milestone.",
  },
];

export default async function HomePage() {
  const services = await getCatalog();

  return (
    <>
      <ScrollToTop />
      <EarthBackdrop />

      <section className={styles.hero}>
        <EarthHero>
            <div className={styles.heroInner}>
          <HeroTitle
            text="Software packages with a fixed scope and a clear price"
            accentFrom={7}
            accentClassName={styles.goldAccent}
            mobileBreakAfter={4}
            className={styles.heroTitle}
          />
          <p className={text.lead}>
            Get a package recommendation from our AI advisor, book a kickoff call and secure your
            spot with a deposit, all in one place.
          </p>
          <div className={styles.actions}>
            <Button asChild size="lg" className={styles.glowButton}>
              <HashLink href="/#advisor">Talk to the AI advisor</HashLink>
            </Button>
            <Button asChild size="lg" variant="secondary" className={styles.goldButton}>
              <HashLink href="/#services">Browse packages</HashLink>
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
              <h2 className={text.heading}>Not sure which package you need?</h2>
              <p className={text.lead}>
                Describe your business problem and the AI advisor recommends one package from the
                catalog, with its price, timeline and what is included. No account needed.
              </p>
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
              <h2 className={text.heading}>Pick the package that fits your business</h2>
              <p className={text.lead}>
                Every service comes in three tiers with a defined scope, timeline and price.
                Compare them to see exactly what is included.
              </p>
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
            <h2 className={text.heading}>From idea to kickoff in four steps</h2>
          </header>

          <ol role="list" className={styles.steps}>
            {steps.map((step) => (
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
