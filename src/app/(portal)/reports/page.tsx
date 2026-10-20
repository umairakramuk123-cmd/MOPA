import type { Metadata } from "next";
import { ReportsView } from "./view";

export const metadata: Metadata = {
  title: "Reports",
  description: "Fifteen statutory reports generated from live legislative data.",
};

export default function ReportsPage() {
  return <ReportsView />;
}
