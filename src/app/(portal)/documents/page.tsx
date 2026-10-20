import type { Metadata } from "next";
import { DocumentsView } from "./view";

export const metadata: Metadata = {
  title: "Document Repository",
  description: "Central legislative document repository with classification and coverage tracking.",
};

export default function DocumentsPage() {
  return <DocumentsView />;
}
