import Reveal from "@/components/Reveal";
import { SectionHead } from "@/components/ui";
import { ArrowLink } from "@/components/ui";

/**
 * Map & location — exact Google Maps embed in Mbeya, Tanzania (Hospital Hill Rd),
 * styled in dark liquid-glass frame with coordinate telemetry and arrival details.
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
                Hospital Hill
                <br className="hidden sm:block" /> Mbeya Highlands
              </>
            }
          />

          <p className="mt-8 max-w-md text-[1.02rem] font-light leading-relaxed text-ivory/55">
            Nestled peacefully along Hospital Hill Road in the southern highlands of Mbeya,
            AETHER offers calm retreat with sweeping mountain air and serene valley views.
            Enjoy secure on-site parking, quiet surroundings, and dedicated airport transfers
            connecting you to Songwe Airport.
          </p>

          <dl className="mt-10 max-w-md">
            {[
              ["Address", "Hospital Hill Rd (4C5R+R3H)"],
              ["City", "Mbeya, Tanzania"],
              ["Coordinates", "8°53′26″ S — 33°26′18″ E"],
              ["From Songwe Airport (MBI)", "25 minutes by airport transfer"],
              ["Property Amenities", "Free parking, High-Speed WiFi, Hot tub, Bar/Lounge"],
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3941.8821814491803!2d33.43838671435692!3d-8.890544900000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19aa75551bca87b1%3A0x2b8326a6eac6fa57!2s4C5R%2BR3H%2C%20Hospital%20Hill%20Rd%2C%20Mbeya!5e0!3m2!1sen!2stz!4v1792060197828!5m2!1sen!2stz"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Map — AETHER Luxury Hotel, Hospital Hill Rd, Mbeya, Tanzania"
                className="absolute inset-0 h-full w-full"
              />
              {/* top refractive highlight */}
              <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <span className="eyebrow text-ivory/50">Mbeya, Tanzania</span>
              <span className="eyebrow num text-copper-light">
                33.438° E — 8.891° S
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
