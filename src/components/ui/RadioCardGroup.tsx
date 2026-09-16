"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentPropsWithRef } from "react";
import { cx } from "@/lib/cx";
import styles from "./RadioCardGroup.module.css";

export function RadioCardGroup({
  className,
  ...props
}: ComponentPropsWithRef<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cx(styles.group, className)} {...props} />;
}

export function RadioCard({
  className,
  children,
  ...props
}: ComponentPropsWithRef<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item className={cx(styles.card, className)} {...props}>
      <span className={styles.indicatorRing} aria-hidden="true">
        <RadioGroupPrimitive.Indicator className={styles.indicatorDot} />
      </span>
      {children}
    </RadioGroupPrimitive.Item>
  );
}
