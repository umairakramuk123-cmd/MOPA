import type { Metadata } from "next";
import { RegisterBillView } from "./view";

export const metadata: Metadata = {
  title: "Register a bill",
  description: "Register an Official Bill, Private Members' Bill or Joint Sitting case.",
};

export default function RegisterBillPage() {
  return <RegisterBillView />;
}
