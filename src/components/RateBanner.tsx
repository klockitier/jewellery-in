/**
 * Prominent LIVE GOLD & SILVER RATE banner (homepage section b).
 * Reads rates through the useRates hook — the live-provider swap happens in
 * src/config/rates.ts only.
 */

import { useRates } from "~/lib/useRates";
import { formatINRPrecise, formatTime } from "~/lib/format";
import { RefreshIcon } from "./icons";
import { Reveal } from "./Reveal";

interface RateStat {
  label: string;
  value: number;
  unit: string;
}

export function RateBanner() {
  const { rates, refreshedAt, refresh, refreshing } = useRates(60_000); // auto-refresh affordance

  const stats: RateStat[] = [
    { label: "Gold · 24K", value: rates.gold24k, unit: "/g" },
    { label: "Gold · 22K", value: rates.gold22k, unit: "/g" },
    { label: "Gold · 18K", value: rates.gold18k, unit: "/g" },
    { label: "Silver · 999", value: rates.silver, unit: "/g" },
  ];

  return (
    <section aria-labelledby="live-rates-title" className="relative overflow-hidden bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-ivory shadow-[0_30px_60px_-40px_rgb(166_130_60/0.5)]">
            {/* gold corner accents */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-8 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-sm shrink-0">
                <p className="eyebrow">
                  <span className="eyebrow-line" aria-hidden="true" />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-deep animate-soft-pulse" aria-hidden="true" />
                    Live Rates
                  </span>
                </p>
                <h2 id="live-rates-title" className="mt-3 text-4xl leading-tight text-ink sm:text-[2.6rem]">
                  Today&rsquo;s Gold &amp; Silver Rates
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Transparent, market-linked pricing. Rates are locked in your cart the moment you add a piece.
                </p>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={refreshing}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-gold-deep transition-all hover:bg-gold hover:text-white disabled:opacity-60"
                >
                  <RefreshIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="group rounded-xl border border-line bg-white/80 px-5 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_18px_35px_-24px_rgb(166_130_60/0.6)]"
                  >
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted">{s.label}</p>
                    <p className="mt-2 font-display text-[1.75rem] font-semibold leading-none text-ink transition-colors group-hover:text-gold-deep">
                      {formatINRPrecise(s.value)}
                      <span className="ml-0.5 text-base font-medium text-muted">{s.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-line bg-cream/80 px-7 py-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-muted">
              <span>
                Last updated:{" "}
                <span className="font-medium text-gold-deep">{formatTime(rates.lastUpdated)}</span>
              </span>
              <span aria-hidden="true" className="hidden text-gold sm:inline">·</span>
              <span>
                Refreshed: <span className="font-medium text-ink-soft">{formatTime(refreshedAt)}</span>
              </span>
              <span aria-hidden="true" className="hidden text-gold sm:inline">·</span>
              <span>
                {(() => {
                  // Any provider-served quote (not the stored config/override
                  // snapshot) is "live"; label the market so the owner and
                  // customers can tell India retail from international spot.
                  const s = rates.source;
                  const isLive = s !== "config" && s !== "override";
                  const market = s === "india" ? " (India market)" : s === "api" ? " (international spot)" : "";
                  return isLive
                    ? `Live${market} · updated ${formatTime(rates.lastUpdated)}`
                    : "Stored rates — live feed not connected";
                })()}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
