/**
 * Centralized pricing — the single source of truth for how product prices are
 * computed. The price-locking cart task MUST reuse these helpers so every price
 * on the site stays consistent:
 *
 *   price = metalRate × weight + makingCharge + GST
 *
 * GST applies on (metal value + making charge).
 */

import type { RateQuote } from "./rates";

/** GST on gold/silver jewellery in India (3% of value + making). */
export const GST_RATE = 0.03;

export type Metal = "gold" | "silver";
export type Purity = "24k" | "22k" | "18k" | "925";

export interface PriceBreakdown {
  /** rate × weight */
  metalValue: number;
  /** flat making charge in ₹ */
  makingCharge: number;
  /** GST amount in ₹ */
  gst: number;
  /** metalValue + makingCharge + gst */
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface ComputePriceInput {
  /** Rate per gram in ₹ for the product's purity */
  ratePerGram: number;
  weightGrams: number;
  /** Flat making charge in ₹ */
  makingCharge: number;
  gstRate?: number;
}

export function computePrice({
  ratePerGram,
  weightGrams,
  makingCharge,
  gstRate = GST_RATE,
}: ComputePriceInput): PriceBreakdown {
  const metalValue = round2(ratePerGram * weightGrams);
  const gst = round2((metalValue + makingCharge) * gstRate);
  const total = round2(metalValue + makingCharge + gst);
  return { metalValue, makingCharge, gst, total };
}

/**
 * Pick the matching rate from a RateQuote for a product's metal + purity.
 * Centralised here so cart/price-locking and product pages never diverge.
 */
export function rateFor(metal: Metal, purity: Purity, rates: RateQuote): number {
  if (metal === "silver") return rates.silver;
  switch (purity) {
    case "24k":
      return rates.gold24k;
    case "22k":
      return rates.gold22k;
    case "18k":
      return rates.gold18k;
    default:
      return rates.gold22k;
  }
}
