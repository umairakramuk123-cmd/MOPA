import type { Metadata } from "next";
import { CommitteesView } from "./view";

export const metadata: Metadata = {
  title: "Standing Committees",
  description: "Committee pendency, statutory windows, meeting records and report status.",
};

export default function CommitteesPage() {
  return <CommitteesView />;
}
