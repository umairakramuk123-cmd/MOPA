import type { Metadata } from "next";
import { AuditView } from "./view";

export const metadata: Metadata = {
  title: "Audit Trail",
  description: "Immutable, read-only record of every change with before and after values.",
};

export default function AuditPage() {
  return <AuditView />;
}
