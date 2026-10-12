"use client";

/**
 * Light / dark switch for the AETHER material.
 * State is derived from `data-theme` on <html> (set pre-paint by the boot
 * script in layout.tsx) through useSyncExternalStore — no effect, no
 * hydration mismatch, updates are synchronous via a local event.
 */

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "aether-theme";
const CHANGE_EVENT = "aether-theme-change";

type Theme = "dark" | "light";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

/* Before hydration the boot script guarantees dark — the palette default. */
const getServerSnapshot = (): Theme => "dark";

function toggleTheme() {
  const next: Theme =
    document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode — the boot script falls back to the system */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const light = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={light}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 bg-ivory/5 transition-all duration-500 hover:border-copper/45 hover:bg-ivory/10"
    >
      {/* dawn — shown in the dark */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={`absolute h-4 w-4 transition-all duration-700 ease-fluid ${
          light ? "-rotate-90 opacity-0" : "rotate-0 opacity-90"
        }`}
      >
        <path
          d="M4 17h16M7.5 17a4.5 4.5 0 0 1 9 0M12 3.5V7m-5.2 1.4 2.4 2.4m8-2.4-2.4 2.4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* sun — shown in the light */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={`absolute h-4 w-4 transition-all duration-700 ease-fluid ${
          light ? "rotate-0 opacity-90" : "rotate-90 opacity-0"
        }`}
      >
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.4" />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={12 + Math.cos(a) * 7.2}
              y1={12 + Math.sin(a) * 7.2}
              x2={12 + Math.cos(a) * 9.6}
              y2={12 + Math.sin(a) * 9.6}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </button>
  );
}
