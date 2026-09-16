import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Container } from "@/components/layout/Container";
import { hasAdminSession } from "@/lib/admin/session";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect("/admin");

  return (
    <Container className={styles.page}>
      <LoginForm />
    </Container>
  );
}
