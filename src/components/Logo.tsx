/**
 * Brand mark: a diamond/kalash monogram in a thin gold ring + wordmark.
 * Used in the header and footer.
 */

import { siteConfig } from "~/config/site";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
        <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeWidth="1" />
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
        {/* diamond */}
        <path
          d="M24 9.5 30 17l-6 21-6-21Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M24 9.5 18 17h12Z" fill="currentColor" opacity="0.35" />
        <path d="M24 38 18 17l3-4 3 25Z" fill="currentColor" opacity="0.2" />
      </svg>
    </span>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <a href="/" className="group inline-flex items-center gap-3" aria-label={`${siteConfig.name} — home`}>
      <LogoMark className={`h-11 w-11 transition-transform duration-500 group-hover:rotate-6 ${dark ? "text-gold-bright" : "text-gold-deep"}`} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[1.35rem] font-semibold tracking-wide ${dark ? "text-ivory" : "text-ink"}`}
        >
          Shri Madhav
        </span>
        <span
          className={`mt-1 text-[0.6rem] font-medium uppercase tracking-[0.42em] ${dark ? "text-gold-bright" : "text-gold-deep"}`}
        >
          Jewellers
        </span>
      </span>
    </a>
  );
}
