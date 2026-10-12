import Reveal from "@/components/Reveal";
import { SectionHead } from "@/components/ui";
import { ArrowLink } from "@/components/ui";

/**
 * Map & location — the user-supplied Google Maps embed, crowded house
 * style: glass frame, coordinates chip, arrival notes. Placeholders only;
 * the user swaps the map and copy for their own.
 */
export default function LocationMap() {
  return (
    <section id="location" className="relative px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* -------- editorial column -------- */}
        <Reveal>
          <SectionHead
            index="05"
            eyebrow="Location"
            title={
              <>
                At the centre
                <br className="hidden sm:block" /> of things
              </>
            }
          />

          <p className="mt-8 max-w-md text-[1.02rem] font-light leading-relaxed text-ivory/55">
            The house opens onto the harbour quarter — galleries, the morning
            market and the water within a short walk. Arrive by air, rail or
            boat; a host meets you at the courtyard door either way.
          </p>

          <dl className="mt-10 max-w-md">
            {[
              ["Address", "Plot 14, Harbour Quarter"],
              ["City", "Mwanza, Tanzania"],
              ["Coordinates", "8°52′44″ S — 33°56′42″ E"],
              ["From the airport", "Twenty minutes by arrangement"],
            ].map(([k, v]) => (
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

          <div className="mt-10">
            <ArrowLink href="/booking">Plan your stay</ArrowLink>
          </div>
        </Reveal>

        {/* -------- map in a floating glass frame -------- */}
        <Reveal delay={160} className="relative">
          <div className="glass trail float-slow relative overflow-hidden rounded-[2rem] p-2.5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d126144.23097352321!2d33.56505585927951!3d-8.878919003866494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2stz!4v1791360485266!5m2!1sen!2stz"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Map — AETHER, Mwanza, Tanzania"
                className="absolute inset-0 h-full w-full"
              />
              {/* top refractive highlight */}
              <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <span className="eyebrow text-ivory/50">Find us</span>
              <span className="eyebrow num text-copper-light">
                33.565° E — 8.879° S
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
