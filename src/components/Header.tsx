/**
 * Site header: live-rate ticker strip + sticky nav bar with search,
 * account/wishlist/cart icons and a mobile drawer. Search is a working
 * client-side lookup over the product config (the autocomplete task will
 * replace the data source; the UI stays).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { categories, featuredCategories } from "~/lib/catalogue";
import { products } from "~/lib/catalogue";
import { siteConfig } from "~/config/site";
import { useCartCount } from "~/lib/cart";
import { useRates } from "~/lib/useRates";
import { formatINRPrecise } from "~/lib/format";
import {
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./icons";
import { JewelIcon } from "./JewelIcon";
import { Logo } from "./Logo";

/* ---------------- Live rate ticker strip ---------------- */

const TICKER_MESSAGES = [
  "BIS-hallmarked purity on every piece",
  "Transparent making charges — always shown",
  "Lifetime exchange on Shri Madhav purchases",
  "Free insured shipping across India",
];

export function RateTicker() {
  const { rates } = useRates(60_000); // live from the rates provider; config until hydration
  const items = [
    `Gold 24K ${formatINRPrecise(rates.gold24k)}/g`,
    `Gold 22K ${formatINRPrecise(rates.gold22k)}/g`,
    `Gold 18K ${formatINRPrecise(rates.gold18k)}/g`,
    `Silver ${formatINRPrecise(rates.silver)}/g`,
    ...TICKER_MESSAGES,
  ];
  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="mx-6 inline-flex items-center gap-6 text-[0.72rem] font-normal tracking-[0.18em] uppercase">
          {t}
          <span className="text-gold" aria-hidden="true">◆</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="overflow-hidden bg-charcoal text-gold-pale" role="region" aria-label="Live gold and silver rates">
      <div className="animate-marquee flex w-max py-2">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ---------------- Search with results ---------------- */

function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((p) => {
        const cat = categories.find((c) => c.slug === p.category);
        return (
          p.name.toLowerCase().includes(term) ||
          p.metal.includes(term) ||
          p.purity.includes(term) ||
          cat?.name.toLowerCase().includes(term)
        );
      })
      .slice(0, 6);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={boxRef} className="relative hidden lg:block">
      <label className="sr-only" htmlFor="site-search">Search products</label>
      <div className="flex items-center gap-2 rounded-full border border-line bg-cream/70 px-4 py-2.5 transition-colors focus-within:border-gold">
        <SearchIcon className="h-4 w-4 shrink-0 text-gold-deep" />
        <input
          id="site-search"
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) { window.location.href = `/search?q=${encodeURIComponent(q.trim())}`; setOpen(false); } }}
          placeholder="Search rings, chains, coins…"
          className="w-44 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none xl:w-56"
          autoComplete="off"
          aria-expanded={open}
          aria-controls="search-results"
        />
      </div>
      {open && q.trim() && (
        <div
          id="search-results"
          className="card-luxe absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-auto rounded-lg py-2"
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">No matches for “{q}”. Try “ring” or “coin”.</p>
          ) : (
            <>
              {results.map((p) => {
                const cat = categories.find((c) => c.slug === p.category);
                return (
                  <a
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-cream"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand/60 text-gold-deep">
                      <JewelIcon kind={(cat?.icon ?? "rings")} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-ink">{p.name}</span>
                      <span className="block text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                        {cat?.name} · {p.metal} {p.purity}
                      </span>
                    </span>
                  </a>
                );
              })}
              <p className="mt-1 border-t border-line px-4 pt-2 text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                Full catalogue arriving soon
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Navigation ---------------- */

const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/* ---------------- Mobile drawer ---------------- */

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute right-0 top-0 flex h-full w-[min(22rem,88vw)] flex-col bg-ivory shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full border border-line p-2.5 text-ink transition-colors hover:border-gold hover:text-gold-deep"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-6">
          <p className="eyebrow">Browse</p>
          <nav className="mt-3 flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={onClose}
                className="border-b border-line/70 py-3.5 font-display text-xl text-ink transition-colors hover:text-gold-deep"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <p className="eyebrow mt-8">Categories</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {categories.map((c) => (
              <a
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 text-sm text-ink-soft transition-colors hover:text-gold-deep"
              >
                <JewelIcon kind={c.icon} className="h-4.5 w-4.5 text-gold-deep" />
                {c.name}
              </a>
            ))}
          </div>

          <div className="mt-8 rounded-lg bg-cream p-5 text-sm text-ink-soft">
            <p className="font-medium text-ink">Visit our showroom</p>
            <p className="mt-1">{siteConfig.address.line1}, {siteConfig.address.city}</p>
            <p className="mt-2">
              <a href={`tel:${siteConfig.phone}`} className="text-gold-deep hover:underline">
                {siteConfig.phoneDisplay}
              </a>
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ---------------- Header ---------------- */

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cartCount = useCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <RateTicker />
      <div className={`sticky top-0 z-40 border-b transition-all duration-300 ${scrolled ? "border-line bg-ivory/95 shadow-[0_8px_30px_-18px_rgb(37_32_23/0.35)] backdrop-blur-md" : "border-transparent bg-ivory"}`}>
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: burger (mobile) + logo */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-line p-2.5 text-ink transition-colors hover:border-gold hover:text-gold-deep lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <Logo />
          </div>

          {/* Center: nav (desktop) */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="group relative py-2 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
              >
                {l.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold-deep transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
            {/* Categories dropdown */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1.5 py-2 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
                aria-haspopup="true"
              >
                Categories
                <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-1/2 top-full z-30 w-72 -translate-x-1/2 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="card-luxe rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-1">
                    {featuredCategories.map((c) => (
                      <a
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-cream hover:text-gold-deep"
                      >
                        <JewelIcon kind={c.icon} className="h-5 w-5 text-gold-deep" />
                        {c.name}
                      </a>
                    ))}
                  </div>
                  <a
                    href="/categories"
                    className="mt-2 block border-t border-line px-3 pt-3 text-center text-[0.7rem] uppercase tracking-[0.2em] text-gold-deep hover:underline"
                  >
                    View all categories
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Right: search + icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <SearchBox />
            <a
              href="/account"
              className="hidden rounded-full p-2.5 text-ink transition-colors hover:bg-cream hover:text-gold-deep sm:inline-flex"
              aria-label="Account"
            >
              <UserIcon className="h-5 w-5" />
            </a>
            <a
              href="/wishlist"
              className="hidden rounded-full p-2.5 text-ink transition-colors hover:bg-cream hover:text-gold-deep sm:inline-flex"
              aria-label="Wishlist"
            >
              <HeartIcon className="h-5 w-5" />
            </a>
            <a
              href="/cart"
              className="relative rounded-full p-2.5 text-ink transition-colors hover:bg-cream hover:text-gold-deep"
              aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            >
              <BagIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-deep px-1 text-[0.68rem] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
