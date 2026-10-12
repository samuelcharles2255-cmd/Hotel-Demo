"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/authentication";

/**
 * The room the emailed link opens. Confirms the address once, on arrival,
 * using ?token=... — refresh-safe (no double confirmation).
 */
export default function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token");

  const [state, setState] = useState<"working" | "done" | "invalid">(
    token ? "working" : "invalid",
  );
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    auth
      .verifyEmail(token)
      .then(() => setState("done"))
      .catch(() => setState("invalid"));
  }, [token]);

  return (
    <Shell
      step="Personal — 03"
      title={state === "done" ? "Confirmed" : state === "working" ? "One moment" : "This link has expired"}
      lead={
        state === "done"
          ? "Your address is confirmed. Your stays, tables and the Thursday note now gather under one roof."
          : state === "working"
            ? "Confirming your address…"
            : "The confirmation link is invalid or has expired. Sign in and we'll send a fresh one."
      }
    >
      {state === "invalid" && (
        <div className="mt-8 flex flex-col items-start gap-4">
          <Link href="/authentication/sign-in" className="btn btn-copper btn-sheen">
            Sign in
          </Link>
          <Link href="/verify-email/pending" className="eyebrow link-line text-copper-light">
            Send a new link
          </Link>
        </div>
      )}
      {state === "done" && (
        <div className="mt-8">
          <Link href="/" className="btn btn-glass btn-sheen">
            Return to the house
          </Link>
        </div>
      )}
    </Shell>
  );
}

/** Shared shell for the three emailed-link pages. */
export function Shell({
  step,
  title,
  lead,
  children,
}: {
  step: string;
  title: string;
  lead: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pb-24 pt-36 sm:px-8">
      <span
        className="pointer-events-none absolute left-1/2 top-[22%] h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-copper/20 blur-[130px]"
        style={{ animation: "glow-breathe 9s ease-in-out infinite alternate" }}
      />
      <div className="relative w-full max-w-xl">
        <p className="eyebrow text-ivory/40">{step}</p>
        <h1 className="display glow-title mt-4 text-[clamp(2.4rem,6vw,4rem)] text-ivory">
          {title}
        </h1>
        <p className="mt-5 max-w-md text-[1rem] font-light leading-relaxed text-ivory/55">
          {lead}
        </p>
        {children}
      </div>
    </main>
  );
}
