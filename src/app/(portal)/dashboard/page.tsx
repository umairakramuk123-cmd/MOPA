import type { Metadata } from "next";
import { DashboardView } from "./view";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Operational command centre for legislative business — bills, stages, deadlines and alerts.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
