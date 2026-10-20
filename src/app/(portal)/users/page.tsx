import type { Metadata } from "next";
import { UsersView } from "./view";

export const metadata: Metadata = {
  title: "Users & Roles",
  description: "Role-based access control, user lifecycle and permission matrix.",
};

export default function UsersPage() {
  return <UsersView />;
}
