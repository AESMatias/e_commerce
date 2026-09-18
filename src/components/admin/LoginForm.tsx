"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";
import { loginAction, type LoginState } from "@/lib/admin/actions";
import styles from "./LoginForm.module.css";

const INITIAL_STATE: LoginState = {};

export function LoginForm() {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className={styles.form}>
      <h1 className={styles.title}>{t.admin.loginTitle}</h1>
      <p className={styles.text}>{t.admin.loginText}</p>

      <label className={styles.label} htmlFor="password">
        {t.admin.password}
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
        {isPending ? t.admin.checking : t.admin.signIn}
      </Button>
    </form>
  );
}
