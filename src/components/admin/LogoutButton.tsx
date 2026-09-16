import { logoutAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary" size="sm">
        Sign out
      </Button>
    </form>
  );
}
