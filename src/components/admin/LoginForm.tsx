"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { loginAction, type LoginState } from "@/lib/admin/actions";
import styles from "./LoginForm.module.css";

const INITIAL_STATE: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form}>
      <h1 className={styles.title}>Admin access</h1>
      <p className={styles.text}>Enter the admin password to see your bookings.</p>

      <label className={styles.label} htmlFor="password">
        Password
      </label>
      <input
        className={styles.input}
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {state.error && <p className={styles.error}>{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}
