/** Gold and silver rates, always INR per gram. */
export interface RateQuote {
  gold24k: number; gold22k: number; gold18k: number; silver: number;
  lastUpdated: string; source: "config" | "api" | string; currency: "INR"; unit: "per-gram";
}

export const CONFIG_RATES: RateQuote = {
  gold24k: 7690, gold22k: 7050, gold18k: 5770, silver: 97.5,
  lastUpdated: "2026-08-03T10:45:00+05:30", source: "config", currency: "INR", unit: "per-gram",
};

/** Browser entry point: server owns provider credentials; config is the honest fallback. */
export async function fetchRates(): Promise<RateQuote> {
  if (typeof window === "undefined") return CONFIG_RATES;
  try {
    const response = await fetch("/api/rates", { headers: { accept: "application/json" } });
    const data = await response.json() as { ok?: boolean; quote?: RateQuote };
    if (response.ok && data.ok && data.quote && [data.quote.gold24k, data.quote.gold22k, data.quote.gold18k, data.quote.silver].every((n) => typeof n === "number" && Number.isFinite(n))) return data.quote;
  } catch { /* fall through to stored rates */ }
  return getRateOverride() ?? CONFIG_RATES;
}

const OVERRIDE_KEY = "smj.rates.override.v1";
export function getRateOverride(): RateQuote | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(OVERRIDE_KEY); if (!raw) return null;
    const o = JSON.parse(raw) as Partial<RateQuote>;
    if ([o.gold24k, o.gold22k, o.gold18k, o.silver].some((n) => typeof n !== "number")) return null;
    return { ...CONFIG_RATES, ...o, lastUpdated: new Date().toISOString(), source: "override" };
  } catch { return null; }
}
export function getRates(): RateQuote { return CONFIG_RATES; }
