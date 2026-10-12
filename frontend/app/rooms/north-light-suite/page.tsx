import type { Metadata } from "next";
import Link from "next/link";
import BookingPanel from "@/components/BookingPanel";
import Reveal from "@/components/Reveal";
import { ArrowRight, SectionHead } from "@/components/ui";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "North Light Suite — AETHER",
  description:
    "A sunlit concrete suite with a sculptural bed, an original work, and morning light from three aspects.",
};

const specs = [
  ["Size", "68 m² / 732 ft²"],
  ["Bed", "Sculptural king, oak base"],
  ["View", "Courtyard & western light"],
  ["Bath", "Monolithic stone, deep tub"],
  ["Art", "Untitled (Ochre), 2024 — M. Reis"],
  ["Occupancy", "Two guests"],
];

const gallery = [
  { src: images.suiteGallery[0], label: "Living" },
  { src: images.suiteGallery[1], label: "Bath" },
  { src: images.suiteGallery[2], label: "Detail" },
  { src: images.suiteGallery[3], label: "Corner" },
];

export default function NorthLightSuitePage() {
  return (
    <main className="relative">
      {/* ============================================================
          HERO — full-screen suite
      ============================================================ */}
      <section className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden px-5 pb-20 pt-44 sm:px-8">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.suiteHero}
            alt="North Light Suite in soft morning light"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          <span className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/35 to-charcoal" />
          <span className="absolute inset-0 bg-gradient-to-r from-charcoal/60 to-transparent" />
          <span className="shaft" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl">
          <Reveal>
            <div className="flex flex-wrap items-center gap-4">
              <span className="h-px w-10 bg-copper" />
              <span className="eyebrow text-copper-light">
                Suite 07 — East House
              </span>
              <span className="eyebrow text-ivory/35">From €620 / night</span>
            </div>
          </Reveal>

          <Reveal delay={130}>
            <h1 className="display mt-7 max-w-[14ch] text-[clamp(3rem,8.5vw,7rem)] text-ivory">
              North Light
              <br />
              <em className="font-normal italic text-copper-light">Suite</em>
            </h1>
          </Reveal>

          <Reveal delay={260}>
            <p className="mt-7 max-w-lg text-[1.02rem] font-light leading-relaxed text-ivory/60">
              Morning arrives sideways here — across raw concrete, a
              sculptural bed, and one large ochre painting that changes colour
              every hour of the day.
            </p>
          </Reveal>

          <Reveal delay={380}>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {["68 m²", "2 guests", "Courtyard view", "Stone bath"].map(
                (t) => (
                  <li
                    key={t}
                    className="eyebrow flex items-center gap-2.5 text-ivory/50"
                  >
                    <span className="h-1 w-1 rounded-full bg-copper" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          BODY — editorial left, sticky booking right
      ============================================================ */}
      <section className="relative px-5 pb-24 pt-8 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_380px] lg:gap-16">
          {/* ---------------- left column ---------------- */}
          <div>
            <Reveal>
              <p className="display max-w-2xl text-[clamp(1.5rem,2.6vw,2.05rem)] leading-[1.35] text-ivory/85">
                The suite was left unfinished on purpose — formwork marks,
                poured floors, a single copper pipe — so that the light, the
                art and the silence would have something honest to sit against.
              </p>
            </Reveal>

            {/* gallery — floating glass frames with soft trails */}
            <Reveal delay={120} className="mt-14">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-ivory/45">The suite in frames</span>
                <span className="eyebrow num text-copper-light">04 / 12</span>
              </div>

              <div className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0">
                {gallery.map((g, i) => (
                  <figure
                    key={g.label}
                    className="glass group relative w-[74%] shrink-0 snap-start overflow-hidden rounded-[1.5rem] p-2 sm:w-[46%] lg:w-[32%]"
                    style={{ animationDelay: `${i * -1.6}s` }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.15rem]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={g.src}
                        alt={g.label}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full scale-[1.03] object-cover transition-transform duration-[1500ms] ease-fluid group-hover:scale-[1.1]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <figcaption className="absolute bottom-5 left-5 flex items-center gap-3">
                      <span className="num text-copper text-[0.68rem]">
                        0{i + 1}
                      </span>
                      <span className="eyebrow text-ivory/75">{g.label}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>

            {/* specs */}
            <Reveal delay={100} className="mt-16">
              <SectionHead eyebrow="The Space" title="Everything, considered" />
              <dl className="mt-9 grid gap-x-12 sm:grid-cols-2">
                {specs.map(([k, v]) => (
                  <div
                    key={k}
                    className="hairline flex items-baseline justify-between gap-6 py-4"
                  >
                    <dt className="eyebrow text-ivory/40">{k}</dt>
                    <dd className="text-right text-[0.95rem] font-light text-ivory/80">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {/* wide detail image */}
            <Reveal delay={140} className="mt-16">
              <div className="glass relative overflow-hidden rounded-[2rem] p-2.5">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images.suiteDetail}
                    alt="Morning light across the suite"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 max-w-xs">
                    <p className="eyebrow text-copper-light">07:40</p>
                    <p className="mt-2 text-[0.95rem] font-light leading-relaxed text-ivory/75">
                      The light crosses the bed in eleven minutes. We time
                      breakfast to it.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* amenities */}
            <Reveal delay={120} className="mt-16">
              <span className="eyebrow text-ivory/45">Included</span>
              <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {[
                  "Hand-thrown ceramics",
                  "Linocut prints by A. Vaz",
                  "Marshall speaker, vinyl bar",
                  "Stone hammam access",
                  "Breakfast, unscheduled",
                  "Airport transfer by arrangement",
                  "Curatorial note, Thursdays",
                  "Late checkout until 14:00",
                ].map((a) => (
                  <li
                    key={a}
                    className="hairline flex items-center gap-4 py-3.5 text-[0.95rem] font-light text-ivory/70"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-copper" />
                    {a}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={100} className="mt-16">
              <div className="flex flex-wrap gap-4">
                <Link href="/booking" className="btn btn-glass btn-sheen">
                  See all suites
                  <ArrowRight />
                </Link>
                <Link href="/#art" className="btn btn-ghost">
                  The collection
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ---------------- right column: sticky booking ---------------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <BookingPanel />
          </div>
        </div>
      </section>

      <div className="h-10" />
    </main>
  );
}
