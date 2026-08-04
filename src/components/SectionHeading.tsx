/**
 * Reusable section heading: eyebrow label, serif title, optional sub copy and
 * an ornamental gold line — the signature look across the homepage.
 */

import { Ornament } from "./JewelIcon";

interface Props {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
  light?: boolean;
}

export function SectionHeading({ eyebrow, title, sub, align = "center", light = false }: Props) {
  const centered = align === "center";
  return (
    <div className={`max-w-2xl ${centered ? "mx-auto text-center" : "text-left"}`}>
      <p className={`eyebrow ${centered ? "justify-center" : ""}`}>
        <span className="eyebrow-line" aria-hidden="true" />
        {eyebrow}
        <span className="eyebrow-line" aria-hidden="true" />
      </p>
      <h2
        className={`mt-4 text-4xl leading-[1.08] sm:text-5xl ${light ? "text-ivory" : "text-ink"} ${centered ? "text-balance" : ""}`}
      >
        {title}
      </h2>
      <Ornament className={`mx-auto mt-5 h-3 w-28 ${light ? "text-gold" : "text-gold-deep"} ${centered ? "" : "ml-0"}`} />
      {sub ? (
        <p className={`mt-5 text-[1.02rem] leading-relaxed ${light ? "text-ivory/70" : "text-muted"}`}>{sub}</p>
      ) : null}
    </div>
  );
}
