import { logoutAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n/server";

export async function LogoutButton() {
  const { t } = await getDictionary();

  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary" size="sm">
        {t.admin.signOut}
      </Button>
    </form>
  );
}
