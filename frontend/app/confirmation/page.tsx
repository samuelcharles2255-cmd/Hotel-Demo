import type { Metadata } from "next";
import ConfirmationActions from "@/components/ConfirmationActions";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Your stay is confirmed — AETHER",
  description: "Reservation AET-40817 — North Light Suite, 14–17 October 2026.",
};

export default function ConfirmationPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pb-24 pt-36 sm:px-8">
      {/* atmosphere — breathing copper glow + caustic light */}
      <span
        className="pointer-events-none absolute left-1/2 top-[22%] h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-copper/20 blur-[130px]"
        style={{ animation: "glow-breathe 9s ease-in-out infinite alternate" }}
      />
      <span
        className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-copper/10 blur-[120px]"
        style={{ animation: "glow-breathe 12s ease-in-out infinite alternate-reverse" }}
      />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper/50 to-transparent" />

      <div className="relative flex w-full flex-col items-center">
        {/* -------- headline -------- */}
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-copper/70" />
            <span className="eyebrow text-copper-light">
              Reservation AET-40817
            </span>
            <span className="h-px w-8 bg-copper/70" />
          </div>
        </Reveal>

        <Reveal delay={130}>
          <h1 className="display glow-title mt-8 max-w-[13ch] text-center text-[clamp(2.8rem,7.5vw,6rem)] text-ivory">
            Your stay is{" "}
            <em className="font-normal italic text-copper-light">confirmed</em>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-7 max-w-md text-center text-[1rem] font-light leading-relaxed text-ivory/55">
            The North Light Suite is yours from the afternoon of 14 October.
            Nothing else is required of you.
          </p>
        </Reveal>

        {/* -------- room framed in floating liquid glass -------- */}
        <Reveal delay={320} className="mt-12 w-full max-w-xl">
          <figure className="glass trail float relative overflow-hidden rounded-[1.75rem] p-2.5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images.confirmRoom}
                alt="North Light Suite"
                loading="eager"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-copper-light">Suite 07</p>
                  <p className="display mt-1.5 text-2xl text-ivory">
                    North Light Suite
                  </p>
                </div>
                <p className="num text-[0.72rem] tracking-widest text-ivory/55">
                  68 m²
                </p>
              </figcaption>
            </div>
            {/* refractive highlight on top edge */}
            <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </figure>
        </Reveal>

        {/* -------- summary + actions -------- */}
        <div className="mt-10 w-full">
          <ConfirmationActions />
        </div>
      </div>
    </main>
  );
}
