import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/ui";

export const metadata: Metadata = {
  title: "Your profile — AETHER",
  robots: { index: false },
};

/**
 * A quiet landing for signed-in guests — identity surfaced through the
 * session trail; stays and preferences arrive with the live booking API.
 */
export default function ProfilePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pb-24 pt-36 sm:px-8">
      <span
        className="pointer-events-none absolute left-1/2 top-[22%] h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-copper/15 blur-[130px]"
        style={{ animation: "glow-breathe 11s ease-in-out infinite alternate" }}
      />
      <div className="relative w-full max-w-xl text-center">
        <p className="eyebrow text-ivory/40">Personal</p>
        <h1 className="display glow-title mt-4 text-[clamp(2.4rem,6vw,4rem)] text-ivory">
          Your room in the house
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[1rem] font-light leading-relaxed text-ivory/55">
          Your details live in the trail above. Stays, tables and preferences
          gather here as the house wakes up.
        </p>
        <div className="mt-9 flex justify-center">
          <Link href="/booking" className="btn btn-copper btn-sheen">
            Plan your next stay
            <ArrowRight />
          </Link>
        </div>
      </div>
    </main>
  );
}
