/**
 * Client-side cart store with PRICE LOCKING.
 *
 * THE BUSINESS RULE: every cart item snapshots the metal rate at the moment it
 * is added. While the lock is valid, the customer pays the price computed from
 * that locked rate; when the lock expires the item is automatically re-priced
 * at the latest rate (re-locking with a fresh validity) and the UI tells the
 * customer prices changed. This is the fair-pricing guarantee to both sides.
 *
 * - Persisted to localStorage under `smj.cart.v2`; v1 carts (`smj.cart.v1`,
 *   plain { productId: qty }) are migrated on load by backfilling the current
 *   rate and lockedAt = now.
 * - SSR-safe: the server always renders an empty cart.
 * - Shared across tabs via the `storage` event.
 *
 * The checkout task builds directly on this module: read `snapshot()` for the
 * locked items, use `isLocked` / `msRemaining` for the price-lock confirmation
 * step, and `refreshExpired`-style logic to re-quote before payment.
 */

import { useSyncExternalStore } from "react";
import { DEFAULT_LOCK_MS } from "~/config/cart";
import { rateFor } from "~/config/pricing";
import { getProduct } from "~/lib/catalogue";
import { getRates, type RateQuote } from "~/config/rates";

const KEY_V2 = "smj.cart.v2";
const KEY_V1 = "smj.cart.v1"; // legacy — migrated to v2 on load

export interface CartItem {
  productId: string;
  qty: number;
  /** ISO-8601 timestamp when the rate was captured. */
  lockedAt: string;
  /** Validity of this lock in milliseconds. */
  lockMs: number;
  /** Full rate quote captured at add time (metal rates may move after). */
  rate: RateQuote;
  /** Convenience: the ₹/g rate for THIS item's metal+purity, at lock time. */
  lockedRate: number;
}

/* ------------------------------------------------------------------ */
/* Pure helpers (exported — the cart page and checkout task use them)  */
/* ------------------------------------------------------------------ */

/** When the item's lock expires (Date). */
export function lockExpiresAt(item: CartItem): Date {
  return new Date(new Date(item.lockedAt).getTime() + item.lockMs);
}

/** Milliseconds left on the lock (0 when expired). */
export function msRemaining(item: CartItem, now: number | Date = Date.now()): number {
  const t = typeof now === "number" ? now : now.getTime();
  return Math.max(0, lockExpiresAt(item).getTime() - t);
}

/** True while the item's locked rate is still valid. */
export function isLocked(item: CartItem, now?: number | Date): boolean {
  return msRemaining(item, now) > 0;
}

/** Human countdown, e.g. "1h 23m", "34m 12s", "12s". */
export function formatLockRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Build a fresh lock on an item at the given rates (pure). */
export function refreshLock(
  item: CartItem,
  rates: RateQuote,
  lockMs: number = DEFAULT_LOCK_MS,
  now: Date = new Date(),
): CartItem {
  const product = getProduct(item.productId);
  return {
    ...item,
    lockedAt: now.toISOString(),
    lockMs,
    rate: { ...rates },
    lockedRate: product ? rateFor(product.metal, product.purity, rates) : item.lockedRate,
  };
}

/* ------------------------------------------------------------------ */
/* Storage + migration                                                 */
/* ------------------------------------------------------------------ */

function makeItem(productId: string, qty: number, rates: RateQuote, lockMs: number, now: Date): CartItem {
  const product = getProduct(productId);
  return {
    productId,
    qty,
    lockedAt: now.toISOString(),
    lockMs,
    rate: { ...rates },
    lockedRate: product ? rateFor(product.metal, product.purity, rates) : 0,
  };
}

/** Validate + coerce a parsed v2 payload so corrupt storage can't break the store. */
function normalize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const it = r as Partial<CartItem>;
    const qty = Math.floor(Number(it.qty));
    if (!it.productId || typeof it.productId !== "string" || !Number.isFinite(qty) || qty <= 0) continue;
    const rate = (it.rate ?? getRates()) as RateQuote;
    out.push({
      productId: it.productId,
      qty,
      lockedAt: typeof it.lockedAt === "string" ? it.lockedAt : new Date().toISOString(),
      lockMs: typeof it.lockMs === "number" && it.lockMs > 0 ? it.lockMs : DEFAULT_LOCK_MS,
      rate,
      lockedRate:
        typeof it.lockedRate === "number" && it.lockedRate > 0
          ? it.lockedRate
          : (() => {
              const p = getProduct(it.productId!);
              return p ? rateFor(p.metal, p.purity, rate) : 0;
            })(),
    });
  }
  return out;
}

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const rawV2 = window.localStorage.getItem(KEY_V2);
    if (rawV2) return normalize(JSON.parse(rawV2));
    // Migrate v1 { productId: qty } → v2 with a lock taken right now.
    const rawV1 = window.localStorage.getItem(KEY_V1);
    if (rawV1) {
      const v1 = JSON.parse(rawV1) as Record<string, number>;
      const now = new Date();
      const rates = getRates();
      const migrated = Object.entries(v1).map(([id, qty]) => makeItem(id, qty, rates, DEFAULT_LOCK_MS, now));
      try {
        window.localStorage.setItem(KEY_V2, JSON.stringify(migrated));
        window.localStorage.removeItem(KEY_V1);
      } catch {
        /* storage full — cart still works in memory */
      }
      return migrated;
    }
  } catch {
    /* corrupt storage — start fresh */
  }
  return [];
}

let items: CartItem[] = readStorage();
const listeners = new Set<() => void>();

const SERVER_ITEMS: CartItem[] = [];

function emit() {
  for (const l of listeners) l();
}

function commit(next: CartItem[]) {
  items = next;
  persist();
  emit();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY_V2, JSON.stringify(items));
  } catch {
    /* storage full / private mode — cart still works in memory */
  }
}

if (typeof window !== "undefined") {
  // Keep cart in sync across open tabs.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY_V2) {
      items = readStorage();
      emit();
    } else if (e.key === KEY_V1) {
      // Another tab migrated v1 already — re-read.
      items = readStorage();
      emit();
    }
  });
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const cartStore = {
  /**
   * Add (or add more of) a product, locking the CURRENT rates against it.
   * When the product is already in the cart, the quantity grows and the
   * ORIGINAL lock is kept — the whole line stays at the price the customer
   * first saw. Pass the rates from useRates / fetchRates at click time.
   */
  add(productId: string, qty = 1, rates?: RateQuote, lockMs: number = DEFAULT_LOCK_MS) {
    const quote: RateQuote = rates ?? getRates();
    const existing = items.find((i) => i.productId === productId);
    let next: CartItem[];
    if (existing) {
      next = items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i));
    } else {
      next = [...items, makeItem(productId, qty, quote, lockMs, new Date())];
    }
    commit(next);
  },

  remove(productId: string) {
    if (!items.some((i) => i.productId === productId)) return;
    commit(items.filter((i) => i.productId !== productId));
  },

  /** Change quantity; the price recomputes at the item's LOCKED rate. */
  setQty(productId: string, qty: number) {
    const n = Math.floor(qty);
    if (n <= 0) return this.remove(productId);
    commit(items.map((i) => (i.productId === productId ? { ...i, qty: Math.min(n, 10) } : i)));
  },

  clear() {
    commit([]);
  },

  /** Total number of pieces (sum of quantities). */
  count(): number {
    return items.reduce((a, b) => a + b.qty, 0);
  },

  /** Stable snapshot of the cart (same reference between mutations). */
  snapshot(): CartItem[] {
    return items;
  },

  /** Server render returns an empty cart. */
  serverSnapshot(): CartItem[] {
    return SERVER_ITEMS;
  },

  /** Re-lock an item at the current rates and commit (used on expiry). */
  refreshLock(item: CartItem, rates?: RateQuote, lockMs: number = DEFAULT_LOCK_MS): CartItem {
    const fresh = refreshLock(item, rates ?? getRates(), lockMs, new Date());
    commit(items.map((i) => (i.productId === item.productId ? fresh : i)));
    return fresh;
  },

  /**
   * Re-price every EXPIRED item against the given rates (each re-locks with a
   * fresh validity window). Returns the items that were re-priced so the UI
   * can tell the customer prices changed. No-op when nothing has expired.
   */
  repriceExpired(rates?: RateQuote, lockMs: number = DEFAULT_LOCK_MS): { repriced: CartItem[] } {
    const now = new Date();
    const quote = rates ?? getRates();
    const repriced: CartItem[] = [];
    let changed = false;
    const next = items.map((i) => {
      if (isLocked(i, now)) return i;
      changed = true;
      const fresh = refreshLock(i, quote, lockMs, now);
      repriced.push(fresh);
      return fresh;
    });
    if (changed) commit(next);
    return { repriced };
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** React hook — re-renders when the cart changes. SSR-safe (empty cart). */
export function useCartCount(): number {
  return useSyncExternalStore(cartStore.subscribe, cartStore.count, cartStore.count);
}

/** React hook — the current cart items. SSR-safe (empty cart). */
export function useCartItems(): CartItem[] {
  return useSyncExternalStore(cartStore.subscribe, cartStore.snapshot, cartStore.serverSnapshot);
}
