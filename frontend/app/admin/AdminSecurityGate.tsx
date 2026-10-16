"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, firstMessage, useSession, type Guest } from "@/lib/authentication";
import { ArrowRight } from "@/components/ui";

export default function AdminSecurityGate({
  onSuccess,
}: {
  onSuccess: (adminUser: Guest) => void;
}) {
  const { signIn, guest, signOut } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If a regular user is signed in with 'customer' role
  const isCustomerLoggedIn = guest && guest.role !== "admin" && guest.role !== "staff";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const user = await signIn(email.trim().toLowerCase(), password);
      if (user.role === "admin" || user.role === "staff") {
        onSuccess(user);
      } else {
        setError(
          "Access Denied: Account verified, but you lack staff or administrative clearance for this console."
        );
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(firstMessage(err.errors, err.message));
      } else {
        setError("Administrative security server unreachable. Please verify connection.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSwitchAccount() {
    await signOut();
    setEmail("");
    setPassword("");
    setError(null);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 bg-charcoal selection:bg-copper/30">
      {/* Background ambient luxury lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-copper/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-copper-deep/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Security Crest */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-copper/40 bg-copper/10 shadow-[0_0_40px_rgba(192,122,58,0.25)] mb-4">
            <svg
              className="w-7 h-7 text-copper-light"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.4}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>

          <p className="eyebrow text-copper-light tracking-[0.38em]">
            Restricted Clearance Area
          </p>
          <h1 className="display text-3xl sm:text-4xl text-ivory mt-2 font-light tracking-wide">
            AETHER Admin Gate
          </h1>
          <p className="mt-2 text-xs font-light text-ivory/50 max-w-xs mx-auto">
            Operations &amp; Booking Management Console. All access transactions are cryptographically verified.
          </p>
        </div>

        {/* Liquid Glass Security Card */}
        <div className="glass-deep rounded-3xl p-8 sm:p-10 border border-ivory/15 shadow-2xl relative">
          <div className="absolute top-0 right-10 -translate-y-1/2 px-3 py-1 rounded-full bg-copper-deep/70 border border-copper/50 text-[10px] font-mono tracking-widest text-white uppercase shadow-lg">
            TLS 256-Bit Encrypted
          </div>

          {isCustomerLoggedIn ? (
            <div className="space-y-6 text-center">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
                <p className="text-xs uppercase tracking-wider text-amber-400 font-medium">
                  Active Guest Session Detected
                </p>
                <p className="mt-1 text-sm text-ivory/80 font-light">
                  You are currently logged in as{" "}
                  <strong className="text-ivory font-medium">{guest.email}</strong>, which holds guest privileges.
                  Staff clearance is required to proceed.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="btn btn-copper btn-sheen w-full text-xs"
                >
                  Sign Out &amp; Authenticate as Admin
                </button>
                <Link
                  href="/"
                  className="btn btn-ghost w-full text-xs text-ivory/70 hover:text-ivory"
                >
                  Return to Guest Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block eyebrow text-ivory/50 text-[11px] mb-2">
                  Admin Identity / Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="admin@aether-hotel.com"
                    className="w-full px-4 py-3 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory placeholder-ivory/30 text-sm focus:outline-none focus:border-copper transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ivory/30">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="eyebrow text-ivory/50 text-[11px]">
                    Security Passkey
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-light text-copper-light/80 hover:text-copper-light transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory placeholder-ivory/30 text-sm focus:outline-none focus:border-copper transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ivory/30">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 13.5v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs leading-relaxed flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn btn-copper btn-sheen w-full mt-2 disabled:opacity-50 transition-all text-xs"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-charcoal-deep" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying Credentials…
                  </span>
                ) : (
                  <>
                    <span>Unlock Admin Console</span>
                    <ArrowRight />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-ivory/10 text-center">
            <Link
              href="/"
              className="text-xs font-light text-ivory/40 hover:text-copper-light transition-colors inline-flex items-center gap-1.5"
            >
              <span>&larr;</span>
              <span>Back to Public Guest Portal</span>
            </Link>
          </div>
        </div>

        {/* Security notice footer */}
        <p className="mt-6 text-center text-[11px] font-light text-ivory/30 tracking-wider">
          AETHER Luxury Hospitality Management &bull; Mbeya, Tanzania
        </p>
      </div>
    </div>
  );
}

