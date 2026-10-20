import type { Metadata } from "next";
import { ExecutiveView } from "./view";

export const metadata: Metadata = {
  title: "Executive Dashboard",
  description: "Consolidated, real-time view of legislative business for senior management and PMO.",
};

export default function ExecutivePage() {
  return <ExecutiveView />;
}
