import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { hasAdminSession } from "@/lib/admin/session";

/**
 * Guards every page in this route group. Nothing renders and no data is read
 * unless the signed admin cookie is valid.
 */
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  if (!(await hasAdminSession())) redirect("/admin/login");

  return children;
}
