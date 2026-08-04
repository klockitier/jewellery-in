/**
 * /cart — the price-locking cart (task 4).
 *
 * THE BUSINESS RULE: every item snapshots the metal rate at add time. While
 * the lock is valid the customer pays the price computed from the LOCKED rate;
 * when it expires the item is automatically re-priced at the latest rate
 * (re-locking with a fresh validity) and the customer is clearly told prices
 * changed. All math runs through src/config/pricing.ts computePrice at the
 * item's lockedRate, so this page and the product pages never diverge.
 *
 * SSR-safe: the server renders an empty cart; items hydrate client-side from
 * localStorage (smj.cart.v2). Countdown text is gated on a mounted flag so
 * server markup never contains time-dependent content.
 */

import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { COUPONS, DEFAULT_LOCK_MS, SHIPPING, shippingFor } from "~/config/cart";
import { getCategory } from "~/config/categories";
import { computePrice } from "~/config/pricing";
import { getProduct, type Product } from "~/config/products";
import {
  cartStore,
  formatLockRemaining,
  isLocked,
  msRemaining,
  useCartItems,
  type CartItem,
} from "~/lib/cart";
import { formatINR, formatINRPrecise, formatWeight } from "~/lib/format";
import { pageHead } from "~/lib/seo";
import { getLatestRates, useRates } from "~/lib/useRates";
import { BagIcon, ClockIcon, CloseIcon, LockIcon, TrashIcon } from "~/components/icons";
import { JewelIcon } from "~/components/JewelIcon";

export const Route = createFileRoute("/cart")({
  head: () =>
    pageHead({
      title: "Your Cart — Shri Madhav Jewellers",
      description:
        "Your Shri Madhav Jewellers cart — gold & silver rates are locked when you add a piece, so the price you see is the price you pay within the lock window.",
      path: "/cart",
    }),
  component: CartPage,
});

/* ------------------------------------------------------------------ */
/* Per-item math (locked rate)                                         */
/* ------------------------------------------------------------------ */

interface LineMath {
  metalValue: number;
  makingCharge: number;
  gst: number;
  /** total × qty before offer discount */
  list: number;
  /** offer discount for the line (₹) */
  offer: number;
  /** final line price the customer pays */
  line: number;
}

function lineMath(item: CartItem, product: Product): LineMath {
  const b = computePrice({
    ratePerGram: item.lockedRate,
    weightGrams: product.weightGrams,
    makingCharge: product.makingCharge,
  });
  const list = b.total * item.qty;
  const pct = product.offerPercent ?? 0;
  const offer = (list * pct) / 100;
  return { metalValue: b.metalValue * item.qty, makingCharge: b.makingCharge * item.qty, gst: b.gst * item.qty, list, offer, line: list - offer };
}

function productName(id: string): string {
  return getProduct(id)?.name ?? id;
}

/* ------------------------------------------------------------------ */
/* Lock status chip (countdown)                                        */
/* ------------------------------------------------------------------ */

function LockStatus({ item, now, mounted }: { item: CartItem; now: number; mounted: boolean }) {
  const remaining = msRemaining(item, now);
  if (!isLocked(item, now)) {
    return (
      <p className="mt-3 inline-flex flex-wrap items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-xs font-medium text-brown">
        <ClockIcon className="h-3.5 w-3.5 shrink-0" />
        Rate lock expired — prices updated to today&rsquo;s rates
      </p>
    );
  }
  return (
    <p className="mt-3 inline-flex flex-wrap items-center gap-1.5 rounded-full border border-gold/35 bg-gold-pale/20 px-3 py-1 text-xs text-ink-soft">
      <LockIcon className="h-3.5 w-3.5 shrink-0 text-gold-deep" />
      Rate locked at {formatINRPrecise(item.lockedRate)}/g
      {mounted && (
        <span className="text-muted">
          · expires in {formatLockRemaining(remaining)}
        </span>
      )}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* One cart line                                                       */
/* ------------------------------------------------------------------ */

function CartLine({
  item,
  now,
  mounted,
  onQty,
  onRemove,
}: {
  item: CartItem;
  now: number;
  mounted: boolean;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const product = getProduct(item.productId);
  const category = product ? getCategory(product.category) : undefined;

  if (!product) {
    return (
      <li className="rounded-xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-medium text-ink-soft">
            This piece is no longer available
            <span className="ml-2 text-xs text-muted">({item.productId})</span>
          </p>
          <button type="button" onClick={onRemove} className="btn btn-outline px-4 py-2 text-xs">
            Remove
          </button>
        </div>
      </li>
    );
  }

  const m = lineMath(item, product);
  const href = `/product/${product.slug}`;

  return (
    <li className="rounded-xl border border-line bg-white p-4 transition-shadow duration-300 hover:shadow-[0_24px_45px_-30px_rgb(37_32_23/0.35)] sm:p-5">
      <div className="flex gap-4 sm:gap-6">
        {/* Image */}
        <a
          href={href}
          className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(120%_120%_at_50%_0%,#fbf7ee_0%,#f1e8d2_60%,#e9dcbc_100%)] sm:h-28 sm:w-28"
          aria-label={`View ${product.name}`}
        >
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <JewelIcon kind={category?.icon ?? "rings"} className="h-12 w-12 text-gold-deep" />
          )}
        </a>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <a
                href={href}
                className="font-display text-lg leading-snug text-ink transition-colors hover:text-gold-deep sm:text-xl"
              >
                {product.name}
              </a>
              <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.16em] text-muted">
                {category?.name ?? product.category} · {product.metal === "gold" ? "Gold" : "Silver"} {product.purity} ·{" "}
                {formatWeight(product.weightGrams)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {m.offer > 0 && (
                <p className="text-xs text-muted line-through">{formatINR(m.list)}</p>
              )}
              <p className="font-display text-xl font-semibold text-ink">{formatINR(m.line)}</p>
              <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                incl. making + GST
              </p>
            </div>
          </div>

          <LockStatus item={item} now={now} mounted={mounted} />

          {/* Qty + remove */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center rounded-full border border-line bg-cream/60">
              <button
                type="button"
                onClick={() => onQty(item.qty - 1)}
                aria-label={`Decrease quantity of ${product.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink-soft transition-colors hover:text-gold-deep disabled:opacity-30"
                disabled={item.qty <= 1}
              >
                −
              </button>
              <span className="w-7 text-center font-display text-base text-ink" aria-live="polite">
                {item.qty}
              </span>
              <button
                type="button"
                onClick={() => onQty(item.qty + 1)}
                aria-label={`Increase quantity of ${product.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink-soft transition-colors hover:text-gold-deep disabled:opacity-30"
                disabled={item.qty >= 10}
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${product.name} from cart`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted transition-colors hover:border-rose-300 hover:text-rose-600"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Order summary                                                       */
/* ------------------------------------------------------------------ */

function SummaryRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className={muted ? "text-muted" : "text-ink-soft"}>{label}</span>
      <span className={muted ? "text-muted" : "font-medium text-ink"}>{value}</span>
    </div>
  );
}

function OrderSummary({ items }: { items: Array<{ item: CartItem; product: Product }> }) {
  const sums = items.reduce(
    (acc, { item, product }) => {
      const m = lineMath(item, product);
      acc.metalValue += m.metalValue;
      acc.making += m.makingCharge;
      acc.gst += m.gst;
      acc.offers += m.offer;
      acc.subtotal += m.line;
      return acc;
    },
    { metalValue: 0, making: 0, gst: 0, offers: 0, subtotal: 0 },
  );
  const shipping = shippingFor(sums.subtotal);
  const total = sums.subtotal + shipping.fee;

  return (
    <div className="card-luxe sticky top-24 rounded-xl bg-white p-6 sm:p-7">
      <p className="eyebrow">
        <span className="eyebrow-line" aria-hidden="true" />
        Order summary
      </p>
      <div className="mt-5 space-y-3">
        <SummaryRow label="Metal value (locked rates)" value={formatINR(sums.metalValue)} />
        <SummaryRow label="Making charges" value={formatINR(sums.making)} />
        <SummaryRow label="GST (3%)" value={formatINR(sums.gst)} />
        <SummaryRow
          label="Offer discounts"
          value={sums.offers > 0 ? `− ${formatINR(sums.offers)}` : "—"}
          muted={sums.offers === 0}
        />
      </div>
      <div className="my-4 border-t border-dashed border-line" />
      <div className="space-y-3">
        <SummaryRow label="Subtotal" value={formatINR(sums.subtotal)} />
        <SummaryRow
          label="Shipping"
          value={shipping.free ? SHIPPING.freeLabel : formatINR(shipping.fee)}
          muted={shipping.free}
        />
      </div>
      {!shipping.free && (
        <p className="mt-2 text-xs text-muted">
          Free insured shipping on orders over {formatINR(SHIPPING.freeAbove)}.
        </p>
      )}
      <div className="my-4 border-t border-line" />
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-display text-lg text-ink">Total payable</span>
        <span className="font-display text-2xl font-semibold text-ink">{formatINR(total)}</span>
      </div>
      <p className="mt-1.5 text-right text-[0.68rem] uppercase tracking-[0.14em] text-muted">
        Incl. GST · rate-locked
      </p>

      <a href="/checkout" className="btn btn-gold mt-5 w-full">
        <BagIcon className="h-4 w-4" /> Proceed to Checkout
      </a>
      <a href="/catalogue" className="btn btn-outline mt-3 w-full">
        Continue shopping
      </a>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-gold-pale/20 p-3 text-xs leading-relaxed text-ink-soft">
        <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
        Your locked rates are confirmed again at checkout — nothing is charged
        without your consent.
      </p>

      {!COUPONS.enabled && (
        <p className="mt-3 text-center text-[0.68rem] uppercase tracking-[0.16em] text-muted">
          {COUPONS.note}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function CartPage() {
  const items = useCartItems();
  const { refresh } = useRates(60_000); // auto-refresh affordance; reprice uses latest
  const [now, setNow] = useState<number>(() => Date.now());
  const [mounted, setMounted] = useState(false);
  const [repriceNotice, setRepriceNotice] = useState<string[] | null>(null);

  // Client-only flag: time-dependent countdown text renders only after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tick: 1s countdown + expiry detection.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // On load: fetch the freshest rates, then immediately re-price any items
  // whose lock already expired. Tell the customer when prices changed.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch {
        /* keep whatever rates we have (config fallback) */
      }
      if (cancelled) return;
      const { repriced } = cartStore.repriceExpired(getLatestRates());
      if (repriced.length > 0) {
        setRepriceNotice(repriced.map((i) => productName(i.productId)));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live expiry: as a countdown crosses zero while the page is open, re-price
  // that item at the latest rates and notify. Re-priced items get a fresh lock
  // window, so this fires once per expiry — never in a loop.
  const ratesRef = useRef(getLatestRates());
  ratesRef.current = getLatestRates();
  useEffect(() => {
    const expired = items.filter((i) => !isLocked(i, now));
    if (expired.length === 0) return;
    const { repriced } = cartStore.repriceExpired(ratesRef.current);
    if (repriced.length > 0) {
      setRepriceNotice(repriced.map((i) => productName(i.productId)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const priceable = items.flatMap((item) => {
    const product = getProduct(item.productId);
    return product ? [{ item, product }] : [];
  });

  return (
    <main className="bg-ivory">
      {/* Header */}
      <section className="border-b border-line bg-cream/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            Your bag
          </p>
          <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Your cart</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Every price below is locked to the gold &amp; silver rate captured the moment you
            added the piece. Locks last {formatLockRemaining(DEFAULT_LOCK_MS)} by default and
            re-price transparently if they expire.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {items.length === 0 ? (
          /* ---------- Empty state ---------- */
          <section className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-b from-gold-pale/40 to-transparent">
              <div aria-hidden="true" className="absolute h-20 w-20 rounded-full border border-gold/20" />
              <JewelIcon kind="rings" className="h-12 w-12 text-gold-deep" />
            </div>
            <p className="eyebrow mt-8 justify-center">
              <span className="eyebrow-line" aria-hidden="true" />
              Your bag is empty
              <span className="eyebrow-line" aria-hidden="true" />
            </p>
            <h2 className="mt-3 font-display text-4xl text-ink">Waiting for something beautiful</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Rings, chains, mangalsutra, coins — every piece is priced at today&rsquo;s live
              rate and locked in your cart the moment you add it.
            </p>
            <a href="/catalogue" className="btn btn-gold mt-8">
              Browse the collection
            </a>
          </section>
        ) : (
          <>
            {/* Price-lock guarantee banner */}
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-gold/40 bg-charcoal px-5 py-4 text-gold-pale">
              <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p className="text-sm leading-relaxed">
                <span className="font-medium text-gold-bright">Rates shown are locked.</span>{" "}
                Prices are computed from the metal rate captured when each piece was added and
                can&rsquo;t change while the lock is active. Expired locks re-price at today&rsquo;s
                rate and we tell you — every time.
              </p>
            </div>

            {/* Re-price notice */}
            {repriceNotice && (
              <div
                role="status"
                aria-live="polite"
                className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-amber-300/70 bg-amber-50 px-5 py-4"
              >
                <div className="text-sm leading-relaxed text-brown">
                  <p className="font-semibold">
                    Rates have changed since you added these items — your cart total was updated.
                  </p>
                  <p className="mt-1">
                    {repriceNotice.join(", ")} {repriceNotice.length === 1 ? "was" : "were"} re-priced at
                    today&rsquo;s rates with a fresh lock window.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRepriceNotice(null)}
                  aria-label="Dismiss notice"
                  className="shrink-0 rounded-full p-1.5 text-brown/70 transition-colors hover:bg-amber-100 hover:text-brown"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start">
              {/* Items */}
              <ul className="space-y-4">
                {items.map((item) => (
                  <CartLine
                    key={item.productId}
                    item={item}
                    now={now}
                    mounted={mounted}
                    onQty={(q) => cartStore.setQty(item.productId, q)}
                    onRemove={() => cartStore.remove(item.productId)}
                  />
                ))}
              </ul>

              {/* Summary */}
              <OrderSummary items={priceable} />
            </div>

            <div className="mt-10 border-t border-line pt-6 text-center">
              <button
                type="button"
                onClick={() => cartStore.clear()}
                className="text-xs uppercase tracking-[0.18em] text-muted underline underline-offset-4 transition-colors hover:text-rose-600"
              >
                Clear bag
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
