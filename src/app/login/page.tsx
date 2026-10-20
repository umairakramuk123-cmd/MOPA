import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign in · MoPA Legislative Monitoring",
  description:
    "Secure sign-in for the Ministry of Parliamentary Affairs Legislative Monitoring Dashboard.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center bg-canvas">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
