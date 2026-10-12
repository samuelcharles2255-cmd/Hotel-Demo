import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export const metadata: Metadata = {
  title: "Confirm your email — AETHER",
  robots: { index: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailClient />
    </Suspense>
  );
}
