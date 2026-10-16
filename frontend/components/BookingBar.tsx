"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Sticky bottom booking bar — dark liquid glass,
 * with a copper "Check Availability" that carries fluid press feedback.
 */
/** Compute a default date string in YYYY-MM-DD, offset from today. */
function defaultDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function BookingBar() {
  const [checkIn, setCheckIn] = useState(() => defaultDate(2));
  const [checkOut, setCheckOut] = useState(() => defaultDate(5));
  const [guests, setGuests] = useState("2");

  const nights = (() => {
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    const n = Math.round((b - a) / 86_400_000);
    return Number.isFinite(n) && n > 0 ? n : 0;
  })();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="glass-deep trail pointer-events-auto mx-auto max-w-5xl rounded-[1.6rem] p-2.5 sm:rounded-[2rem] sm:p-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch sm:gap-3">
          <label className="group flex flex-1 flex-col justify-center rounded-2xl px-5 py-2.5 transition-colors duration-500 hover:bg-ivory/[0.04]">
            <span className="eyebrow text-ivory/40 transition-colors group-focus-within:text-copper-light">
              Arrival
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="field num mt-1.5 text-[0.95rem]"
            />
          </label>

          <span className="hidden w-px self-stretch bg-ivory/10 sm:block" />

          <label className="group flex flex-1 flex-col justify-center rounded-2xl px-5 py-2.5 transition-colors duration-500 hover:bg-ivory/[0.04]">
            <span className="eyebrow text-ivory/40 transition-colors group-focus-within:text-copper-light">
              Departure
            </span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="field num mt-1.5 text-[0.95rem]"
            />
          </label>

          <span className="hidden w-px self-stretch bg-ivory/10 sm:block" />

          <label className="group flex flex-col justify-center rounded-2xl px-5 py-2.5 transition-colors duration-500 hover:bg-ivory/[0.04]">
            <span className="eyebrow text-ivory/40 transition-colors group-focus-within:text-copper-light">
              Guests
            </span>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="field mt-1.5 min-w-[7.5rem] text-[0.95rem]"
            >
              <option value="1">1 guest</option>
              <option value="2">2 guests</option>
              <option value="3">3 guests</option>
              <option value="4">4 guests</option>
            </select>
          </label>

          <Link
            href="/booking"
            className="btn btn-copper btn-sheen sm:self-stretch"
            aria-label="Check availability"
          >
            <span className="hidden sm:inline">Check Availability</span>
            <span className="sm:hidden">Check Availability</span>
            {nights > 0 && (
              <span className="num hidden rounded-full bg-black/15 px-2 py-0.5 text-[0.65rem] tracking-normal lg:inline">
                {nights} nights
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
