import type { Metadata } from "next";
import BookingFlow from "@/components/BookingFlow";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Book your stay — AETHER",
  description:
    "Four quiet steps: dates, room, guests, confirm. No deposit before forty-eight hours.",
};

export default function BookingPage() {
  return (
    <main className="relative min-h-screen">
      {/* ============ split: atmospheric image ============ */}
      <aside className="relative lg:fixed lg:inset-y-0 lg:left-0 lg:w-[38%]">
        <div className="relative h-[42vh] overflow-hidden lg:h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.bookingExterior}
            alt="AETHER under soft evening light"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          <span className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/30 to-charcoal lg:bg-gradient-to-r lg:from-charcoal/60 lg:via-charcoal/10 lg:to-charcoal" />
          <span className="shaft opacity-70" />

          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-12">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-copper" />
              <span className="eyebrow text-copper-light">
                Reservations
              </span>
            </div>
            <p className="display mt-5 max-w-sm text-[clamp(2rem,3.4vw,3.1rem)] leading-[1.05] text-ivory">
              Four steps.
              <br />
              <em className="italic text-copper-light">Then the door opens.</em>
            </p>
            <p className="mt-5 max-w-xs text-[0.92rem] font-light leading-relaxed text-ivory/55">
              Flexible dates, no deposit, and a person on the other end if you
              would rather speak.
            </p>

            <div className="mt-8 hidden gap-x-10 gap-y-3 lg:flex lg:flex-wrap">
              {[
                ["38.71° N", "Lisboa"],
                ["24", "Suites"],
                ["24/7", "Concierge"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="num display text-2xl text-ivory">{v}</p>
                  <p className="eyebrow mt-1 text-ivory/35">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ============ booking interface ============ */}
      <section className="relative px-4 pb-16 pt-10 sm:px-8 lg:ml-[38%] lg:pt-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="eyebrow text-ivory/40">aether-collection.com</p>
            <h1 className="display mt-4 text-[clamp(2.2rem,4.4vw,3.4rem)] text-ivory">
              Book your stay
            </h1>
          </Reveal>

          <div className="mt-8">
            <BookingFlow />
          </div>
        </div>
      </section>
    </main>
  );
}
