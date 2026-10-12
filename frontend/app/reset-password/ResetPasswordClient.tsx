"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { auth, ApiError, firstMessage } from "@/lib/authentication";
import { Shell } from "@/app/verify-email/VerifyEmailClient";
import { Field, PasswordInput } from "@/app/authentication/_forms";

/**
 * The room the emailed reset link opens: a fresh password. The backend
 * also re-verifies the email on success (proving control of the inbox).
 */
export default function ResetPasswordClient() {
  const params = useSearchParams();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const linkOk = Boolean(uid && token);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setTopError(null);
    setFieldErrors({});
    try {
      await auth.confirmPasswordReset({ uid, token, password });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setTopError(firstMessage(err.errors, err.message));
        setFieldErrors(err.errors);
      } else {
        setTopError("The house is unreachable for a moment — try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!linkOk) {
    return (
      <Shell
        step="Personal — 06"
        title="This link has expired"
        lead="The reset link is invalid or has expired. Request a fresh one and it will be with you in a minute."
      >
        <div className="mt-8">
          <Link href="/forgot-password" className="btn btn-copper btn-sheen">
            Request a new link
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      step="Personal — 06"
      title={done ? "The key is new" : "A new key"}
      lead={
        done
          ? "Your password is updated and every old session has been retired. Sign in with the new one."
          : "Choose a new password. Every previous session is retired the moment it is set."
      }
    >
      {done ? (
        <div className="mt-8">
          <Link href="/authentication/sign-in" className="btn btn-copper btn-sheen">
            Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8">
          <Field label="New password">
            <PasswordInput
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {fieldErrors.password && (
            <p className="mt-1.5 text-[0.78rem] font-light text-red-400/90">
              {fieldErrors.password.join(" ")}
            </p>
          )}

          <div className="mt-3 min-h-[1.4rem]">
            {topError && (
              <p role="alert" className="text-[0.85rem] font-light text-red-400">
                {topError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn btn-copper btn-sheen mt-4 w-full disabled:opacity-60"
          >
            {busy ? "Setting…" : "Set new password"}
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
