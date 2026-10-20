import type { Metadata } from "next";
import { MinistriesView } from "./view";

export const metadata: Metadata = {
  title: "Ministries & Divisions",
  description: "Division workload, pending responses and legislative performance.",
};

export default function MinistriesPage() {
  return <MinistriesView />;
}
