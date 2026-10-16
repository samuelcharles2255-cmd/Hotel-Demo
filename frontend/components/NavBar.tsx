"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SessionTrail from "./SessionTrail";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Suites", href: "/rooms/north-light-suite" },
  { label: "Experience", href: "/#experience" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Dining", href: "/#dining" },
  { label: "Location", href: "/#location" },
];

export default function NavBar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const [scrolled, setScrolled] = useState(false);
  // The sheet records which route it was opened on, so any navigation
  // closes it — no effect, no cascading render.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
      <nav
        className={`pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-6 rounded-full px-5 py-3 transition-[box-shadow,background-color] duration-700 ease-fluid sm:px-7 ${
          scrolled ? "glass-deep" : "glass"
        }`}
      >
        <Link
          href="/"
          className="group flex items-baseline gap-2"
          aria-label="AETHER — home"
        >
          <span className="display text-[1.4rem] leading-none tracking-[0.34em] text-ivory transition-colors duration-500 group-hover:text-white sm:text-[1.55rem]">
            AETHER
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-copper transition-transform duration-500 ease-spring group-hover:scale-150 sm:block" />
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className={`eyebrow link-line transition-colors duration-500 ${
                    active ? "text-ivory" : "text-ivory/55 hover:text-ivory"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <SessionTrail />

          <span className="hidden h-6 w-px bg-ivory/15 md:block" />

          <ThemeToggle />

          <span className="hidden h-6 w-px bg-ivory/15 md:block" />

          <Link
            href="/booking"
            className="btn btn-copper btn-sheen hidden !px-6 !py-2.5 sm:inline-flex"
          >
            Reserve
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-ivory/15 bg-ivory/5 md:hidden"
          >
            <span
              className={`h-px w-4 bg-ivory transition-transform duration-500 ease-fluid ${
                open ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-4 bg-ivory transition-transform duration-500 ease-fluid ${
                open ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* mobile sheet */}
      <div
        className={`pointer-events-auto mx-auto mt-3 max-w-6xl overflow-hidden rounded-3xl transition-all duration-700 ease-fluid md:hidden ${
          open ? "glass max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col divide-y divide-ivory/10 px-6 py-2">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="eyebrow block py-4 text-ivory/70 transition-colors hover:text-ivory"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/booking"
              onClick={() => setOpen(false)}
              className="eyebrow block py-4 text-copper-light"
            >
              Check Availability →
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
