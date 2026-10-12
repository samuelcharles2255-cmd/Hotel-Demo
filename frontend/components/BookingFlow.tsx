"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Reveal from "@/components/Reveal";
import { ArrowRight } from "@/components/ui";
import { images } from "@/lib/images";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["M", "T", "W", "T", "F", "S", "S"];

const STEPS = ["Dates", "Room", "Guests", "Confirm"] as const;

const ROOMS = [
  {
    id: "atelier",
    name: "Atelier Room",
    meta: "42 m² · Courtyard",
    price: 460,
    img: images.bookingRooms[0],
  },
  {
    id: "north-light",
    name: "North Light Suite",
    meta: "68 m² · Corner light",
    price: 620,
    img: images.bookingRooms[1],
    featured: true,
  },
  {
    id: "brutalist-loft",
    name: "Brutalist Loft",
    meta: "96 m² · Roof terrace",
    price: 890,
    img: images.bookingRooms[2],
  },
];

function grid(y: number, m: number) {
  const start = (new Date(y, m, 1).getDay() + 6) % 7;
  const len = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = Array(start).fill(null);
  for (let d = 1; d <= len; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  return cells;
}

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const fmt = (v: string) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";

function reviewRows(
  roomName: string,
  rate: number,
  nights: number,
  adults: number,
  children: number,
  arrival: string,
  departure: string,
  notes: string,
): [string, string][] {
  const rows: [string, string][] = [
    ["Dates", `${fmt(arrival)} — ${fmt(departure)}`],
    ["Nights", `${nights}`],
    ["Room", roomName],
    ["Guests", `${adults + children} guest${adults + children === 1 ? "" : "s"}`],
    ["Rate", `€${rate} / night`],
  ];
  if (notes.trim()) rows.push(["Requests", notes.trim()]);
  return rows;
}

export default function BookingFlow() {
  const today = new Date();
  const [step, setStep] = useState(0);
  const [cursor, setCursor] = useState({
    y: today.getFullYear(),
    m: today.getMonth(),
  });

  const [arrival, setArrival] = useState(iso(today.getFullYear(), today.getMonth(), 14));
  const [departure, setDeparture] = useState(iso(today.getFullYear(), today.getMonth(), 17));
  const [room, setRoom] = useState("north-light");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [notes, setNotes] = useState("");

  const cells = useMemo(() => grid(cursor.y, cursor.m), [cursor.y, cursor.m]);
  const selectedRoom = ROOMS.find((r) => r.id === room) ?? ROOMS[1];

  const nights = useMemo(() => {
    const n = Math.round(
      (new Date(departure).getTime() - new Date(arrival).getTime()) / 86_400_000,
    );
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [arrival, departure]);

  const roomTotal = nights * selectedRoom.price;
  const tax = nights * (adults + children) * 4;
  const total = roomTotal + tax;

  const pick = (d: number) => {
    const v = iso(cursor.y, cursor.m, d);
    if (!arrival || (arrival && departure)) {
      setArrival(v);
      setDeparture("");
      return;
    }
    if (new Date(v) <= new Date(arrival)) {
      setArrival(v);
      setDeparture("");
      return;
    }
    setDeparture(v);
  };

  const canAdvance =
    step === 0 ? nights > 0 : step === 1 ? !!room : true;

  return (
    <div className="flex flex-col gap-6">
      {/* ============ progress ============ */}
      <div className="glass rounded-[1.5rem] px-6 py-5">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <div key={s} className="flex flex-1 items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={[
                      "num flex h-7 w-7 items-center justify-center rounded-full text-[0.66rem] transition-all duration-700 ease-fluid",
                      state === "done"
                        ? "bg-copper text-[#17110a]"
                        : state === "active"
                          ? "border border-copper text-copper-light shadow-[0_0_18px_-4px_rgba(192,122,58,0.9)]"
                          : "border border-ivory/15 text-ivory/35",
                    ].join(" ")}
                  >
                    {state === "done" ? "✓" : `0${i + 1}`}
                  </span>
                  <span
                    className={[
                      "eyebrow hidden sm:inline transition-colors duration-500",
                      state === "todo" ? "text-ivory/30" : "text-ivory/80",
                    ].join(" ")}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="relative h-px flex-1 bg-ivory/10">
                    <span
                      className="absolute inset-y-0 left-0 bg-copper transition-all duration-700 ease-fluid"
                      style={{ width: i < step ? "100%" : "0%" }}
                    />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ step 1 — dates ============ */}
      {step === 0 && (
        <Reveal className="glass rounded-[1.75rem] p-6 sm:p-8">
          <p className="eyebrow text-copper-light">Step 01 — Choose your dates</p>
          <h2 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.6rem)] text-ivory">
            When does the light suit you?
          </h2>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            {/* calendar */}
            <div className="rounded-[1.4rem] border border-ivory/10 bg-ivory/[0.04] p-5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() =>
                    setCursor((c) => {
                      const d = new Date(c.y, c.m - 1, 1);
                      return { y: d.getFullYear(), m: d.getMonth() };
                    })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/12 text-ivory/60 transition-all duration-300 hover:border-copper/60 hover:text-ivory"
                >
                  ‹
                </button>
                <span className="eyebrow num text-ivory/75">
                  {MONTHS[cursor.m]} {cursor.y}
                </span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() =>
                    setCursor((c) => {
                      const d = new Date(c.y, c.m + 1, 1);
                      return { y: d.getFullYear(), m: d.getMonth() };
                    })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/12 text-ivory/60 transition-all duration-300 hover:border-copper/60 hover:text-ivory"
                >
                  ›
                </button>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-y-1.5">
                {DOW.map((d, i) => (
                  <span key={i} className="eyebrow pb-1 text-center text-[0.6rem] text-ivory/30">
                    {d}
                  </span>
                ))}
                {cells.map((d, i) => {
                  if (d === null) return <span key={i} className="h-9" />;
                  const v = iso(cursor.y, cursor.m, d);
                  const isA = v === arrival;
                  const isD = v === departure;
                  const inRange =
                    arrival && departure &&
                    new Date(v) > new Date(arrival) &&
                    new Date(v) < new Date(departure);
                  const selected = isA || isD;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pick(d)}
                      className={[
                        "num mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[0.8rem] transition-all duration-300",
                        selected
                          ? "scale-105 bg-copper font-medium text-[#17110a] shadow-[0_8px_22px_-8px_rgba(192,122,58,0.95)]"
                          : inRange
                            ? "rounded-none bg-copper/15 text-copper-light"
                            : "text-ivory/55 hover:bg-ivory/10 hover:text-ivory",
                      ].join(" ")}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* summary of dates */}
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-5 py-4">
                <p className="eyebrow text-ivory/35">Arrival</p>
                <p className="num mt-1.5 text-lg text-ivory">{fmt(arrival)}</p>
                <p className="mt-1 text-[0.8rem] font-light text-ivory/40">
                  From 15:00 — the door is open
                </p>
              </div>
              <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-5 py-4">
                <p className="eyebrow text-ivory/35">Departure</p>
                <p className="num mt-1.5 text-lg text-ivory">{fmt(departure)}</p>
                <p className="mt-1 text-[0.8rem] font-light text-ivory/40">
                  Until 14:00 — no rush
                </p>
              </div>
              <div className="glass rounded-2xl px-5 py-4">
                <p className="eyebrow text-copper-light">Length of stay</p>
                <p className="display mt-1.5 text-3xl text-ivory">
                  {nights} <span className="text-lg font-light text-ivory/50">nights</span>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ============ step 2 — rooms ============ */}
      {step === 1 && (
        <Reveal className="glass rounded-[1.75rem] p-6 sm:p-8">
          <p className="eyebrow text-copper-light">Step 02 — Select a room</p>
          <h2 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.6rem)] text-ivory">
            Twenty-four ways to sleep
          </h2>

          <div className="mt-7 flex flex-col gap-4">
            {ROOMS.map((r) => {
              const active = r.id === room;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoom(r.id)}
                  className={[
                    "group relative flex items-center gap-5 rounded-[1.4rem] border p-4 text-left transition-all duration-700 ease-fluid",
                    active
                      ? "border-copper/70 bg-copper/10 shadow-[0_24px_60px_-34px_rgba(192,122,58,0.9)]"
                      : "border-ivory/10 bg-ivory/[0.03] hover:-translate-y-0.5 hover:border-ivory/25 hover:bg-ivory/[0.06]",
                  ].join(" ")}
                >
                  <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.img}
                      alt={r.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1400ms] ease-fluid group-hover:scale-110"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="display block text-xl text-ivory">
                      {r.name}
                    </span>
                    <span className="eyebrow mt-1.5 block text-ivory/40">
                      {r.meta}
                    </span>
                    {r.featured && (
                      <span className="eyebrow mt-2 inline-block rounded-full border border-copper/45 px-2.5 py-1 text-[0.58rem] text-copper-light">
                        Last one
                      </span>
                    )}
                  </span>

                  <span className="text-right">
                    <span className="num display block text-2xl text-ivory">
                      €{r.price}
                    </span>
                    <span className="eyebrow mt-1 block text-ivory/35">
                      per night
                    </span>
                  </span>

                  <span
                    className={[
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                      active
                        ? "border-copper bg-copper text-[#17110a]"
                        : "border-ivory/25 text-transparent",
                    ].join(" ")}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                      <path
                        d="m5 12.5 4.5 4.5L19 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* ============ step 3 — guests ============ */}
      {step === 2 && (
        <Reveal className="glass rounded-[1.75rem] p-6 sm:p-8">
          <p className="eyebrow text-copper-light">Step 03 — Guests</p>
          <h2 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.6rem)] text-ivory">
            Who is staying?
          </h2>

          <div className="mt-7 flex flex-col gap-3">
            {[
              { label: "Adults", hint: "13 and over", value: adults, set: setAdults },
              { label: "Children", hint: "Under 12", value: children, set: setChildren },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-5 py-4"
              >
                <div>
                  <p className="text-[1rem] font-light text-ivory">{row.label}</p>
                  <p className="eyebrow mt-1 text-ivory/35">{row.hint}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Fewer ${row.label}`}
                    onClick={() => row.set(Math.max(0, row.value - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/60 transition-all duration-300 hover:border-copper/60 hover:text-ivory active:scale-90"
                  >
                    −
                  </button>
                  <span className="num w-6 text-center text-lg text-ivory">
                    {row.value}
                  </span>
                  <button
                    type="button"
                    aria-label={`More ${row.label}`}
                    onClick={() => row.set(Math.min(6, row.value + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/60 transition-all duration-300 hover:border-copper/60 hover:text-ivory active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="eyebrow text-ivory/40" htmlFor="notes">
              Special requests
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Late arrival, a bottle of something cold, the quiet side of the courtyard…"
              className="mt-3 w-full resize-none rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-5 py-4 text-[0.95rem] font-light leading-relaxed text-ivory placeholder:text-ivory/30 focus:border-copper/60 focus:outline-none"
            />
          </div>
        </Reveal>
      )}

      {/* ============ step 4 — confirm ============ */}
      {step === 3 && (
        <Reveal className="glass rounded-[1.75rem] p-6 sm:p-8">
          <p className="eyebrow text-copper-light">Step 04 — Review</p>
          <h2 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.6rem)] text-ivory">
            Everything in its place
          </h2>

          <dl className="mt-7">
            {reviewRows(
              selectedRoom.name,
              selectedRoom.price,
              nights,
              adults,
              children,
              arrival,
              departure,
              notes,
            ).map(
              ([k, v]) => (
                <div
                  key={k}
                  className="hairline flex items-baseline justify-between gap-8 py-4"
                >
                  <dt className="eyebrow text-ivory/40">{k}</dt>
                  <dd className="text-right text-[0.98rem] font-light text-ivory/85">
                    {v}
                  </dd>
                </div>
              ),
            )}
          </dl>

          <p className="mt-6 text-[0.85rem] font-light leading-relaxed text-ivory/45">
            No deposit today. We hold the suite until 48 hours before arrival,
            then send a note — not a robot.
          </p>

          <Link href="/confirmation" className="btn btn-copper btn-sheen mt-7 w-full">
            Confirm reservation
            <ArrowRight />
          </Link>
        </Reveal>
      )}

      {/* ============ controls ============ */}
      {step < 3 && (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn btn-ghost !px-7 disabled:pointer-events-none disabled:opacity-30"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => canAdvance && setStep((s) => Math.min(3, s + 1))}
            disabled={!canAdvance}
            className="btn btn-glass btn-sheen disabled:pointer-events-none disabled:opacity-30"
          >
            Continue
            <ArrowRight />
          </button>
        </div>
      )}

      {/* ============ sticky summary ============ */}
      <div className="lg:sticky lg:bottom-6">
        <div className="glass-deep trail flex flex-wrap items-center justify-between gap-5 rounded-[1.5rem] px-6 py-5">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <p className="eyebrow text-ivory/35">Dates</p>
              <p className="num mt-1 text-[0.95rem] text-ivory/85">
                {fmt(arrival)} — {fmt(departure)}
              </p>
            </div>
            <div>
              <p className="eyebrow text-ivory/35">Room</p>
              <p className="mt-1 text-[0.95rem] text-ivory/85">
                {selectedRoom.name}
              </p>
            </div>
            <div>
              <p className="eyebrow text-ivory/35">Guests</p>
              <p className="num mt-1 text-[0.95rem] text-ivory/85">
                {adults + children}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="eyebrow text-ivory/35">Total</p>
              <p className="num display mt-0.5 text-2xl text-copper-light">
                €{total.toLocaleString("en-GB")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => canAdvance && setStep((s) => Math.min(3, s + 1))}
              disabled={!canAdvance}
              className="btn btn-copper btn-sheen !px-7 disabled:pointer-events-none disabled:opacity-40"
            >
              {step === 2 ? "Review" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
