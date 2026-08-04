import type { Order } from "./orders";
export const PAYMENT_GATEWAY = { name: "Cashfree", type: "cashfree", paymentLink: "" } as const;
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";
type PayResult = { status: "pending" | "confirmed"; paymentUrl?: string; error?: string };
let sdkPromise: Promise<any> | null = null;
export async function isPaymentConfigured(): Promise<boolean> {
  try { const r = await fetch("/api/payments/cashfree/config"); const d = await r.json(); return !!d.configured; } catch { return false; }
}
const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";
const SDK_TIMEOUT_MS = 12000;
function withTimeout<T>(promise: Promise<T>, label: string, timeout = SDK_TIMEOUT_MS): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), timeout))]);
}
async function loadSdk() {
  if (sdkPromise) return withTimeout(sdkPromise, "Cashfree SDK load");
  sdkPromise = new Promise((resolve, reject) => {
    const finish = () => {
      const sdk = (window as any).Cashfree;
      if (typeof sdk !== "function") reject(new Error("Cashfree SDK loaded without window.Cashfree"));
      else resolve(sdk);
    };
    const existing = document.querySelector(`script[src="${SDK_URL}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (typeof (window as any).Cashfree === "function") finish();
      else { existing.addEventListener("load", finish, { once: true }); existing.addEventListener("error", () => reject(new Error("Cashfree SDK script failed")), { once: true }); }
      return;
    }
    const s = document.createElement("script"); s.src = SDK_URL; s.async = true;
    s.onload = finish; s.onerror = () => reject(new Error("Cashfree SDK script failed")); document.head.appendChild(s);
  });
  return withTimeout(sdkPromise, "Cashfree SDK load");
}
export async function payOrder(order: Order, method: PaymentMethod): Promise<PayResult> {
  try {
    const created = await withTimeout(fetch("/api/payments/cashfree/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ order, method }) }), "Cashfree order creation");
    if (!created.ok) throw new Error(`Cashfree order creation failed (${created.status})`);
    const data = await created.json();
    if (!data.configured || !data.paymentSessionId) return { status: "pending", error: "Cashfree payment is not configured; your order has been saved as pending payment." };

    // Cashfree's SDK ultimately submits this same hosted page. Use a native
    // POST navigation: it is reliable in browsers/webviews and avoids a modal
    // that may never open when third-party scripts are restricted.
    const checkoutUrl = data.mode === "production"
      ? "https://api.cashfree.com/pg/view/sessions/checkout"
      : "https://sandbox.cashfree.com/pg/view/sessions/checkout";
    const form = document.createElement("form");
    form.method = "POST";
    form.action = checkoutUrl;
    form.style.display = "none";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payment_session_id";
    input.value = data.paymentSessionId;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    return { status: "pending", paymentUrl: checkoutUrl };
  } catch (error) {
    console.error("Cashfree checkout could not be opened", error);
    return { status: "pending", error: "Secure checkout could not be opened — your order has been saved as pending payment; we will contact you to complete it." };
  }
}
