"use client";

import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/authentication";
import { Shell } from "@/app/verify-email/VerifyEmailClient";
import { Field } from "@/app/authentication/_forms";

/**
 * "Forgot password?" — one email field. The backend answers the same
 * whether or not the address has an account (no probing).
 */
export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await auth.requestPasswordReset(email.trim().toLowerCase());
      setSent(true);
    } catch {
      setError("The note didn't leave the house. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell
      step="Personal — 05"
      title={sent ? "On its way" : "The key, restored"}
      lead={
        sent
          ? "If that address has an account, a reset link is in your inbox. It stays valid for 1 hour."
          : "Enter the address you stay under and we'll send a reset link."
      }
    >
      {sent ? (
        <div className="mt-8">
          <Link href="/authentication/sign-in" className="btn btn-glass btn-sheen">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8">
          <Field label="Email">
            <input
              className="field"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <div className="mt-3 min-h-[1.4rem]">
            {error && (
              <p role="alert" className="text-[0.85rem] font-light text-red-400">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn btn-copper btn-sheen mt-4 w-full disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>

          <p className="mt-6 text-center text-[0.83rem] font-light text-ivory/45">
            Remembered it?{" "}
            <Link href="/authentication/sign-in" className="link-line text-copper-light">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </Shell>
  );
}
