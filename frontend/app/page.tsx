import Link from "next/link";
import BookingBar from "@/components/BookingBar";
import LocationMap from "@/components/LocationMap";
import PropertyHighlights from "@/components/PropertyHighlights";
import Reveal from "@/components/Reveal";
import { ArrowRight, ArrowLink, SectionHead } from "@/components/ui";
import { images } from "@/lib/images";

const cards = [
  {
    n: "01",
    label: "Suites",
    title: "Executive Retreats",
    body: "Spacious suites with opulent king beds, rich mahogany paneling, private kitchenettes, and modern hot tub baths.",
    href: "/rooms/north-light-suite",
    img: images.cardRooms,
    id: undefined,
  },
  {
    n: "02",
    label: "Living",
    title: "Executive Salons",
    body: "Expansive living suites with leather lounges, dedicated work consoles, ambient lighting, and serene highland views.",
    href: "/#experience",
    img: images.cardExperience,
    id: "experience",
  },
  {
    n: "03",
    label: "Hospitality",
    title: "Amenities & Spaces",
    body: "Ranked #10 Specialty lodging in Mbeya with free parking, high-speed WiFi, conference hall, and airport shuttle.",
    href: "/#amenities",
    img: images.cardArt,
    id: "amenities",
  },
];

export default function Home() {
  return (
    <main className="relative">
      {/* ============================================================
          HERO — cinematic light across brutalist concrete
      ============================================================ */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-28 pt-40 sm:px-8">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.homeHero}
            alt="Soft light cutting across brutalist concrete"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          <span className="absolute inset-0 bg-gradient-to-b from-charcoal/85 via-charcoal/45 to-charcoal" />
          <span className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-transparent to-transparent" />
          <span className="shaft" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl">
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-copper" />
              <span className="eyebrow text-copper-light">
                Specialty Luxury Lodging — Hospital Hill, Mbeya
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="display mt-8 max-w-[16ch] text-[clamp(3.2rem,9vw,7.5rem)] text-ivory">
              Highland light,
              <br />
              quiet <em className="font-normal italic text-copper-light">luxury</em>
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-8 max-w-md text-[1.02rem] font-light leading-relaxed text-ivory/60">
              AETHER is an oasis of refined hospitality in Mbeya, Tanzania — offering
              executive suites, rich mahogany woodwork, mountain serenity, and attentive personal service.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-11 flex flex-wrap items-center gap-5">
              <Link href="/booking" className="btn btn-copper btn-sheen trail">
                Check Availability
                <ArrowRight />
              </Link>

              <Link
                href="/rooms/north-light-suite"
                className="eyebrow group inline-flex items-center gap-3 text-ivory/60 transition-colors duration-500 hover:text-ivory"
              >
                View the Executive King Suite
                <span className="h-px w-8 bg-ivory/30 transition-all duration-700 ease-fluid group-hover:w-14 group-hover:bg-copper" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-16 flex items-center gap-6 text-ivory/35">
            <span className="eyebrow">Scroll</span>
            <span className="relative h-8 w-px overflow-hidden bg-ivory/15">
              <span
                className="absolute inset-x-0 top-0 h-4 bg-copper"
                style={{ animation: "cue-drop 2.6s ease-in-out infinite" }}
              />
            </span>
            <span className="eyebrow num hidden sm:inline">
              8.89° S — 33.44° E
            </span>
          </div>
        </div>

        {/* floating glass weather chip — parallax-ready */}
        <Reveal
          delay={520}
          className="absolute right-6 top-32 hidden lg:block xl:right-12"
        >
          <div className="glass float rounded-2xl px-6 py-5">
            <p className="eyebrow text-ivory/45">Right now</p>
            <p className="display mt-2 text-3xl text-ivory">21°</p>
            <p className="mt-1 text-[0.78rem] font-light tracking-wide text-ivory/45">
              Clear — light from the west
            </p>
          </div>
        </Reveal>
      </section>

      {/* ============================================================
          COLLECTION — three floating glass cards
      ============================================================ */}
      <section
        id="collection"
        className="relative px-5 pb-10 pt-24 sm:px-8 sm:pt-32"
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHead
              eyebrow="The Collection"
              title={
                <>
                  Three ways to
                  <br className="hidden sm:block" /> enter the house
                </>
              }
              className="mb-16"
            />
          </Reveal>

          <div className="flex flex-col gap-6 sm:gap-8">
            {cards.map((c, i) => (
              <Reveal key={c.n} delay={i * 110} as="article">
                <Link
                  href={c.href}
                  id={c.id}
                  className="glass group relative flex flex-col overflow-hidden rounded-[1.75rem] transition-[transform,box-shadow] duration-[900ms] ease-fluid hover:-translate-y-1.5 hover:shadow-[0_50px_90px_-45px_rgba(192,122,58,0.55)] sm:rounded-[2rem]"
                >
                  {/* motion-trail highlight */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-transform duration-[1600ms] ease-fluid group-hover:translate-x-full" />

                  <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-10 sm:p-8">
                    <div className="flex items-start gap-6 sm:w-[46%]">
                      <span className="num text-copper text-[0.72rem] leading-none tracking-[0.2em] pt-1.5">
                        {c.n}
                      </span>
                      <div>
                        <p className="eyebrow text-ivory/45">{c.label}</p>
                        <h3 className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)] text-ivory transition-colors duration-500 group-hover:text-white">
                          {c.title}
                        </h3>
                        <p className="mt-4 max-w-sm text-[0.95rem] font-light leading-relaxed text-ivory/55">
                          {c.body}
                        </p>
                        <span className="eyebrow mt-6 inline-flex items-center gap-3 text-copper-light">
                          Discover
                          <ArrowRight className="transition-transform duration-700 ease-fluid group-hover:translate-x-2" />
                        </span>
                      </div>
                    </div>

                    <div className="relative flex-1">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.img}
                          alt={`${c.label} — ${c.title}`}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full scale-[1.04] object-cover transition-transform duration-[1600ms] ease-fluid group-hover:scale-[1.12]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-tr from-charcoal/50 via-transparent to-transparent" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          EXPERIENCE — editorial statement
      ============================================================ */}
      <section id="experience" className="relative px-5 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <Reveal>
            <SectionHead
              index="02"
              eyebrow="Experience"
              title={
                <>
                  The luxury of an
                  <br className="hidden sm:block" /> unmeasured hour
                </>
              }
            />
            <p className="mt-8 max-w-md text-[1.02rem] font-light leading-relaxed text-ivory/55">
              No lobby music. No key-card queues. A single host meets you at
              the door, the courtyard is yours before ten, and breakfast is
              served whenever you wake — on stone, in silence, with the day&apos;s
              first light.
            </p>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                ["24", "Suites"],
                ["41", "Works"],
                ["1", "Courtyard"],
              ].map(([v, l]) => (
                <div key={l} className="glass rounded-2xl px-4 py-5 text-center">
                  <dt className="display text-3xl text-copper-light">{v}</dt>
                  <dd className="eyebrow mt-2 text-ivory/40">{l}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              <ArrowLink href="/booking">Plan your stay</ArrowLink>
            </div>
          </Reveal>

          <Reveal delay={160} className="relative">
            <div className="glass float-slow relative overflow-hidden rounded-[2rem] p-2.5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images.concreteTexture}
                  alt="Concrete and light"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                <div className="glass absolute inset-x-5 bottom-5 rounded-2xl px-5 py-4">
                  <p className="eyebrow text-copper-light">Listening Room</p>
                  <p className="mt-2 text-[0.95rem] font-light text-ivory/70">
                    Analog only. One record at a time.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          ART — full-bleed band
      ============================================================ */}
      <section id="art" className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.cardArt}
            alt="A living collection"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-charcoal/85" />
          <span className="shaft opacity-40" />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 py-32 text-center sm:px-8 sm:py-44">
          <Reveal>
            <p className="eyebrow text-copper-light">Art — A Living Collection</p>
            <blockquote className="display glow-title mt-9 text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1.1] text-ivory">
              “We didn&apos;t hang art in a hotel.
              <br className="hidden sm:block" /> We built a hotel{" "}
              <em className="italic text-copper-light">around</em> the art.”
            </blockquote>
            <p className="mx-auto mt-9 max-w-lg text-[0.98rem] font-light leading-relaxed text-ivory/55">
              Works rotate twice a year. Guests receive the curatorial note
              under their door each Thursday — no labels on the walls, no
              plaques, no noise.
            </p>
            <div className="mt-11 flex justify-center">
              <Link href="/booking" className="btn btn-glass btn-sheen">
                Walk the collection
                <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          DINING
      ============================================================ */}
      <section id="dining" className="relative px-5 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal className="order-2 lg:order-1">
            <SectionHead
              eyebrow="Dining & Lounge"
              title={
                <>
                  Highland flavours,
                  <br className="hidden sm:block" /> warm hospitality
                </>
              }
            />
            <p className="mt-8 max-w-md text-[1.02rem] font-light leading-relaxed text-ivory/55">
              Our restaurant and lounge serves fresh cuisine inspired by the fertile
              slopes of Mbeya and the Southern Highlands. From vibrant breakfast buffets
              to elegant private dinners and relaxed evening drinks in the bar lounge.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/booking" className="btn btn-copper btn-sheen">
                Reserve a table
              </Link>
              <Link href="/rooms/north-light-suite" className="btn btn-ghost">
                View the suites
              </Link>
            </div>
          </Reveal>

          <Reveal delay={140} className="order-1 lg:order-2">
            <div className="glass rounded-[2rem] p-2.5">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images.dining}
                  alt="Restaurant & Dining Area — AETHER Mbeya"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1600ms] ease-fluid hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="eyebrow text-ivory/50">Restaurant & Lounge</span>
                <span className="eyebrow num text-copper-light">07:00 — 23:00</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          PROPERTY HIGHLIGHTS & RATINGS — #10 Specialty Lodging in Mbeya
      ============================================================ */}
      <PropertyHighlights />

      {/* ============================================================
          LOCATION — map & arrival
      ============================================================ */}
      <LocationMap />

      {/* ============================================================
          CLOSING CTA
      ============================================================ */}
      <section className="relative px-5 pb-40 pt-10 sm:px-8">
        <Reveal className="mx-auto max-w-6xl">
          <div className="glass trail relative overflow-hidden rounded-[2rem] px-7 py-16 text-center sm:px-14 sm:py-20">
            <span className="pointer-events-none absolute -top-24 left-1/2 h-56 w-96 -translate-x-1/2 rounded-full bg-copper/25 blur-[90px]" />
            <p className="eyebrow relative text-copper-light">
              Reservations — Open
            </p>
            <h2 className="display glow-title relative mt-6 text-[clamp(2.4rem,6vw,4.5rem)] text-ivory">
              Stay where the light lives
            </h2>
            <p className="relative mx-auto mt-6 max-w-md text-[0.98rem] font-light leading-relaxed text-ivory/55">
              Flexible arrival, no deposit before forty-eight hours, and a
              human on the other end of the line.
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/booking" className="btn btn-copper btn-sheen">
                Check Availability
                <ArrowRight />
              </Link>
              <Link href="/confirmation" className="btn btn-ghost">
                View a confirmation
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <div className="h-24" />
      <BookingBar />
    </main>
  );
}
