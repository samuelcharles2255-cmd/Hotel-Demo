import Link from "next/link";

/** Section heading used across pages — eyebrow + serif title. */
export function SectionHead({
  index,
  eyebrow,
  title,
  align = "left",
  className = "",
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-5 ${
        align === "center" ? "items-center text-center" : "items-start"
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        {index && <span className="num text-copper text-[0.7rem]">{index}</span>}
        <span className="h-px w-8 bg-copper/50" />
        <span className="eyebrow text-ivory/45">{eyebrow}</span>
      </div>
      <h2 className="display glow-title text-[clamp(2.4rem,5vw,4rem)] text-ivory">
        {title}
      </h2>
    </div>
  );
}

/** Horizontal image frame with refractive glass edge. */
export function GlassFrame({
  src,
  alt,
  className = "",
  imgClassName = "",
  ratio = "aspect-[4/3]",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  priority?: boolean;
}) {
  return (
    <figure
      className={`glass group relative overflow-hidden rounded-[1.5rem] ${ratio} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={`absolute inset-0 h-full w-full scale-[1.03] object-cover transition-transform duration-[1400ms] ease-fluid group-hover:scale-[1.09] ${imgClassName}`}
      />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
    </figure>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`h-4 w-4 ${className}`}
    >
      <path
        d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small inline arrow link used in editorial copy. */
export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="eyebrow group inline-flex items-center gap-3 text-copper-light transition-colors duration-500 hover:text-ivory"
    >
      {children}
      <ArrowRight className="transition-transform duration-700 ease-fluid group-hover:translate-x-1.5" />
    </Link>
  );
}
