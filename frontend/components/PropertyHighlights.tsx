import Reveal from "@/components/Reveal";
import { SectionHead } from "@/components/ui";

const ratings = [
  { label: "Rooms", score: "5.0", stars: "★★★★★", note: "Top-tier comfort & finishes" },
  { label: "Value", score: "5.0", stars: "★★★★★", note: "Exceptional luxury per night" },
  { label: "Service", score: "4.0", stars: "★★★★☆", note: "Dedicated attentive hosts" },
];

const amenities = [
  {
    title: "Free Parking",
    desc: "Private, secure paved parking on hotel premises with 24/7 security.",
    icon: (
      <svg className="h-5 w-5 text-copper-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    title: "Free High Speed WiFi",
    desc: "Dedicated fiber internet throughout all suites, dining spaces, and meeting halls.",
    icon: (
      <svg className="h-5 w-5 text-copper-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
  },
  {
    title: "Hot Tub & Ensuite Baths",
    desc: "Modern luxury bathrooms with soothing hot water tubs and walk-in showers.",
    icon: (
      <svg className="h-5 w-5 text-copper-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Bar / Lounge",
    desc: "Relaxed evening lounge serving refined wines, local spirits, and signature cocktails.",
    icon: (
      <svg className="h-5 w-5 text-copper-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z" />
      </svg>
    ),
  },
  {
    title: "Kid & Family Friendly",
    desc: "Comfortable family suites, children activities, and child-safe hospitality.",
    icon: (
      <svg className="h-5 w-5 text-copper-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Airport Transportation",
    desc: "Seamless 25-minute private shuttle to and from Songwe Airport (MBI).",
    icon: (
      <svg className="h-5 w-5 text-copper-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  {
    title: "Meeting & Conference Rooms",
    desc: "Professional audiovisual presentation halls and executive banquet seating.",
    icon: (
      <svg className="h-5 w-5 text-copper-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default function PropertyHighlights() {
  return (
    <section id="amenities" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Header & Specialty Lodging Badge */}
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHead
              index="04"
              eyebrow="Specialty Lodging"
              title={
                <>
                  Recognized Hospitality
                  <br className="hidden sm:block" /> in Mbeya
                </>
              }
            />
            <div className="glass trail flex items-center gap-3.5 rounded-full px-5 py-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-copper animate-pulse" />
              <span className="eyebrow num text-copper-light">
                #10 of 12 Specialty Lodging in Mbeya
              </span>
            </div>
          </div>
        </Reveal>

        {/* Verified Ratings Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {ratings.map((r, i) => (
            <Reveal key={r.label} delay={i * 90}>
              <div className="glass group relative overflow-hidden rounded-[1.75rem] p-7 transition-all duration-700 hover:-translate-y-1 hover:border-copper/40">
                <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-copper/10 blur-2xl transition-all duration-700 group-hover:bg-copper/20" />
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-ivory/45">{r.label}</span>
                  <span className="text-[0.8rem] tracking-widest text-copper-light">
                    {r.stars}
                  </span>
                </div>
                <p className="display mt-4 text-[clamp(2.6rem,4vw,3.6rem)] text-ivory">
                  {r.score}
                  <span className="ml-1 text-sm font-light text-ivory/40">/ 5.0</span>
                </p>
                <p className="mt-2 text-[0.88rem] font-light text-ivory/60">
                  {r.note}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Property Amenities Grid */}
        <div className="mt-16">
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-copper/70" />
              <span className="eyebrow text-copper-light">Property Amenities</span>
            </div>
            <h3 className="display mt-4 text-[clamp(1.8rem,3vw,2.5rem)] text-ivory">
              Everything crafted for your comfort
            </h3>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {amenities.map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div className="glass flex h-full flex-col justify-between rounded-2xl p-6 transition-colors duration-500 hover:border-copper/40">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-copper/30 bg-copper/10">
                      {item.icon}
                    </div>
                    <h4 className="mt-4 text-[1.05rem] font-medium text-ivory">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-[0.85rem] font-light leading-relaxed text-ivory/55">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-copper-light" />
                    <span className="eyebrow text-[0.66rem] text-copper-light">Included</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

