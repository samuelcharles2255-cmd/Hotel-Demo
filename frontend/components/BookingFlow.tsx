"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Reveal from "@/components/Reveal";
import { ArrowRight } from "@/components/ui";
import { images } from "@/lib/images";
import { createBooking, fetchAvailability, RoomTypeApi } from "@/lib/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["M", "T", "W", "T", "F", "S", "S"];

const STEPS = ["Dates", "Room", "Guests", "Confirm"] as const;

interface LocalRoom {
  id: number;
  slug: string;
  name: string;
  meta: string;
  price: number;
  img: string;
  featured?: boolean;
  roomsLeft?: number;
}

const DEFAULT_ROOMS: LocalRoom[] = [
  {
    id: 2,
    slug: "executive-king",
    name: "Executive King Suite",
    meta: "68 m² · King Bed · Hot Tub · Kitchenette",
    price: 250000,
    img: images.bookingRooms[1],
    featured: true,
  },
  {
    id: 3,
    slug: "deluxe-twin",
    name: "Deluxe Twin Room",
    meta: "48 m² · 2 Double Beds · Family Friendly",
    price: 180000,
    img: images.bookingRooms[0],
  },
  {
    id: 4,
    slug: "grand-suite",
    name: "Grand Executive Living Suite",
    meta: "95 m² · Master King & Living Salon · VIP",
    price: 450000,
    img: images.bookingRooms[2],
  },
  {
    id: 5,
    slug: "conference-hall",
    name: "Conference & Meeting Hall",
    meta: "Audiovisual Hall · Seminar & Boardroom",
    price: 300000,
    img: images.bookingRooms[3],
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
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function reviewRows(
  roomName: string,
  rate: number,
  nights: number,
  adults: number,
  children: number,
  arrival: string,
  departure: string,
  guestName: string,
  email: string,
  phone: string,
  notes: string,
): [string, string][] {
  const rows: [string, string][] = [
    ["Dates", `${fmt(arrival)} — ${fmt(departure)}`],
    ["Nights", `${nights}`],
    ["Room", roomName],
    ["Guests", `${adults + children} (${adults} adult${adults > 1 ? "s" : ""}${children > 0 ? `, ${children} child` : ""})`],
    ["Primary Guest", guestName.trim() || "Guest"],
    ["Contact", `${email}${phone ? ` · ${phone}` : ""}`],
    ["Nightly Rate", `${rate.toLocaleString()} TSH`],
  ];
  if (notes.trim()) rows.push(["Special Requests", notes.trim()]);
  return rows;
}

export default function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date();

  // Initial date generation (today + 1 week)
  const defaultIn = new Date(today);
  defaultIn.setDate(today.getDate() + 2);
  const defaultOut = new Date(today);
  defaultOut.setDate(today.getDate() + 5);

  const [step, setStep] = useState(0);
  const [cursor, setCursor] = useState({
    y: defaultIn.getFullYear(),
    m: defaultIn.getMonth(),
  });

  const [arrival, setArrival] = useState(
    searchParams.get("arrival") || iso(defaultIn.getFullYear(), defaultIn.getMonth(), defaultIn.getDate())
  );
  const [departure, setDeparture] = useState(
    searchParams.get("departure") || iso(defaultOut.getFullYear(), defaultOut.getMonth(), defaultOut.getDate())
  );

  const [selectedRoomId, setSelectedRoomId] = useState<number>(2);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Guest details for real Django reservation
  const [firstName, setFirstName] = useState("Samuel");
  const [lastName, setLastName] = useState("Charles");
  const [email, setEmail] = useState("samuel.charles2255@gmail.com");
  const [phone, setPhone] = useState("+255 618 130 940");
  const [notes, setNotes] = useState("");

  const [rooms, setRooms] = useState<LocalRoom[]>(DEFAULT_ROOMS);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cells = useMemo(() => grid(cursor.y, cursor.m), [cursor.y, cursor.m]);

  // Selected room object
  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) ?? rooms[0],
    [rooms, selectedRoomId]
  );

  const nights = useMemo(() => {
    const n = Math.round(
      (new Date(departure).getTime() - new Date(arrival).getTime()) / 86_400_000,
    );
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [arrival, departure]);

  const roomTotal = nights * selectedRoom.price;
  const serviceFee = nights * 10000; // Highland amenity & service
  const total = roomTotal + serviceFee;

  // Live query backend availability when dates change
  useEffect(() => {
    if (!arrival || !departure || nights <= 0) return;
    let isCancelled = false;

    async function loadLiveAvailability() {
      setIsLoadingApi(true);
      setErrorMsg(null);
      try {
        const liveTypes = await fetchAvailability({
          check_in: arrival,
          check_out: departure,
          adults,
          children,
        });

        if (!isCancelled && liveTypes && liveTypes.length > 0) {
          const mapped: LocalRoom[] = liveTypes.map((rt) => {
            const primaryImg = rt.images?.find((i) => i.is_primary)?.image;
            const fallbackImg =
              DEFAULT_ROOMS.find((d) => d.name.toLowerCase().includes(rt.name.toLowerCase()))?.img ??
              DEFAULT_ROOMS[0].img;
            const imgPath = primaryImg
              ? primaryImg.startsWith("http")
                ? primaryImg
                : primaryImg.startsWith("/")
                ? primaryImg
                : `/${primaryImg}`
              : fallbackImg;

            return {
              id: rt.id,
              slug: rt.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              name: rt.name,
              meta: `${rt.bed_configuration || "Luxury Suite"} · ${rt.max_guests} Guests max`,
              price: Number(rt.base_price) || 250000,
              img: imgPath,
              roomsLeft: rt.rooms_left,
              featured: rt.id === 2,
            };
          });

          setRooms(mapped);
          if (!mapped.some((m) => m.id === selectedRoomId)) {
            setSelectedRoomId(mapped[0].id);
          }
        }
      } catch (err) {
        console.warn("Using local room structure:", err);
      } finally {
        if (!isCancelled) setIsLoadingApi(false);
      }
    }

    loadLiveAvailability();
    return () => {
      isCancelled = true;
    };
  }, [arrival, departure, adults, children, nights, selectedRoomId]);

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

  const move = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const canAdvance = useMemo(() => {
    if (step === 0) return nights > 0;
    if (step === 1) return !!selectedRoomId;
    if (step === 2) return firstName.trim().length > 0 && lastName.trim().length > 0 && email.includes("@");
    return true;
  }, [step, nights, selectedRoomId, firstName, lastName, email]);

  // Handle final reservation submission
  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await createBooking({
        room_type: selectedRoom.id,
        check_in: arrival,
        check_out: departure,
        adults,
        children,
        special_requests: notes,
        guests: [
          {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
        ],
      });

      // Seamless transition to confirmation with live reference
      const query = new URLSearchParams({
        ref: result.reference,
        token: result.access_token,
        room: selectedRoom.name,
        check_in: arrival,
        check_out: departure,
        nights: String(nights),
        guests: `${adults + children} guests`,
        total: `${total.toLocaleString()} TSH`,
        guest: `${firstName.trim()} ${lastName.trim()}`,
      });

      router.push(`/confirmation?${query.toString()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to confirm reservation.";
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ============ step indicators ============ */}
      <div className="glass rounded-[1.5rem] px-6 py-5">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <div key={s} className="flex flex-1 items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={[
                      "num flex h-7 w-7 items-center justify-center rounded-full text-[0.66rem] transition-all duration-700",
                      state === "done"
                        ? "border border-copper bg-copper text-[#17110a]"
                        : state === "active"
                        ? "border border-copper-light bg-copper/15 text-copper-light shadow-[0_0_24px_rgba(192,122,58,0.5)]"
                        : "border border-ivory/15 text-ivory/35",
                    ].join(" ")}
                  >
                    {state === "done" ? "✓" : `0${i + 1}`}
                  </span>
                  <span
                    className={[
                      "eyebrow hidden text-[0.7rem] sm:inline transition-colors duration-500",
                      state === "active"
                        ? "text-ivory"
                        : state === "done"
                        ? "text-copper-light"
                        : "text-ivory/30",
                    ].join(" ")}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className={[
                      "h-px flex-1 transition-all duration-700",
                      i < step ? "bg-copper/60" : "bg-ivory/10",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-[0.92rem] text-red-200">
          <p className="font-medium">Reservation Notice</p>
          <p className="mt-1 text-sm text-red-200/80">{errorMsg}</p>
        </div>
      )}

      {/* ============ step 1 — dates ============ */}
      {step === 0 && (
        <Reveal className="glass rounded-[1.75rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-copper-light">Step 01 — Dates</p>
              <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)] text-ivory">
                When will you arrive in Mbeya?
              </h2>
            </div>
            <span className="eyebrow rounded-full border border-copper/35 px-3 py-1 text-copper-light">
              Hospital Hill Retreat
            </span>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* calendar widget */}
            <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] p-5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Previous month"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/60 transition-colors duration-300 hover:border-copper/60 hover:text-ivory"
                >
                  ‹
                </button>
                <span className="eyebrow num text-ivory/80">
                  {MONTHS[cursor.m]} {cursor.y}
                </span>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Next month"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/60 transition-colors duration-300 hover:border-copper/60 hover:text-ivory"
                >
                  ›
                </button>
              </div>

              <div className="mt-5 grid grid-cols-7 text-center">
                {DOW.map((d, i) => (
                  <span
                    key={`${d}-${i}`}
                    className="eyebrow py-1 text-[0.66rem] text-ivory/30"
                  >
                    {d}
                  </span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1 text-center">
                {cells.map((d, i) => {
                  if (!d) return <span key={`empty-${i}`} className="h-10" />;
                  const v = iso(cursor.y, cursor.m, d);
                  const isArr = v === arrival;
                  const isDep = v === departure;
                  const inRange =
                    arrival &&
                    departure &&
                    new Date(v) > new Date(arrival) &&
                    new Date(v) < new Date(departure);

                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => pick(d)}
                      className={[
                        "num relative flex h-10 items-center justify-center rounded-xl text-[0.88rem] transition-all duration-300",
                        isArr || isDep
                          ? "bg-copper text-[#17110a] font-medium shadow-[0_0_18px_rgba(192,122,58,0.7)]"
                          : inRange
                          ? "bg-copper/20 text-copper-light"
                          : "text-ivory/70 hover:bg-ivory/10 hover:text-ivory",
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
                <p className="eyebrow text-ivory/35">Arrival Check-in</p>
                <p className="num mt-1.5 text-lg text-ivory">{fmt(arrival)}</p>
                <p className="mt-1 text-[0.8rem] font-light text-ivory/40">
                  From 14:00 — mountain welcome
                </p>
              </div>
              <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-5 py-4">
                <p className="eyebrow text-ivory/35">Departure Check-out</p>
                <p className="num mt-1.5 text-lg text-ivory">{fmt(departure)}</p>
                <p className="mt-1 text-[0.8rem] font-light text-ivory/40">
                  Until 11:00 (late checkout by request)
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-copper-light">Step 02 — Select a room</p>
              <h2 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)] text-ivory">
                Authentic Hotel Accommodations
              </h2>
            </div>
            {isLoadingApi && (
              <span className="eyebrow text-copper-light animate-pulse">
                Syncing with Live Hotel Inventory…
              </span>
            )}
          </div>

          <div className="mt-7 flex flex-col gap-4">
            {rooms.map((r) => {
              const active = r.id === selectedRoomId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoomId(r.id)}
                  className={[
                    "group relative flex items-center gap-5 rounded-[1.4rem] border p-4 text-left transition-all duration-700 ease-fluid",
                    active
                      ? "border-copper/70 bg-copper/10 shadow-[0_24px_60px_-34px_rgba(192,122,58,0.9)]"
                      : "border-ivory/10 bg-ivory/[0.03] hover:-translate-y-0.5 hover:border-ivory/25 hover:bg-ivory/[0.06]",
                  ].join(" ")}
                >
                  <span className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl">
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
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      {r.featured && (
                        <span className="eyebrow rounded-full border border-copper/45 bg-copper/15 px-2.5 py-0.5 text-[0.6rem] text-copper-light">
                          Signature Suite
                        </span>
                      )}
                      {r.roomsLeft !== undefined && (
                        <span className="eyebrow text-[0.64rem] text-ivory/50">
                          {r.roomsLeft} available in hotel
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="text-right">
                    <span className="num display block text-2xl text-ivory">
                      {r.price.toLocaleString()}
                    </span>
                    <span className="eyebrow mt-1 block text-ivory/35">
                      TSH / night
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
          <p className="eyebrow text-copper-light">Step 03 — Guests & Information</p>
          <h2 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.6rem)] text-ivory">
            Who is staying?
          </h2>

          <div className="mt-7 flex flex-col gap-3">
            {[
              { label: "Adults", hint: "13 years and older", value: adults, set: setAdults },
              { label: "Children", hint: "Family & Kid friendly", value: children, set: setChildren },
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
                    onClick={() => row.set(Math.max(row.label === "Adults" ? 1 : 0, row.value - 1))}
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

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow text-ivory/40" htmlFor="first_name">
                First Name *
              </label>
              <input
                id="first_name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ivory/10 bg-ivory/[0.04] px-4 py-3 text-[0.95rem] text-ivory focus:border-copper/60 focus:outline-none"
                placeholder="Samuel"
                required
              />
            </div>
            <div>
              <label className="eyebrow text-ivory/40" htmlFor="last_name">
                Last Name *
              </label>
              <input
                id="last_name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ivory/10 bg-ivory/[0.04] px-4 py-3 text-[0.95rem] text-ivory focus:border-copper/60 focus:outline-none"
                placeholder="Charles"
                required
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow text-ivory/40" htmlFor="email">
                Email Address (for confirmation) *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ivory/10 bg-ivory/[0.04] px-4 py-3 text-[0.95rem] text-ivory focus:border-copper/60 focus:outline-none"
                placeholder="samuel.charles2255@gmail.com"
                required
              />
            </div>
            <div>
              <label className="eyebrow text-ivory/40" htmlFor="phone">
                Phone / WhatsApp Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-ivory/10 bg-ivory/[0.04] px-4 py-3 text-[0.95rem] text-ivory focus:border-copper/60 focus:outline-none"
                placeholder="+255 618 130 940"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="eyebrow text-ivory/40" htmlFor="notes">
              Special requests & airport shuttle arrival time
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Songwe Airport pickup time, quiet side of the building, extra towels..."
              className="mt-3 w-full resize-none rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-5 py-4 text-[0.95rem] font-light leading-relaxed text-ivory placeholder:text-ivory/30 focus:border-copper/60 focus:outline-none"
            />
          </div>
        </Reveal>
      )}

      {/* ============ step 4 — confirm ============ */}
      {step === 3 && (
        <Reveal className="glass rounded-[1.75rem] p-6 sm:p-8">
          <p className="eyebrow text-copper-light">Step 04 — Review & Secure Reservation</p>
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
              `${firstName} ${lastName}`,
              email,
              phone,
              notes,
            ).map(([k, v]) => (
              <div
                key={k}
                className="hairline flex items-baseline justify-between gap-8 py-4"
              >
                <dt className="eyebrow text-ivory/40">{k}</dt>
                <dd className="text-right text-[0.98rem] font-light text-ivory/85">
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-2xl border border-copper/30 bg-copper/[0.08] p-4 text-[0.88rem] font-light leading-relaxed text-ivory/70">
            <p className="text-copper-light font-medium">Hotel FreeBuff Policy</p>
            <p className="mt-1">
              No prepayment is charged today. A 15-minute hold is immediately confirmed in
              our live database upon reservation, and payment is settled on arrival at Hospital Hill Rd, Mbeya.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirmReservation}
            disabled={isSubmitting}
            className="btn btn-copper btn-sheen mt-7 w-full disabled:opacity-50"
          >
            {isSubmitting ? "Registering Reservation in HotelSys…" : "Confirm Reservation in Mbeya"}
            <ArrowRight />
          </button>
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
                {total.toLocaleString()} TSH
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
