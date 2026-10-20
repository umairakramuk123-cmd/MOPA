import type { Metadata } from "next";
import { ApprovalsView } from "./view";

export const metadata: Metadata = {
  title: "Approvals",
  description: "Endorsements and stage verifications awaiting a senior decision.",
};

export default function ApprovalsPage() {
  return <ApprovalsView />;
}
