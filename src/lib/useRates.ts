/**
 * Client hook around the rates module.
 *
 * The UI only ever talks to this hook (or fetchRates) — never to the config
 * directly — so swapping in a live provider later touches exactly one file
 * (src/config/rates.ts) and nothing in the UI changes.
 *
 * `getLatestRates()` is the synchronous "freshest rate we know right now"
 * accessor: every successful refresh (any component's) updates the module-level
 * cache, so add-to-cart click handlers can snapshot the current rate without
 * each card running its own poller.
 */

import { useEffect, useRef, useState } from "react";
import { fetchRates, getRates, type RateQuote } from "~/config/rates";

/** The server adds this payload to the HTML so hydration starts with the same live quote. */
function readSSRQuote(): RateQuote | null {
  if (typeof document === "undefined") return null;
  try {
    const node = document.getElementById("smj-rates");
    if (!node?.textContent) return null;
    const value = JSON.parse(node.textContent) as RateQuote;
    if ([value.gold24k, value.gold22k, value.gold18k, value.silver].every((n) => typeof n === "number" && Number.isFinite(n))) return value;
  } catch { /* fall through to config */ }
  return null;
}

/** Module-level cache of the most recently fetched quote (SSR payload at boot). */
let latestRates: RateQuote = readSSRQuote() ?? getRates();

/** Synchronous accessor for the freshest known quote — safe in click handlers. */
export function getLatestRates(): RateQuote {
  return latestRates;
}

export interface UseRatesResult {
  rates: RateQuote;
  /** ISO timestamp of the last successful refresh (client-side). */
  refreshedAt: string;
  refresh: () => Promise<void>;
  refreshing: boolean;
}

export function useRates(intervalMs?: number): UseRatesResult {
  const [rates, setRates] = useState<RateQuote>(() => latestRates);
  const [refreshedAt, setRefreshedAt] = useState<string>(() => latestRates.lastUpdated);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const next = await fetchRates();
      latestRates = next;
      setRates(next);
      setRefreshedAt(new Date().toISOString());
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Auto-refresh: refresh immediately on mount so a live provider's rates
    // appear without waiting a full interval, then keep the cadence from there.
    // (SSR still renders the config snapshot — this update happens client-side
    // after hydration, so server and client markup always match.)
    if (!intervalMs) return;
    void refresh();
    intervalRef.current = setInterval(() => {
      void refresh();
    }, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return { rates, refreshedAt, refresh, refreshing };
}
