import type { Metadata } from "next";
import { SettingsView } from "./view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Deadline rules, alert thresholds, security policy and appearance.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
