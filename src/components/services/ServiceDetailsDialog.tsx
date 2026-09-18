"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { RadioCard, RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { formatPrice } from "@/lib/format";
import { ServiceIcon } from "./ServiceIcon";
import type { Service } from "@/types/catalog";
import styles from "./ServiceDetailsDialog.module.css";

export function ServiceDetailsDialog({ service }: { service: Service }) {
  const defaultPackage = service.packages.find((pkg) => pkg.isPopular) ?? service.packages[0];
  const [selectedSlug, setSelectedSlug] = useState(defaultPackage?.slug);
  const selected = service.packages.find((pkg) => pkg.slug === selectedSlug) ?? defaultPackage;

  if (!selected) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className={styles.trigger}>
          <span>
            Compare<span className={styles.triggerExtra}> packages</span>
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent size="lg" className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            <span className={styles.titleIcon}>
              <ServiceIcon name={service.icon} />
            </span>
            {service.name}
          </DialogTitle>
          <DialogDescription>{service.description}</DialogDescription>
        </DialogHeader>

        <RadioCardGroup
          aria-label="Choose a package"
          value={selected.slug}
          onValueChange={setSelectedSlug}
          className={styles.tiers}
        >
          {service.packages.map((pkg) => (
            <RadioCard
              key={pkg.slug}
              value={pkg.slug}
              className={styles.tier}
              indicatorClassName={styles.tierIndicator}
            >
              <span className={styles.badge}>{pkg.isPopular ? "Recommended" : " "}</span>
              <span className={styles.tierName}>{pkg.name}</span>
              <span className={styles.tierPrice}>{formatPrice(pkg.priceCents, pkg.currency)}</span>
              {/* Each card carries its own deposit and timeline, so the three
                  packages compare side by side. */}
              <span className={styles.tierFacts}>
                <span className={styles.tierFact}>
                  <span className={styles.tierFactLabel}>Deposit</span>
                  <span className={styles.tierFactValue}>
                    {formatPrice(pkg.depositCents, pkg.currency)}
                  </span>
                </span>
                <span className={styles.tierFact}>
                  <span className={styles.tierFactLabel}>Timeline</span>
                  <span className={styles.tierFactValue}>{pkg.timeline}</span>
                </span>
              </span>
            </RadioCard>
          ))}
        </RadioCardGroup>

        <p className={styles.summary}>{selected.summary}</p>

        <section className={styles.section}>
          <h3 className={styles.subheading}>Included in {selected.name}</h3>
          <ul role="list" className={styles.deliverables}>
            {selected.deliverables.map((item) => (
              <li key={item} className={styles.deliverable}>
                <svg className={styles.checkIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className={styles.idealFor}>
          <span className={styles.idealForLabel}>Ideal for: </span>
          {service.idealFor}
        </p>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
          <Button asChild className={styles.continue}>
            <Link href={`/book/${selected.slug}`}>Continue</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
