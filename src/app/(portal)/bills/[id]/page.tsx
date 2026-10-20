import type { Metadata } from "next";
import { BillDetailView } from "./view";

export const metadata: Metadata = {
  title: "Bill record",
};

export default async function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BillDetailView id={id} />;
}
