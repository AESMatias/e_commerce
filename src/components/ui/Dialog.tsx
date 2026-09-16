"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithRef } from "react";
import { cx } from "@/lib/cx";
import styles from "./Dialog.module.css";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

type DialogContentProps = ComponentPropsWithRef<typeof DialogPrimitive.Content> & {
  size?: "md" | "lg";
};

export function DialogContent({ size = "md", className, children, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={styles.overlay} />
      <DialogPrimitive.Content className={cx(styles.content, styles[size], className)} {...props}>
        {children}
        <DialogPrimitive.Close className={styles.close} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cx(styles.header, className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cx(styles.footer, className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentPropsWithRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cx(styles.title, className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cx(styles.description, className)} {...props} />;
}
