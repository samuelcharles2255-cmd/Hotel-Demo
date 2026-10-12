import Link from "next/link";
import Reveal from "@/components/Reveal";
import { images } from "@/lib/images";

/**
 * The shell for every authentication page — twin photo / glass panel,
 * quiet eyebrow + display title, translucent links between the shapes.
 */
export default function AuthCard({
  step,
  title,
  lead,
  children,
}: {
  step: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-stretch justify-center overflow-hidden px-4 pb-24 pt-32 sm:px-8 sm:pt-40">
      {/* atmosphere — two slowly breathing glows */}
      <span
        className="pointer-events-none absolute left-[8%] top-[12%] h-[24rem] w-[36rem] rounded-full bg-copper/[0.14] blur-[130px]"
        style={{ animation: "glow-breathe 11s ease-in-out infinite alternate" }}
      />
      <span
        className="pointer-events-none absolute right-[10%] bottom-[8%] h-[20rem] w-[28rem] rounded-full bg-ivory/[0.05] blur-[120px]"
        style={{ animation: "glow-breathe 14s ease-in-out infinite alternate-reverse" }}
      />

      <div className="relative my-auto grid w-full max-w-4xl overflow-hidden rounded-[2rem] glass lg:grid-cols-[0.9fr_1.1fr]">
        {/* -------- twin panel: the house in one frame -------- */}
        <div className="relative hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.authPanel}
            alt="Morning light in an AETHER suite"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <span className="absolute inset-0 bg-gradient-to-r from-charcoal/20 via-charcoal/45 to-charcoal/85" />
          <div className="absolute inset-x-8 bottom-8">
            <p className="display text-2xl tracking-[0.3em] text-ivory">AETHER</p>
            <p className="mt-3 text-[0.85rem] font-light leading-relaxed text-ivory/60">
              One account for stays, tables and the Thursday curatorial note.
            </p>
          </div>
        </div>

        {/* -------- form panel -------- */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14">
          <Reveal>
            <p className="eyebrow text-ivory/40">{step}</p>
            <h1 className="display mt-4 max-w-[14ch] text-[clamp(2.3rem,5.5vw,3.6rem)] text-ivory">
              {title}
            </h1>
            <p className="mt-4 max-w-sm text-[0.95rem] font-light leading-relaxed text-ivory/55">
              {lead}
            </p>
          </Reveal>

          <Reveal delay={140}>{children}</Reveal>

          <Reveal delay={260}>
            <p className="mt-9 text-center text-[0.8rem] font-light text-ivory/40">
              Back to the{" "}
              <Link href="/" className="link-line text-ivory/60">
                house
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
