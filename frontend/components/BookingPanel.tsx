"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const key = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/**
 * Tall sticky liquid-glass booking panel:
 * frosted calendar, guests, price, fluid copper CTA.
 */
export default function BookingPanel() {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [arrival, setArrival] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-14`);
  const [departure, setDeparture] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-17`);
  const [guests, setGuests] = useState(2);

  const cells = useMemo(
    () => buildGrid(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  );

  const nights = useMemo(() => {
    const a = new Date(arrival).getTime();
    const b = new Date(departure).getTime();
    const n = Math.round((b - a) / 86_400_000);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [arrival, departure]);

  const pick = (d: number) => {
    const iso = key(cursor.y, cursor.m, d);
    if (!arrival || (arrival && departure)) {
      setArrival(iso);
      setDeparture("");
      return;
    }
    if (new Date(iso) <= new Date(arrival)) {
      setArrival(iso);
      return;
    }
    setDeparture(iso);
  };

  const move = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const rate = 250000;
  const total = nights * rate;

  return (
    <aside className="glass-deep trail rounded-[1.75rem] p-6 sm:p-7">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-ivory/40">From</p>
          <p className="display mt-1.5 text-3xl text-ivory">
            {rate.toLocaleString()}
            <span className="ml-2 text-sm font-light tracking-wide text-ivory/45">
              TSH / night
            </span>
          </p>
        </div>
        <span className="eyebrow rounded-full border border-copper/40 px-3 py-1.5 text-copper-light">
          Available
        </span>
      </div>

      {/* ---------- frosted calendar ---------- */}
      <div className="mt-6 rounded-2xl border border-ivory/10 bg-ivory/[0.04] p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ivory/12 text-ivory/60 transition-colors duration-300 hover:border-copper/60 hover:text-ivory"
          >
            ‹
          </button>
          <span className="eyebrow num text-ivory/70">
            {MONTHS[cursor.m]} {cursor.y}
          </span>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ivory/12 text-ivory/60 transition-colors duration-300 hover:border-copper/60 hover:text-ivory"
          >
            ›
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="eyebrow pb-1 text-[0.6rem] text-ivory/30">
              {d}
            </span>
          ))}

          {cells.map((d, i) => {
            if (d === null) return <span key={i} className="h-8" />;
            const iso = key(cursor.y, cursor.m, d);
            const isArrival = iso === arrival;
            const isDeparture = iso === departure;
            const inRange =
              arrival &&
              departure &&
              new Date(iso) > new Date(arrival) &&
              new Date(iso) < new Date(departure);
            const selected = isArrival || isDeparture;

            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(d)}
                className={[
                  "num mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[0.78rem] transition-all duration-300",
                  selected
                    ? "bg-copper text-[#17110a] shadow-[0_6px_18px_-6px_rgba(192,122,58,0.9)]"
                    : inRange
                      ? "bg-copper/15 text-copper-light"
                      : "text-ivory/55 hover:bg-ivory/10 hover:text-ivory",
                ].join(" ")}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- dates + guests ---------- */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-4 py-3">
          <p className="eyebrow text-ivory/35">Arrival</p>
          <p className="num mt-1 text-[0.9rem] text-ivory/85">
            {arrival ? new Date(arrival).toLocaleDateString("en-GB") : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-4 py-3">
          <p className="eyebrow text-ivory/35">Departure</p>
          <p className="num mt-1 text-[0.9rem] text-ivory/85">
            {departure ? new Date(departure).toLocaleDateString("en-GB") : "—"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-4 py-3">
        <div>
          <p className="eyebrow text-ivory/35">Guests</p>
          <p className="mt-1 text-[0.9rem] text-ivory/85">
            {guests} {guests === 1 ? "guest" : "guests"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[-1, 1].map((delta) => (
            <button
              key={delta}
              type="button"
              aria-label={delta < 0 ? "Remove guest" : "Add guest"}
              onClick={() =>
                setGuests((g) => Math.min(4, Math.max(1, g + delta)))
              }
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ivory/12 text-ivory/60 transition-all duration-300 hover:border-copper/60 hover:text-ivory active:scale-90"
            >
              {delta < 0 ? "−" : "+"}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- total ---------- */}
      <div className="mt-5 space-y-2 border-t border-ivory/10 pt-4 text-[0.88rem] font-light">
        <div className="flex justify-between text-ivory/55">
          <span className="num">
            €{rate} × {nights || 0} nights
          </span>
          <span className="num">€{total.toLocaleString("en-GB")}</span>
        </div>
        <div className="flex justify-between text-ivory/55">
          <span>Highland service fee</span>
          <span className="num">{(nights * 10000).toLocaleString()} TSH</span>
        </div>
        <div className="flex items-baseline justify-between pt-2 text-ivory">
          <span className="eyebrow">Total</span>
          <span className="num display text-2xl text-copper-light">
            {(total + nights * 10000).toLocaleString()} TSH
          </span>
        </div>
      </div>

      <Link
        href={`/booking?room=executive-king&arrival=${arrival}&departure=${departure}`}
        className="btn btn-copper btn-sheen mt-6 w-full"
      >
        Reserve this Room
      </Link>

      <p className="mt-4 text-center text-[0.75rem] font-light leading-relaxed text-ivory/40">
        Free cancellation until 48 hours before arrival.
        <br />
        No deposit required.
      </p>
    </aside>
  );
}
