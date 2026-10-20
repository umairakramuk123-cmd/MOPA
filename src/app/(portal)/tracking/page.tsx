import type { Metadata } from "next";
import { TrackingView } from "./view";

export const metadata: Metadata = {
  title: "Stage Tracking",
  description: "Stage-wise monitoring across the three MoPA legislative workflows.",
};

export default function TrackingPage() {
  return <TrackingView />;
}
