import type { Metadata } from "next";
import { BillsRegistryView } from "./view";

export const metadata: Metadata = {
  title: "Bills Registry",
  description: "Every Official Bill, Private Members' Bill and Joint Sitting case in one registry.",
};

export default function BillsPage() {
  return <BillsRegistryView />;
}
