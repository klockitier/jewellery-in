/**
 * Cart & price-lock configuration — the single place the storefront reads for
 * lock validity, shipping and coupon display rules.
 *
 * THE BUSINESS RULE: when a customer adds an item, the metal rate at that
 * moment is captured ("locked") with the cart item. For the lock validity
 * window the customer pays the price computed from that locked rate — fair to
 * the customer (no surprise price rise) and fair to the business (the lock
 * expires and reprices at the latest rate).
 */

import { siteConfig } from "./site";

/* ------------------------------------------------------------------ */
/* Price-lock validity                                                 */
/* ------------------------------------------------------------------ */

export interface LockOption {
  /** Human label shown in any lock-picker UI. */
  label: string;
  /** Validity in milliseconds. */
  ms: number;
}

/** The validity windows a customer can be offered. */
export const LOCK_OPTIONS: LockOption[] = [
  { label: "30 minutes", ms: 30 * 60 * 1000 },
  { label: "1 hour", ms: 60 * 60 * 1000 },
  { label: "24 hours", ms: 24 * 60 * 60 * 1000 },
];

/**
 * Validity applied when an item is added (and when an expired lock is
 * re-priced — it re-locks with a fresh window so the customer isn't stuck in
 * an update loop).
 * TODO(owner): confirm the default — 30 min / 1 hr / 24 hr.
 */
export const DEFAULT_LOCK_MS = 60 * 60 * 1000; // 1 hour

/* ------------------------------------------------------------------ */
/* Shipping                                                            */
/* ------------------------------------------------------------------ */

export interface ShippingConfig {
  /** Shipping is free on subtotals at or above this amount (₹). */
  freeAbove: number;
  /** Flat fee (₹) on subtotals below the free threshold. */
  flatFee: number;
  /** Set true to ship free on every order regardless of amount. */
  freeAlways: boolean;
  insured: boolean;
  /** Human copy, e.g. "Free insured shipping". */
  freeLabel: string;
}

export const SHIPPING: ShippingConfig = {
  // Mirrors siteConfig.shipping.freeShippingThreshold so the product page and
  // the cart never disagree.
  freeAbove: siteConfig.shipping.freeShippingThreshold, // ₹10,000
  flatFee: 149, // TODO(owner): confirm the flat fee for orders below ₹10,000
  freeAlways: false, // TODO(owner): set true if every order ships free
  insured: siteConfig.shipping.insured,
  freeLabel: "Free insured shipping",
};

export interface ShippingResult {
  fee: number;
  free: boolean;
  label: string;
}

/** Shipping cost for a given order subtotal (₹). */
export function shippingFor(subtotal: number): ShippingResult {
  if (SHIPPING.freeAlways || subtotal >= SHIPPING.freeAbove) {
    return { fee: 0, free: true, label: SHIPPING.freeLabel };
  }
  return {
    fee: SHIPPING.flatFee,
    free: false,
    label: `Flat ${SHIPPING.flatFee} shipping`,
  };
}

/* ------------------------------------------------------------------ */
/* Coupons & offers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Coupon display config for the cart page. Real coupon validation arrives
 * with the checkout task; the cart only shows the eligible offer discounts
 * that already live on products (offerPercent).
 */
export const COUPONS = {
  /** When false the cart shows "coupons at checkout" copy instead of an input. */
  enabled: false,
  note: "Coupon codes arrive with checkout",
};
