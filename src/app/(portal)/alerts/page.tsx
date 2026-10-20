import type { Metadata } from "next";
import { AlertsView } from "./view";

export const metadata: Metadata = {
  title: "Alerts & Notifications",
  description: "Milestone alerts, deadline escalations and ministry response reminders.",
};

export default function AlertsPage() {
  return <AlertsView />;
}
