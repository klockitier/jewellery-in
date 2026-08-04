/** Checkout coupon catalogue. Owner should replace sample campaigns before launch. */
export type CouponType = "percent" | "flat";
export interface Coupon { code: string; type: CouponType; value: number; minCartValue: number; maxDiscount?: number; validUntil?: string; active: boolean; once?: boolean; }
export const COUPONS: Coupon[] = [
  { code: "WELCOME10", type: "percent", value: 10, minCartValue: 10000, maxDiscount: 500, active: true }, // TODO(owner): confirm
  { code: "FESTIVE1500", type: "flat", value: 1500, minCartValue: 50000, active: true }, // TODO(owner): confirm
];
export function validateCoupon(input: string, cartValue: number): { coupon?: Coupon; error?: string } {
  const coupon = COUPONS.find(c => c.code === input.trim().toUpperCase());
  if (!coupon || !coupon.active) return { error: "That coupon code is not valid." };
  if (coupon.validUntil && new Date(coupon.validUntil).getTime() < Date.now()) return { error: "This coupon has expired." };
  if (cartValue < coupon.minCartValue) return { error: `Add ${new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:0}).format(coupon.minCartValue - cartValue)} more to use this code.` };
  return { coupon };
}
export function couponDiscount(coupon: Coupon | undefined, value: number) {
  if (!coupon) return 0;
  return Math.min(value, coupon.type === "percent" ? Math.min(value * coupon.value / 100, coupon.maxDiscount ?? Infinity) : coupon.value);
}
