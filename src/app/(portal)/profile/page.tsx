import type { Metadata } from "next";
import { ProfileView } from "./view";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Your account, role permissions and recent activity.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
