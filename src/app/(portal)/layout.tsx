import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, buildSession } from "@/lib/session";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { ROLES } from "@/lib/roles";
import type { RoleId } from "@/lib/types";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value as RoleId | undefined;
  if (!raw || !ROLES[raw]) redirect("/login?reason=Please%20sign%20in%20to%20continue.");
  const session = buildSession(raw);

  return (
    <StoreProvider session={session}>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
