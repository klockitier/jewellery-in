/**
 * Product detail page — /product/$slug
 *
 * The full premium purchase page: image gallery with zoom + accessible
 * lightbox, live-rate price breakdown (centralized pricing pipeline), qty,
 * add-to-cart / buy-now, full specifications, care, delivery, returns,
 * price-lock explainer, stock states and related products.
 *
 * All prices derive from src/config/pricing.ts + src/config/rates.ts — never
 * hardcoded — so the price-locking cart task can build on the same pipeline.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCategory } from "~/config/categories";
import { computePrice, rateFor } from "~/config/pricing";
import { getProduct, products, type Product } from "~/config/products";
import { siteConfig } from "~/config/site";
import { cartStore } from "~/lib/cart";
import { formatINR, formatINRPrecise, formatWeight } from "~/lib/format";
import { pageHead } from "~/lib/seo";
import { useRates } from "~/lib/useRates";
import { ProductCard } from "~/components/ProductCard";
import { JewelIcon } from "~/components/JewelIcon";
import {
  BagIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  ExchangeIcon,
  GemIcon,
  RefreshIcon,
  ShieldIcon,
  TruckIcon,
} from "~/components/icons";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const p = getProduct(params.slug);
    return pageHead({
      title: `${p?.name ?? "Product"} — Shri Madhav Jewellers`,
      description: p
        ? `${p.shortDescription} ${p.metal === "gold" ? "Gold" : "Silver"} ${p.purity}, ${formatWeight(p.weightGrams)}, priced transparently at today's live metal rate.`
        : "This piece could not be found. Explore the full Shri Madhav Jewellers collection.",
      image: p?.images[0] ?? p?.image,
      path: `/product/${params.slug}`,
    });
  },
  component: ProductPage,
});

/* ------------------------------------------------------------------ */
/* Small pieces                                                       */
/* ------------------------------------------------------------------ */

const BADGE_STYLES: Record<string, string> = {
  new: "bg-gold text-white",
  bestseller: "bg-charcoal text-gold-pale",
  offer: "bg-brown text-ivory",
};
const BADGE_LABELS: Record<string, string> = {
  new: "New Arrival",
  bestseller: "Best Seller",
  offer: "Offer",
};

const OCCASION_LABEL: Record<string, string> = {
  bridal: "Bridal",
  everyday: "Everyday",
  festive: "Festive",
  office: "Office Wear",
  gifting: "Gifting",
};

/** Fallback line-art tile — shown when a product has no photos or an image fails. */
function ArtTile({ product, className = "" }: { product: Product; className?: string }) {
  const category = getCategory(product.category);
  return (
    <div
      className={`flex items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#fbf7ee_0%,#f1e8d2_60%,#e9dcbc_100%)] ${className}`}
      role="img"
      aria-label={`${product.name} — design rendering`}
    >
      <div aria-hidden="true" className="absolute h-52 w-52 rounded-full border border-gold/25" />
      <div aria-hidden="true" className="absolute h-36 w-36 rounded-full border border-gold/15" />
      <JewelIcon
        kind={category?.icon ?? "rings"}
        className="relative h-28 w-28 text-gold-deep drop-shadow-[0_10px_18px_rgb(166_130_60/0.25)]"
      />
    </div>
  );
}

/** <img> with graceful onerror fallback to the line-art tile. */
function GalleryImage({
  product,
  src,
  alt,
  className = "",
  sizes,
}: {
  product: Product;
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return <ArtTile product={product} className={className} />;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      sizes={sizes}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Gallery — thumbnails, hover zoom, accessible lightbox               */
/* ------------------------------------------------------------------ */

function Gallery({ product }: { product: Product }) {
  const images = product.images;
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Keyboard: Escape closes the lightbox; ← / → cycle images while open.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Move focus into the dialog for screen readers.
    lightboxRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, images.length]);

  const openLightbox = useCallback(() => setLightbox(true), []);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-line">
        <ArtTile product={product} className="absolute inset-0" />
        <span className="absolute bottom-4 left-4 rounded-full bg-charcoal/70 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-gold-pale">
          Design rendering
        </span>
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[5rem_1fr]">
        {/* Thumbnails (vertical on desktop, horizontal strip on mobile) */}
        {images.length > 1 && (
          <div
            className="no-scrollbar order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible"
            role="tablist"
            aria-label="Product images"
          >
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`View image ${i + 1} of ${images.length}`}
                onClick={() => setActive(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-all duration-300 ${
                  i === active
                    ? "border-gold-deep ring-2 ring-gold/40"
                    : "border-line opacity-70 hover:opacity-100"
                }`}
              >
                <GalleryImage product={product} src={src} alt="" className="absolute inset-0 h-full w-full" />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="group relative order-1 overflow-hidden rounded-xl border border-line bg-[radial-gradient(120%_120%_at_50%_0%,#fbf7ee_0%,#f1e8d2_60%,#e9dcbc_100%)] lg:order-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <button
              type="button"
              onClick={openLightbox}
              aria-label={`Enlarge ${product.name} image ${active + 1} of ${images.length}`}
              className="absolute inset-0 z-[1] cursor-zoom-in"
            />
            <GalleryImage
              product={product}
              src={current}
              alt={`${product.name} — view ${active + 1}`}
              sizes="(min-width: 1024px) 45vw, 92vw"
              className="absolute inset-0 h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-charcoal/60 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-gold-pale backdrop-blur-sm">
              {active + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} enlarged view`}
          tabIndex={-1}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/95 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setLightbox(false)}
        >
          <div
            className="relative max-h-full w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-[#17130d]">
              <GalleryImage
                product={product}
                src={current}
                alt={`${product.name} — enlarged view ${active + 1}`}
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {/* Prev / Next */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Previous image"
                className="ml-2 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold-pale transition-colors hover:bg-gold hover:text-white"
              >
                <ChevronRightIcon className="h-5 w-5 rotate-180" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i + 1) % images.length);
                }}
                aria-label="Next image"
                className="mr-2 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold-pale transition-colors hover:bg-gold hover:text-white"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close enlarged view"
              className="absolute -top-3 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-white shadow-lg transition-transform hover:scale-105"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <p className="mt-3 text-center text-sm tracking-[0.2em] text-gold-pale">
              {active + 1} / {images.length} — use ← → to browse
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Purchase panel                                                      */
/* ------------------------------------------------------------------ */

function PurchasePanel({ product }: { product: Product }) {
  const { rates } = useRates(60_000); // live provider rates, refreshed on mount + every 60s
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const category = getCategory(product.category);

  const rate = rateFor(product.metal, product.purity, rates);
  const breakdown = computePrice({
    ratePerGram: rate,
    weightGrams: product.weightGrams,
    makingCharge: product.makingCharge,
  });
  const displayTotal = product.offerPercent ? breakdown.total * (1 - product.offerPercent / 100) : breakdown.total;
  const listTotal = product.offerPercent ? breakdown.total : null;
  const savings = product.offerPercent ? breakdown.total - displayTotal : 0;

  const handleAdd = () => {
    // Price lock: pass the freshest rates from useRates so the item captures
    // the rate at the moment of the click.
    cartStore.add(product.id, qty, rates);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  const handleBuyNow = () => {
    cartStore.add(product.id, qty, rates);
    window.location.assign("/checkout");
  };

  return (
    <div className="flex flex-col">
      {/* Category + badges */}
      <div className="flex flex-wrap items-center gap-2">
        <a href={`/category/${product.category}`} className="eyebrow hover:underline">
          {category?.name}
        </a>
        {product.badge && (
          <span className={`rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] ${BADGE_STYLES[product.badge]}`}>
            {BADGE_LABELS[product.badge]}
          </span>
        )}
        {product.offerPercent && (
          <span className="rounded-full bg-gold-pale px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-bronze">
            {product.offerPercent}% off
          </span>
        )}
      </div>

      <h1 className="mt-3 font-display text-4xl leading-[1.08] text-ink sm:text-5xl">{product.name}</h1>
      <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">{product.shortDescription}</p>

      {/* Metal · purity · weight chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          product.metal === "gold" ? "Gold" : "Silver",
          product.purity.toUpperCase(),
          formatWeight(product.weightGrams),
        ].map((chip) => (
          <span key={chip} className="rounded-full border border-line bg-cream/60 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
            {chip}
          </span>
        ))}
      </div>

      {/* Trust row — no fake review counts, just honest guarantees */}
      <ul className="mt-5 grid grid-cols-2 gap-2 text-[0.78rem] text-ink-soft">
        {[
          { icon: <ShieldIcon className="h-4 w-4" />, label: "BIS Hallmarked" },
          { icon: <GemIcon className="h-4 w-4" />, label: "100% Certified" },
          { icon: <CheckIcon className="h-4 w-4" />, label: "GST Invoice" },
          { icon: <ExchangeIcon className="h-4 w-4" />, label: "Lifetime Exchange" },
        ].map(({ icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-gold-deep">
            {icon}
            <span className="text-ink-soft">{label}</span>
          </li>
        ))}
      </ul>

      {/* Price breakdown card — always from the centralized pipeline */}
      <div className="mt-6 rounded-xl border border-line bg-white p-5 shadow-[0_18px_40px_-30px_rgb(37_32_23/0.4)]">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl font-semibold text-ink">
            {formatINR(displayTotal * qty)}
          </p>
          {listTotal && (
            <p className="text-sm text-muted line-through">{formatINR(listTotal * qty)}</p>
          )}
        </div>
        {savings > 0 && (
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-gold-deep">
            You save {formatINR(savings * qty)}
          </p>
        )}
        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-muted">
          incl. making charges + 3% GST · per piece
        </p>

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">
              Metal value <span className="text-[0.68rem]">({formatINRPrecise(rate)}/g × {formatWeight(product.weightGrams)})</span>
            </dt>
            <dd className="font-medium text-ink">{formatINR(breakdown.metalValue)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Making charges</dt>
            <dd className="font-medium text-ink">{formatINR(breakdown.makingCharge)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">GST (3%)</dt>
            <dd className="font-medium text-ink">{formatINR(breakdown.gst)}</dd>
          </div>
          {listTotal && (
            <div className="flex justify-between text-gold-deep">
              <dt>Offer discount</dt>
              <dd className="font-medium">− {formatINR(savings)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-2 text-base">
            <dt className="font-medium text-ink">Total (incl. taxes)</dt>
            <dd className="font-semibold text-gold-deep">{formatINR(displayTotal)}</dd>
          </div>
        </dl>

        {/* Live rate + price-lock note */}
        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-cream/70 px-3.5 py-3 text-[0.78rem] leading-relaxed text-ink-soft">
          <RefreshIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
          <p>
            <span className="font-medium text-ink">{product.metal === "gold" ? "Gold" : "Silver"} {product.purity.toUpperCase()} at {formatINRPrecise(rate)}/gram</span>{" "}
            — the rate you see is locked the moment you add to cart, so your price
            stays fair even if the market moves. <a href="#price-lock" className="text-gold-deep underline decoration-gold/40 underline-offset-2 hover:decoration-gold-deep">How locking works</a>
          </p>
        </div>
      </div>

      {/* Qty + actions */}
      {!product.inStock ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/60 p-5">
          <div className="flex items-center gap-2">
            <StockPill product={product} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            This piece is being re-crafted by our karigars. Leave your email and we&rsquo;ll
            notify you the moment it&rsquo;s back in stock.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              aria-label="Email for stock notification"
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold"
            />
            <button type="button" className="btn btn-dark shrink-0">
              Notify me
            </button>
          </div>
          <p className="mt-2 text-[0.68rem] uppercase tracking-[0.16em] text-muted">
            UI only — email capture arrives with accounts
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-line bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl text-ink-soft transition-colors hover:text-gold-deep disabled:opacity-30"
                disabled={qty <= 1}
              >
                −
              </button>
              <span className="w-8 text-center font-display text-xl text-ink" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl text-ink-soft transition-colors hover:text-gold-deep disabled:opacity-30"
                disabled={qty >= 10}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={`btn flex-1 ${added ? "bg-gold-deep text-white" : "btn-gold"}`}
            >
              {added ? (
                <>
                  <CheckIcon className="h-4 w-4" /> Added to bag
                </>
              ) : (
                <>
                  <BagIcon className="h-4 w-4" /> Add to cart
                </>
              )}
            </button>
          </div>
          <button type="button" onClick={handleBuyNow} className="btn btn-dark mt-3 w-full">
            Buy now — secure checkout
          </button>
          <p className="mt-2 text-center text-[0.7rem] uppercase tracking-[0.16em] text-muted">
            {siteConfig.shipping.charge} · {siteConfig.shipping.deliveryEstimate}
          </p>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Details sections                                                    */
/* ------------------------------------------------------------------ */

function SpecsTable({ product }: { product: Product }) {
  const category = getCategory(product.category);
  const rows: Array<[string, string]> = [
    ["Category", category?.name ?? product.category],
    ["Metal", product.metal === "gold" ? "Gold" : "Silver"],
    ["Purity", product.purity.toUpperCase()],
    ["Weight", formatWeight(product.weightGrams)],
  ];
  if (product.stones) {
    rows.push([
      "Stones",
      [product.stones.type, product.stones.carat ? `${product.stones.carat} ct` : "", product.stones.count ? `${product.stones.count} pc` : "", product.stones.clarity ?? ""]
        .filter(Boolean)
        .join(" · "),
    ]);
  }
  rows.push(
    ["Gender", product.gender === "unisex" ? "Unisex" : product.gender === "men" ? "Men" : "Women"],
    ["Occasion", OCCASION_LABEL[product.occasion] ?? product.occasion],
    ["SKU", product.id.toUpperCase()],
  );
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={k} className={i % 2 ? "bg-cream/50" : ""}>
              <th scope="row" className="w-1/3 px-5 py-3.5 text-left font-medium uppercase tracking-[0.12em] text-muted">
                {k}
              </th>
              <td className="px-5 py-3.5 text-ink">{v}</td>
            </tr>
          ))}
          <tr className="bg-cream/50">
            <th scope="row" className="w-1/3 px-5 py-3.5 text-left font-medium uppercase tracking-[0.12em] text-muted">
              Availability
            </th>
            <td className="px-5 py-3.5">
              <StockPill product={product} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function StockPill({ product }: { product: Product }) {
  if (!product.inStock)
    return <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Out of stock</span>;
  if (product.lowStock)
    return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Only a few left</span>;
  return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">In stock</span>;
}

function CareAccordion({ product }: { product: Product }) {
  return (
    <details className="group rounded-xl border border-line bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
        Care instructions
        <ChevronRightIcon className="h-4 w-4 text-gold-deep transition-transform duration-300 group-open:rotate-90" />
      </summary>
      <div className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-soft">
        {product.careInstructions ?? "Store separately in the supplied box and clean gently with a soft cloth."}
      </div>
    </details>
  );
}

function PriceLockExplain() {
  return (
    <details id="price-lock" className="group rounded-xl border border-gold/40 bg-gold-pale/20">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
        How price locking works
        <ChevronRightIcon className="h-4 w-4 text-gold-deep transition-transform duration-300 group-open:rotate-90" />
      </summary>
      <div className="border-t border-gold/25 px-5 py-4 text-sm leading-relaxed text-ink-soft">
        <p>
          Jewellery prices move with the market. When you add a piece to your cart, we lock the
          gold or silver rate for a validity window — so the price you see is the price you pay,
          even if the market rate changes before you check out. If the lock expires, the price
          simply recalculates at the latest rate and we show you the difference — nothing is
          charged without your confirmation.
        </p>
        <p className="mt-2">
          Your cart shows the locked rate, metal value, making charges, GST and the total, so
          every paisa is transparent before you pay.
        </p>
      </div>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function ProductPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug);

  if (!product) {
    return (
      <main className="bg-ivory">
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-28 text-center">
          <p className="eyebrow">Error 404</p>
          <h1 className="mt-4 font-display text-5xl text-ink">This piece isn&rsquo;t here</h1>
          <p className="mx-auto mt-4 max-w-md text-muted">
            It may have been renamed or removed from the collection. Explore the full catalogue to
            find your next treasure.
          </p>
          <a href="/catalogue" className="btn btn-gold mt-8">
            Browse the catalogue
          </a>
        </section>
      </main>
    );
  }

  const category = getCategory(product.category);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const tags = [...product.tags, product.occasion, product.gender];

  return (
    <main className="bg-ivory">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="border-b border-line bg-cream/60">
        <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-3.5 text-[0.72rem] uppercase tracking-[0.16em] text-muted sm:px-6 lg:px-8">
          <li><a href="/" className="transition-colors hover:text-gold-deep">Home</a></li>
          <li aria-hidden="true"><ChevronRightIcon className="h-3 w-3" /></li>
          <li><a href="/catalogue" className="transition-colors hover:text-gold-deep">Catalogue</a></li>
          <li aria-hidden="true"><ChevronRightIcon className="h-3 w-3" /></li>
          <li>
            <a href={`/category/${product.category}`} className="transition-colors hover:text-gold-deep">
              {category?.name}
            </a>
          </li>
          <li aria-hidden="true"><ChevronRightIcon className="h-3 w-3" /></li>
          <li aria-current="page" className="truncate text-ink-soft">{product.name}</li>
        </ol>
      </nav>

      {/* Two-column: gallery + purchase panel */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-14">
        <Gallery product={product} />
        <PurchasePanel product={product} />
      </section>

      {/* Details: description, specs, care, delivery, returns, price lock */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />The piece</p>
            <h2 className="mt-3 font-display text-3xl text-ink">Handcrafted in the Shri Madhav tradition</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">{product.description}</p>
            <p className="mt-3 leading-relaxed text-muted">{product.shortDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-full border border-line bg-white px-3 py-1 text-xs capitalize tracking-wide text-muted">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <CareAccordion product={product} />
              <PriceLockExplain />
            </div>

            {/* Delivery + returns */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-4">
                <TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
                <div className="text-sm">
                  <p className="font-medium text-ink">Delivery</p>
                  <p className="mt-0.5 text-muted">
                    {siteConfig.shipping.charge} · {siteConfig.shipping.deliveryEstimate}
                    <br />
                    Dispatch {siteConfig.shipping.dispatchTime.toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-4">
                <ExchangeIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
                <div className="text-sm">
                  <p className="font-medium text-ink">Returns & exchange</p>
                  <p className="mt-0.5 text-muted">
                    {siteConfig.shipping.returnsWindow} exchange window on certified pieces.
                    Lifetime exchange at our showroom.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Specifications</p>
            <h2 className="mt-3 font-display text-3xl text-ink">Every detail, transparent</h2>
            <div className="mt-5">
              <SpecsTable product={product} />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Hallmarked by a BIS-assessed assaying centre. Weight and purity are printed on your
              invoice; metal value is computed from today&rsquo;s live rate at the moment of purchase.
            </p>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="border-t border-line bg-cream/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="eyebrow justify-center">
                <span className="eyebrow-line" aria-hidden="true" />
                You may also love
                <span className="eyebrow-line" aria-hidden="true" />
              </p>
              <h2 className="mt-3 font-display text-4xl text-ink">More {category?.name}</h2>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
