import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithRef } from "react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render the child element (e.g. next/link) with button styles via Radix Slot. */
  asChild?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  className,
  ...props
}: ButtonProps) {
  const classes = cx(styles.button, styles[variant], styles[size], className);

  if (asChild) {
    return <Slot className={classes} {...props} />;
  }

  return <button type="button" className={classes} {...props} />;
}
