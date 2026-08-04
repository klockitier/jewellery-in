/** Formatting helpers shared across the storefront. */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹ 24,890 (whole rupees) */
export function formatINR(amount: number): string {
  return inr.format(Math.round(amount));
}

/** ₹ 97.50 — for per-gram rates and price breakdowns */
export function formatINRPrecise(amount: number): string {
  return inrPrecise.format(amount);
}

/** 3.2 g / 10.000 g */
export function formatWeight(grams: number): string {
  return `${grams % 1 === 0 ? grams.toFixed(0) : grams} g`;
}

/** "03 Aug 2026, 10:45 AM" from an ISO timestamp */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** "10:45 AM" only */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
