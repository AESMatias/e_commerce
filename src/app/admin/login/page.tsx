import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Container } from "@/components/layout/Container";
import { getDictionary } from "@/i18n/server";
import { hasAdminSession } from "@/lib/admin/session";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.admin.loginMetaTitle, robots: { index: false, follow: false } };
}

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect("/admin");

  return (
    <Container className={styles.page}>
      <LoginForm />
    </Container>
  );
}
