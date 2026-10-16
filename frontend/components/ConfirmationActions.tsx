"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Reveal from "@/components/Reveal";
import { ArrowRight } from "@/components/ui";

export default function ConfirmationActions() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const reference = searchParams?.get("ref") || "HB-AET40817";
  const roomName = searchParams?.get("room") || "Executive King Suite";
  const checkIn = searchParams?.get("check_in") || "14 Oct 2026";
  const checkOut = searchParams?.get("check_out") || "17 Oct 2026";
  const nights = searchParams?.get("nights") || "3";
  const guests = searchParams?.get("guests") || "2 adults";
  const total = searchParams?.get("total") || "780,000 TSH";
  const guestName = searchParams?.get("guest") || "Samuel Charles";

  const summary: [string, string][] = [
    ["Reservation Ref", reference],
    ["Dates", `${checkIn} — ${checkOut}`],
    ["Nights", `${nights} night${nights === "1" ? "" : "s"}`],
    ["Room", roomName],
    ["Guest", guestName],
    ["Total Amount", total],
  ];

  const itinerary = [
    [`Arrival (${checkIn})`, "14:00", "Hospital Hill Rd welcome — parking & check-in"],
    ["Evening", "19:30", "Dinner & drinks at the on-site Restaurant & Lounge"],
    ["Morning", "07:30", "Fresh highland breakfast & mountain view coffee"],
    [`Departure (${checkOut})`, "11:00", "Check-out (Songwe airport shuttle as arranged)"],
  ];

  const addToCalendar = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AETHER//Stay//EN",
      "BEGIN:VEVENT",
      `UID:${reference}@aether-mbeya.com`,
      "DTSTAMP:20261015T090000Z",
      `SUMMARY:AETHER Luxury Hotel — ${roomName}`,
      "LOCATION:Hospital Hill Rd (4C5R+R3H), Mbeya, Tanzania",
      `DESCRIPTION:Reservation ${reference}. Guest: ${guestName}. Total: ${total}. Free Parking, High-Speed WiFi, Hot Tub, Airport Transportation.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aether-${reference.toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2600);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* -------- summary card -------- */}
      <Reveal delay={220}>
        <div className="glass rounded-[1.75rem] p-7 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-ivory/40">Reservation Confirmed</span>
            <span className="eyebrow rounded-full border border-copper/45 bg-copper/10 px-3 py-1.5 text-copper-light">
              Live Database Hold Active
            </span>
          </div>

          <dl className="mt-5">
            {summary.map(([k, v]) => (
              <div
                key={k}
                className="hairline flex items-baseline justify-between gap-6 py-3.5"
              >
                <dt className="eyebrow text-ivory/40">{k}</dt>
                <dd
                  className={`num text-right text-[0.98rem] font-light text-ivory/90 ${
                    k === "Total Amount" ? "display text-2xl text-copper-light" : ""
                  }`}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          {/* -------- two liquid-glass buttons -------- */}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn btn-glass btn-sheen w-full !border-copper/40"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(192,122,58,0.22), inset 0 1px 0 0 rgba(255,255,255,0.28), 0 24px 50px -28px rgba(192,122,58,0.75)",
              }}
            >
              {open ? "Hide Details" : "View Itinerary"}
            </button>
            <button
              type="button"
              onClick={addToCalendar}
              className="btn btn-glass btn-sheen w-full !border-copper/40"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(192,122,58,0.22), inset 0 1px 0 0 rgba(255,255,255,0.28), 0 24px 50px -28px rgba(192,122,58,0.75)",
              }}
            >
              {copied ? "Added to Calendar ✓" : "Add to Calendar"}
            </button>
          </div>

          {/* -------- itinerary (expands) -------- */}
          <div
            className={`grid transition-all duration-700 ease-fluid ${
              open ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <ol className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] p-5">
                {itinerary.map(([d, t, text]) => (
                  <li
                    key={d + t}
                    className="flex gap-4 border-b border-ivory/[0.07] py-3 last:border-0 last:pb-0 first:pt-0"
                  >
                    <span className="num w-24 shrink-0 text-[0.72rem] tracking-wider text-copper-light">
                      {d}
                    </span>
                    <span className="num w-12 shrink-0 text-[0.72rem] tracking-wider text-ivory/40">
                      {t}
                    </span>
                    <span className="text-[0.9rem] font-light leading-snug text-ivory/75">
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Reveal>

      {/* -------- next steps -------- */}
      <Reveal delay={340}>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <Link
            href="/rooms/north-light-suite"
            className="eyebrow group inline-flex items-center gap-3 text-ivory/55 transition-colors duration-500 hover:text-ivory"
          >
            See suite photography
            <ArrowRight className="transition-transform duration-700 ease-fluid group-hover:translate-x-1.5" />
          </Link>
          <span className="h-1 w-1 rounded-full bg-ivory/20" />
          <Link
            href="/"
            className="eyebrow group inline-flex items-center gap-3 text-ivory/55 transition-colors duration-500 hover:text-ivory"
          >
            Back to homepage
            <ArrowRight className="transition-transform duration-700 ease-fluid group-hover:translate-x-1.5" />
          </Link>
        </div>

        <p className="mx-auto mt-8 max-w-sm text-center text-[0.85rem] font-light leading-relaxed text-ivory/40">
          Hospital Hill Rd (4C5R+R3H), Mbeya, Tanzania · Phone/WhatsApp:{" "}
          <a href="tel:+255618130940" className="link-line text-copper-light">
            +255 618 130 940
          </a>
        </p>
      </Reveal>
    </div>
  );
}
