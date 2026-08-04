/**
 * Premium product card: line-art placeholder imagery (until real photos),
 * name, category · purity · weight, price computed via the centralized
 * pricing module, badge, and quick add-to-cart.
 */

import { useState } from "react";
import { getCategory } from "~/lib/catalogue";
import { computePrice, rateFor } from "~/config/pricing";
import { fetchRates, getRates } from "~/config/rates";
import type { Product } from "~/lib/catalogue";
import { cartStore } from "~/lib/cart";
import { formatINR, formatWeight } from "~/lib/format";
import { getLatestRates } from "~/lib/useRates";
import { BagIcon, CheckIcon } from "./icons";
import { JewelIcon } from "./JewelIcon";

const BADGE_STYLES: Record<string, string> = {
  new: "bg-gold text-white",
  bestseller: "bg-charcoal text-gold-pale",
  offer: "bg-brown text-ivory",
};

const BADGE_LABELS: Record<string, string> = {
  new: "New",
  bestseller: "Best Seller",
  offer: "Offer",
};

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const [added, setAdded] = useState(false);
  const category = getCategory(product.category);
  const rates = getRates();
  const rate = rateFor(product.metal, product.purity, rates);

  const { total } = computePrice({
    ratePerGram: rate,
    weightGrams: product.weightGrams,
    makingCharge: product.makingCharge,
  });
  const displayTotal = product.offerPercent ? total * (1 - product.offerPercent / 100) : total;
  const listTotal = product.offerPercent ? total : null;

  const handleAdd = async () => {
    // Price lock: capture the rate at the moment of the click. fetchRates()
    // today resolves from config instantly; when a live provider is wired this
    // grabs the true market rate at add time. getLatestRates() is the sync
    // fallback so a failed fetch never blocks the add.
    const rates = await fetchRates().catch(() => getLatestRates());
    cartStore.add(product.id, 1, rates);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_30px_50px_-30px_rgb(37_32_23/0.35)]">
      {/* Badge */}
      {product.badge && (
        <span
          className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] ${BADGE_STYLES[product.badge]}`}
        >
          {BADGE_LABELS[product.badge]}
        </span>
      )}
      {product.offerPercent && (
        <span className="absolute right-4 top-4 z-10 rounded-full bg-gold-pale px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-bronze">
          {product.offerPercent}% off
        </span>
      )}

      {/* Image area */}
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#fbf7ee_0%,#f1e8d2_60%,#e9dcbc_100%)]">
        {/* ornamental ring behind the icon */}
        <div
          aria-hidden="true"
          className="absolute h-40 w-40 rounded-full border border-gold/25 transition-transform duration-700 group-hover:scale-110"
        />
        <div
          aria-hidden="true"
          className="absolute h-28 w-28 rounded-full border border-gold/15"
        />
        <a href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-[1]">
        {product.image ? (
          // Real photography path (catalogue task): keep aspect + alt
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <JewelIcon
            kind={category?.icon ?? "rings"}
            className="relative h-24 w-24 text-gold-deep drop-shadow-[0_10px_18px_rgb(166_130_60/0.25)] transition-transform duration-700 group-hover:scale-110"
          />
        )}
        </a>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="text-[0.64rem] font-medium uppercase tracking-[0.24em] text-muted">
          {category?.name} · {product.metal === "gold" ? "Gold" : "Silver"} {product.purity} · {formatWeight(product.weightGrams)}
        </p>
        <h3 className="mt-1.5 font-display text-[1.3rem] leading-snug text-ink transition-colors group-hover:text-gold-deep">
          <a href={`/product/${product.slug}`}>{product.name}</a>
        </h3>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {listTotal && (
              <p className="text-xs text-muted line-through">{formatINR(listTotal)}</p>
            )}
            <p className="font-display text-[1.35rem] font-semibold leading-none text-ink">
              {formatINR(displayTotal)}
            </p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-muted">incl. making + GST</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
              added
                ? "bg-gold-deep text-white"
                : "border border-gold text-gold-deep hover:bg-gold hover:text-white"
            }`}
          >
            {added ? <CheckIcon className="h-5 w-5" /> : <BagIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
