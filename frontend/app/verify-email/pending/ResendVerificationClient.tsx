"use client";

import Link from "next/link";
import { useState } from "react";
import { Shell } from "../VerifyEmailClient";
import { auth, useSession } from "@/lib/authentication";

/**
 * Signed in but unconfirmed: one quiet action — send a fresh confirmation
 * email, then wait for the guest to check their inbox.
 */
export default function ResendVerificationClient() {
  const { guest, ready } = useSession();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    setError(null);
    try {
      await auth.resendVerification();
      setSent(true);
    } catch {
      setError("The note didn't leave the house. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell
      step="Personal — 04"
      title={sent ? "Sent" : ready ? guest ? "One note away" : "Sign in first" : "One moment"}
      lead={
        sent
          ? "A fresh confirmation link is in your inbox. It stays valid for 48 hours."
          : ready
            ? guest
              ? `We'll send a fresh confirmation link to ${guest.email}. It stays valid for 48 hours.`
              : "Sign in first — then we can send a fresh confirmation link to your inbox."
            : "One moment…"
      }
    >
      <div className="mt-8 flex flex-col items-start gap-4">
        {!sent ? (
          <>
            {ready && !guest ? (
              <>
                <Link href="/authentication/sign-in" className="btn btn-copper btn-sheen">
                  Sign in
                </Link>
                {error && (
                  <p role="alert" className="text-[0.85rem] font-light text-red-400">
                    {error}
                  </p>
                )}
              </>
            ) : ready && guest ? (
              <button
                type="button"
                onClick={resend}
                disabled={busy}
                className="btn btn-copper btn-sheen disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send the email"}
              </button>
            ) : null}
            {error && (
              <p role="alert" className="text-[0.85rem] font-light text-red-400">
                {error}
              </p>
            )}
          </>
        ) : (
          <Link href="/" className="btn btn-glass btn-sheen">
            Return to the house
          </Link>
        )}
      </div>
    </Shell>
  );
}
