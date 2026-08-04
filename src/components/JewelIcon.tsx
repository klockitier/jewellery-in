/**
 * Elegant gold line-art illustrations for product categories.
 *
 * These are DESIGN PLACEHOLDERS: real photography replaces them in the
 * catalogue task (set `image` on a Product / Category). They render as
 * `currentColor` strokes so they work on light or dark surfaces.
 */

import type { ReactNode } from "react";
import type { CategoryIconKey } from "~/config/categories";

interface Props {
  kind: CategoryIconKey;
  className?: string;
}

function Svg({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const paths: Record<CategoryIconKey, ReactNode> = {
  rings: (
    <>
      <circle cx="32" cy="38" r="13" />
      <path d="M32 25c-1.5-4.5 1-10 6-11.5 3-1 6 .5 7 3 .9 2.5-.5 5.5-3 7" />
      <path d="M32 25v-7" />
      <circle cx="32" cy="14.5" r="3" />
    </>
  ),
  chains: (
    <>
      <ellipse cx="24" cy="32" rx="9" ry="12.5" />
      <ellipse cx="40" cy="32" rx="9" ry="12.5" />
      <ellipse cx="32" cy="44" rx="9" ry="12.5" />
    </>
  ),
  necklaces: (
    <>
      <path d="M10 16c5 9 12 13 22 13s17-4 22-13" />
      <path d="M32 29v7" />
      <path d="M32 36c-6 0-9 3.5-9 8 0 4.8 4 7.5 9 7.5s9-2.7 9-7.5c0-4.5-3-8-9-8Z" />
    </>
  ),
  mangalsutra: (
    <>
      <path d="M10 14c5 10 12 14 22 14s17-4 22-14" />
      <circle cx="18" cy="19" r="2.2" />
      <circle cx="46" cy="19" r="2.2" />
      <path d="M32 28v8" />
      <path d="M32 36c-4.5 0-7 2.6-7 6s2.5 6 7 6 7-2.6 7-6-2.5-6-7-6Z" />
      <path d="M32 48v5" />
      <circle cx="32" cy="55" r="1.8" />
    </>
  ),
  earrings: (
    <>
      <circle cx="22" cy="30" r="4.5" />
      <path d="M22 25.5v-6M22 19.5l3-3" />
      <circle cx="42" cy="30" r="4.5" />
      <path d="M42 25.5v-6M42 19.5l-3-3" />
    </>
  ),
  jhumki: (
    <>
      <path d="M20 14v4" />
      <path d="M20 18c-4 1.6-6 5-6 9 0 5 2.7 7.5 6 7.5s6-2.5 6-7.5c0-4-2-7.4-6-9Z" />
      <path d="M44 14v4" />
      <path d="M44 18c-4 1.6-6 5-6 9 0 5 2.7 7.5 6 7.5s6-2.5 6-7.5c0-4-2-7.4-6-9Z" />
      <path d="M18 36v3M22 36v3M42 36v3M46 36v3" />
      <circle cx="18" cy="42" r="1.6" />
      <circle cx="22" cy="42" r="1.6" />
      <circle cx="42" cy="42" r="1.6" />
      <circle cx="46" cy="42" r="1.6" />
    </>
  ),
  bali: (
    <>
      <circle cx="22" cy="32" r="10" />
      <path d="M22 22v-5" />
      <circle cx="42" cy="32" r="10" />
      <path d="M42 22v-5" />
    </>
  ),
  bangles: (
    <>
      <ellipse cx="32" cy="27" rx="15" ry="9.5" />
      <ellipse cx="32" cy="42" rx="15" ry="9.5" />
      <path d="M17 27c0 8 6.7 9.5 15 9.5s15-1.5 15-9.5" opacity=".45" />
    </>
  ),
  bracelets: (
    <>
      <ellipse cx="32" cy="33" rx="15.5" ry="11" />
      <path d="M47.5 33v6" />
      <path d="M17 38v2.5" />
      <path d="M19.5 40.5h25l2 3h-29Z" opacity=".6" />
    </>
  ),
  kada: (
    <>
      <ellipse cx="32" cy="33" rx="16.5" ry="12.5" strokeWidth="4" opacity=".9" />
      <circle cx="32" cy="22.5" r="1.8" />
      <circle cx="24" cy="26" r="1.8" />
      <circle cx="40" cy="26" r="1.8" />
      <circle cx="32" cy="45" r="1.8" />
    </>
  ),
  payal: (
    <>
      <path d="M12 20c5 8 12 12 20 12s15-4 20-12" />
      <path d="M32 32v6" />
      <path d="M32 38c-4 0-6 2-6 4.5s2.5 4.5 6 4.5 6-2 6-4.5-2-4.5-6-4.5Z" />
      <circle cx="19" cy="33.5" r="1.7" />
      <circle cx="45" cy="33.5" r="1.7" />
      <circle cx="26" cy="35" r="1.7" />
      <circle cx="38" cy="35" r="1.7" />
    </>
  ),
  pendants: (
    <>
      <path d="M32 8v6" />
      <path d="M32 14c-6.5 0-10 4.5-10 10.5 0 6 4.5 9.5 10 9.5s10-3.5 10-9.5C42 18.5 38.5 14 32 14Z" />
      <path d="M27 30c1.5 2.6 3 3.9 5 3.9s3.5-1.3 5-3.9" />
    </>
  ),
  "nose-pins": (
    <>
      <circle cx="32" cy="30" r="6" />
      <path d="M32 24v-9c0-1.5 1-2.5 2.5-2.5S37 13.5 37 15" />
      <circle cx="35" cy="13" r="2.2" />
      <path d="M26 30h-4M38 30h4" opacity=".55" />
    </>
  ),
  silver: (
    <>
      <circle cx="32" cy="32" r="15" />
      <path d="M32 19.5c1.2 3.5 3 5.3 6.5 6.5-3.5 1.2-5.3 3-6.5 6.5-1.2-3.5-3-5.3-6.5-6.5 3.5-1.2 5.3-3 6.5-6.5Z" />
      <path d="M46 42c1.4 1.4 1.6 3.5 0 5-1.6 1.6-3.6 1.4-5 0" opacity=".6" />
    </>
  ),
  coins: (
    <>
      <circle cx="27" cy="34" r="13" />
      <circle cx="27" cy="34" r="9" opacity=".55" />
      <path d="M27 26v16M22.5 29h9" />
      <circle cx="44.5" cy="22.5" r="5.5" opacity=".55" />
      <circle cx="44.5" cy="22.5" r="3" opacity=".35" />
    </>
  ),
};

export function JewelIcon({ kind, className }: Props) {
  return <Svg className={className}>{paths[kind]}</Svg>;
}

/** Decorative double-line ornament used behind section headings. */
export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" fill="none" stroke="currentColor" className={className} aria-hidden="true">
      <path d="M4 6h44" strokeWidth="1" />
      <path d="M72 6h44" strokeWidth="1" />
      <path d="M60 1.5 63 6l-3 4.5L57 6Z" strokeWidth="1.2" />
    </svg>
  );
}
