import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ivory/10 bg-charcoal-deep px-6 pb-10 pt-20 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="display text-[2rem] leading-none tracking-[0.3em] text-ivory">
              AETHER
            </p>
            <p className="mt-5 text-[0.95rem] font-light leading-relaxed text-ivory/50">
              A contemporary art hotel. Twenty-four suites, one courtyard of
              light, and a collection that never stops changing.
            </p>
            <p className="eyebrow mt-7 text-ivory/35">
              aether-collection.com
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-3">
            <div>
              <p className="eyebrow text-copper-light">Stay</p>
              <ul className="mt-5 space-y-3 text-[0.95rem] font-light text-ivory/55">
                <li>
                  <Link className="link-line hover:text-ivory" href="/rooms/north-light-suite">
                    Rooms
                  </Link>
                </li>
                <li>
                  <Link className="link-line hover:text-ivory" href="/booking">
                    Booking
                  </Link>
                </li>
                <li>
                  <Link className="link-line hover:text-ivory" href="/confirmation">
                    Confirmation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow text-copper-light">Hotel</p>
              <ul className="mt-5 space-y-3 text-[0.95rem] font-light text-ivory/55">
                <li>
                  <Link className="link-line hover:text-ivory" href="/#experience">
                    Experience
                  </Link>
                </li>
                <li>
                  <Link className="link-line hover:text-ivory" href="/#art">
                    Art
                  </Link>
                </li>
                <li>
                  <Link className="link-line hover:text-ivory" href="/#dining">
                    Dining
                  </Link>
                </li>
                <li>
                  <Link className="link-line hover:text-ivory" href="/#location">
                    Location
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow text-copper-light">Contact</p>
              <ul className="mt-5 space-y-3 text-[0.95rem] font-light text-ivory/55">
                <li>Plot 14, Harbour Quarter</li>
                <li>Mwanza, Tanzania</li>
                <li>
                  <a className="link-line hover:text-ivory" href="tel:+255282500000">
                    +255 28 250 0000
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rule mt-16" />

        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-[0.72rem] tracking-[0.18em] text-ivory/30 uppercase sm:flex-row sm:items-center">
          <span>© 2026 AETHER Collection</span>
          <span>Quiet luxury · Mwanza</span>
        </div>
      </div>
    </footer>
  );
}
