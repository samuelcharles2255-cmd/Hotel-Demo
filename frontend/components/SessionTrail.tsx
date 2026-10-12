"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/authentication";

/**
 * The guest session entry in the nav — a copper glyph when browsing as a
 * guest, initials once signed in. The panel records which route it was
 * opened on, so navigating anywhere closes it (same derived-state pattern
 * as the mobile sheet — no effect-driven state).
 */
export default function SessionTrail() {
  const { guest, ready, signOut } = useSession();
  const pathname = usePathname();

  // Panel records the route it opened on — any navigation closes it.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedAt(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const initials = guest
    ? [guest.first_name, guest.last_name]
        .map((v) => (v || "").trim().charAt(0).toUpperCase())
        .filter(Boolean)
        .slice(0, 2)
        .join("") || "\u2022"
    : "\u2022";

  const displayName = guest
    ? `${guest.first_name || "Guest"}${guest.last_name ? ` ${guest.last_name}` : ""}`
    : "";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={
          guest
            ? `Your account — ${displayName}`
            : "Personal \u2014 sign in or create an account"
        }
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="group relative flex h-9 items-center rounded-full border border-ivory/15 bg-ivory/5 px-3 transition-all duration-500 hover:border-copper/45 hover:bg-ivory/10"
      >
        <span className="num text-[0.7rem] tracking-[0.24em] text-copper-light transition-transform duration-500 ease-spring group-hover:scale-110">
          {guest ? initials : "\u00b7 \u00b7 \u00b7"}
        </span>
        {guest && !guest.email_verified && (
          <span
            aria-label="Email not yet confirmed"
            className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-copper shadow-[0_0_8px_rgba(192,122,58,0.8)]"
          />
        )}
      </button>

      {/* -------- panel -------- */}
      <div
        className={`absolute right-0 top-12 z-50 w-64 rounded-[1.35rem] transition-all duration-500 ease-fluid ${
          open ? "glass-deep scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="p-5">
          {!ready && (
            <div className="flex gap-3">
              <span className="h-9 w-9 animate-pulse rounded-full bg-ivory/10" />
              <div className="flex-1 pt-1.5">
                <span className="block h-2.5 w-24 animate-pulse rounded-full bg-ivory/10" />
                <span className="mt-2 block h-2 w-32 animate-pulse rounded-full bg-ivory/[0.06]" />
              </div>
            </div>
          )}

          {ready && !guest && ( 
            <div className="w-full">
              <p className="eyebrow text-ivory/45">Personal</p>
              <Link href="/authentication/sign-in" className="mt-4 block">
                <span className="btn btn-copper btn-sheen w-full">Sign in</span>
              </Link>
              <Link
                href="/authentication/sign-up"
                className="eyebrow mt-4 block text-center text-copper-light transition-colors hover:text-ivory"
              >
                Create account →
              </Link>
            </div>
          )}

          {ready && guest && (
            <div className="w-full">
              <p className="display text-lg text-ivory">{displayName}</p>
              <p className="mt-1 truncate text-[0.8rem] font-light text-ivory/50">
                {guest.email}
              </p>
              {!guest.email_verified && (
                <Link
                  href="/verify-email/pending"
                  className="eyebrow mt-3 inline-flex items-center gap-2 rounded-full border border-copper/40 px-3 py-1.5 text-copper-light transition-colors hover:bg-copper/10"
                >
                  <span className="h-1 w-1 rounded-full bg-copper" />
                  Confirm email
                </Link>
              )}
              <ul className="mt-4 border-t border-ivory/10 pt-2">
                <li>
                  <Link
                    href="/profile"
                    className="eyebrow block rounded-lg py-2.5 text-ivory/75 transition-colors hover:text-ivory"
                  >
                    Profile & preferences
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                    className="eyebrow block w-full rounded-lg py-2.5 text-left text-ivory/55 transition-colors hover:text-red-400"
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
