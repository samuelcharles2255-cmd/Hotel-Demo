import type { Metadata } from "next";
import Link from "next/link";
import BookingPanel from "@/components/BookingPanel";
import Reveal from "@/components/Reveal";
import { ArrowRight, SectionHead } from "@/components/ui";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Executive King Suite — AETHER Luxury Hotel",
  description:
    "An opulent executive king suite in Mbeya featuring rich mahogany paneling, an ergonomic workstation, private kitchenette, and ensuite hot tub bath.",
};

const specs = [
  ["Size", "68 m² / 732 ft²"],
  ["Bed", "Opulent King Bed, mahogany wood headboard"],
  ["View", "Mbeya mountain slopes & skyline"],
  ["Bath", "Modern ensuite, hot tub & vanity"],
  ["Workstation", "Ergonomic desk, smart TV, fiber WiFi"],
  ["Kitchenette", "Induction stove, kettle, sink & fridge"],
  ["Occupancy", "Two guests (+1 child)"],
  ["Location", "Hospital Hill Road, Mbeya"],
];

const gallery = [
  { src: images.suiteGallery[0], label: "Living Salon" },
  { src: images.suiteGallery[1], label: "Bath & Hot Tub" },
  { src: images.suiteGallery[2], label: "Workstation & Console" },
  { src: images.suiteGallery[3], label: "In-room Kitchenette" },
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
            alt="Executive King Suite in warm highland light"
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
                Executive Suite 101 — Hospital Hill
              </span>
              <span className="eyebrow text-ivory/35">250,000 TSH / night</span>
            </div>
          </Reveal>

          <Reveal delay={130}>
            <h1 className="display mt-7 max-w-[14ch] text-[clamp(3rem,8.5vw,7rem)] text-ivory">
              Executive King
              <br />
              <em className="font-normal italic text-copper-light">Suite</em>
            </h1>
          </Reveal>

          <Reveal delay={260}>
            <p className="mt-7 max-w-lg text-[1.02rem] font-light leading-relaxed text-ivory/60">
              Warm mahogany paneling, ambient cove lighting, an opulent king-size bed,
              and a dedicated workstation overlooking the cool mountain breeze of Mbeya.
            </p>
          </Reveal>

          <Reveal delay={380}>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {[
                "68 m²",
                "King Bed",
                "Mountain view",
                "Hot tub bath",
                "Kitchenette",
                "Fiber WiFi",
              ].map((t) => (
                <li
                  key={t}
                  className="eyebrow flex items-center gap-2.5 text-ivory/50"
                >
                  <span className="h-1 w-1 rounded-full bg-copper" />
                  {t}
                </li>
              ))}
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
                Engineered for executive comfort — rich timber finishes,
                whisper-quiet acoustics, private kitchen amenities, and
                panoramic light rising across the Southern Highlands.
              </p>
            </Reveal>

            {/* gallery — floating glass frames with soft trails */}
            <Reveal delay={120} className="mt-14">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-ivory/45">The suite in frames</span>
                <span className="eyebrow num text-copper-light">04 Real Views</span>
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
              <SectionHead eyebrow="The Space" title="Crafted for quiet excellence" />
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
                    alt="Warm lighting across the Executive King Bedroom"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 max-w-xs">
                    <p className="eyebrow text-copper-light">Hospital Hill Rd, Mbeya</p>
                    <p className="mt-2 text-[0.95rem] font-light leading-relaxed text-ivory/75">
                      Peaceful highland mornings and restful evenings above the valley.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* amenities */}
            <Reveal delay={120} className="mt-16">
              <span className="eyebrow text-ivory/45">Included with stay</span>
              <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {[
                  "Free High Speed Internet (WiFi)",
                  "Hot tub & private luxury ensuite bath",
                  "In-room kitchenette with induction cooktop",
                  "Ergonomic work desk & smart flat-screen TV",
                  "Free private parking on premises",
                  "Songwe Airport transportation by arrangement",
                  "Bar / lounge access & breakfast buffet",
                  "Late checkout service upon request",
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
                  Check All Available Rooms
                  <ArrowRight />
                </Link>
                <Link href="/#amenities" className="btn btn-ghost">
                  Property Amenities
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
