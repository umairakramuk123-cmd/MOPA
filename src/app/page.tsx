import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";
import { ROLES } from "@/lib/roles";
import type { RoleId } from "@/lib/types";

export default async function RootPage() {
  const store = await cookies();
  const role = store.get(SESSION_COOKIE)?.value as RoleId | undefined;
  if (role && ROLES[role]) redirect("/dashboard");
  redirect("/login");
}
