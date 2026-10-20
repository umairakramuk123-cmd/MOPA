import type { Metadata } from "next";
import { HelpView } from "./view";

export const metadata: Metadata = {
  title: "Help & Glossary",
  description: "Glossary of parliamentary terms, keyboard shortcuts and support contacts.",
};

export default function HelpPage() {
  return <HelpView />;
}
