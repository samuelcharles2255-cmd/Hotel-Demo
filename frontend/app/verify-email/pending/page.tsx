import type { Metadata } from "next";
import ResendVerificationClient from "./ResendVerificationClient";

export const metadata: Metadata = {
  title: "Confirm your email — AETHER",
  robots: { index: false },
};

export default function VerifyEmailPendingPage() {
  return <ResendVerificationClient />;
}
