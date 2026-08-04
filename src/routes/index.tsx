/**
 * Homepage — the premium storefront for Shri Madhav Jewellers.
 * Sections (in order): hero, USP strip, live rates, collections, categories,
 * new arrivals, best sellers, testimonials, visit us, newsletter.
 */

import { createFileRoute } from "@tanstack/react-router";
import { collections } from "~/lib/catalogue";
import { featuredCategories } from "~/lib/catalogue";
import { bestSellers, newArrivals, getProducts } from "~/lib/catalogue";
import { getRates } from "~/config/rates";
import { siteConfig } from "~/config/site";
import { testimonials } from "~/config/testimonials";
import { formatINRPrecise } from "~/lib/format";
import { pageHead } from "~/lib/seo";
import { JewelIcon, Ornament } from "~/components/JewelIcon";
import { NewsletterSignup } from "~/components/NewsletterSignup";
import { ProductCard } from "~/components/ProductCard";
import { RateBanner } from "~/components/RateBanner";
import { Reveal } from "~/components/Reveal";
import { SectionHeading } from "~/components/SectionHeading";
import {
  ArrowRightIcon,
  ClockIcon,
  ExchangeIcon,
  GemIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  QuoteIcon,
  ShieldIcon,
  StarIcon,
  TruckIcon,
} from "~/components/icons";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Shri Madhav Jewellers — Fine Gold & Silver Jewellery",
      description:
        "Premium gold & silver jewellery with transparent live rates, BIS-hallmarked purity and a price-locking cart. Shop rings, chains, necklaces, mangalsutra, bangles and more.",
      path: "/",
    }),
  component: Home,
});

/* ============================= Hero ============================= */

function Hero() {
  const rates = getRates();
  return (
    <section className="safe-underlay relative overflow-hidden text-ivory" aria-labelledby="hero-title">
      {/* faint background ornament */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] text-gold/10"
      >
        <circle cx="200" cy="200" r="196" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M200 30 240 90l-40 280-40-280Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
      </svg>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
        {/* Copy */}
        <div className="relative">
          <Reveal>
            <p className="eyebrow !text-gold-bright">
              <span className="eyebrow-line !bg-[linear-gradient(90deg,#c6a45c,transparent)]" aria-hidden="true" />
              {siteConfig.estd} · BIS Hallmarked
            </p>
            <h1
              id="hero-title"
              className="mt-5 text-[2.9rem] font-medium leading-[1.05] sm:text-6xl lg:text-[4.4rem]"
            >
              Crafted in gold,
              <br />
              <span className="gold-text italic">worn with devotion.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-ivory/70">
              {siteConfig.tagline}. Every piece hallmarked, every price transparent — live metal rates, clear
              making charges, and the trust of a family showroom.
            </p>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="/new-arrivals" className="btn btn-gold">
                Shop Now
              </a>
              <a href="/collections" className="btn btn-outline-light">
                Explore Collections
              </a>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[0.72rem] uppercase tracking-[0.2em] text-ivory/55">
              <li className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-gold" /> BIS Hallmark
              </li>
              <li className="flex items-center gap-2">
                <GemIcon className="h-4 w-4 text-gold" /> Transparent Pricing
              </li>
              <li className="flex items-center gap-2">
                <ExchangeIcon className="h-4 w-4 text-gold" /> Lifetime Exchange
              </li>
            </ul>
          </Reveal>
        </div>

        {/* Imagery */}
        <Reveal delay={1} className="relative">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2rem] border border-gold/20"
            />
            <div className="relative overflow-hidden rounded-2xl border border-gold/30 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]">
              <img
                src="/images/hero-ring.jpg"
                alt="Fine gold and diamond ring, handcrafted"
                width={1280}
                height={1024}
                fetchPriority="high"
                className="aspect-[4/3.1] w-full object-cover animate-slow-zoom"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />
            </div>

            {/* overlapping second image */}
            <div className="absolute -bottom-10 -left-4 hidden w-44 overflow-hidden rounded-xl border-4 border-charcoal shadow-2xl sm:block lg:-left-10 lg:w-52">
              <img
                src="/images/hero-gold.jpg"
                alt="Handcrafted gold jewellery"
                loading="lazy"
                width={440}
                height={440}
                className="aspect-square w-full object-cover"
              />
            </div>

            {/* floating rate chip */}
            <div className="absolute -top-5 right-4 rounded-xl border border-gold/40 bg-charcoal-soft/90 px-4 py-3 shadow-xl backdrop-blur lg:-right-6">
              <p className="text-[0.6rem] uppercase tracking-[0.24em] text-gold-bright">Gold 22K · Today</p>
              <p className="mt-1 font-display text-xl font-semibold text-ivory">
                {formatINRPrecise(rates.gold22k)}
                <span className="text-xs font-normal text-ivory/50">/g</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ USP strip ============================ */

const USPS = [
  { icon: ShieldIcon, title: "Certified Purity", text: "BIS-hallmarked gold & 925 silver" },
  { icon: GemIcon, title: "Transparent Pricing", text: "Live rates + making charges shown" },
  { icon: ExchangeIcon, title: "Lifetime Exchange", text: "On every Shri Madhav piece" },
  { icon: TruckIcon, title: "Insured Delivery", text: "Free, secure shipping across India" },
];

function UspStrip() {
  return (
    <section aria-label="Why shop with us" className="border-y border-line bg-ivory">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {USPS.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={(i % 4) as 1 | 2 | 3 | 0} className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold-deep">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg leading-tight text-ink">{title}</span>
              <span className="mt-0.5 block text-[0.82rem] text-muted">{text}</span>
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================ Collections ============================ */

function CollectionsSection() {
  return (
    <section id="collections" className="scroll-mt-28 bg-ivory py-20 lg:py-24" aria-labelledby="collections-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Curated for you"
            title="Featured Collections"
            sub="From bridal statements to everyday elegance — each collection is crafted by our karigars with 22K and 18K gold."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c, i) => (
            <Reveal key={c.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <a
                href={c.href}
                className="group relative block h-[26rem] overflow-hidden rounded-xl"
                aria-label={`${c.name} — ${c.tagline}`}
              >
                <img
                  src={c.image}
                  alt={c.alt}
                  loading="lazy"
                  width={720}
                  height={960}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-108"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/35 to-charcoal/5 transition-opacity duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[0.64rem] font-medium uppercase tracking-[0.26em] text-gold-bright">
                    {c.tagline}
                  </p>
                  <h3 className="mt-2 font-display text-[1.7rem] leading-tight text-ivory">{c.name}</h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ivory/80 transition-all duration-300 group-hover:gap-3.5 group-hover:text-gold-bright">
                    {c.cta}
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ Categories ============================ */

function CategoriesSection() {
  return (
    <section id="categories" className="scroll-mt-28 bg-cream py-20 lg:py-24" aria-labelledby="categories-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Browse the craft"
            title="Shop by Category"
            sub="Rings to coins — every category, every purity, every occasion."
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {featuredCategories.map((c, i) => (
            <Reveal key={c.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <a
                href={`/category/${c.slug}`}
                className="group flex h-full flex-col items-center rounded-xl border border-line bg-white px-4 py-8 text-center transition-all duration-400 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_24px_44px_-28px_rgb(166_130_60/0.55)]"
              >
                <span className="relative flex h-20 w-20 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border border-gold/30 transition-transform duration-500 group-hover:scale-110"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-2 rounded-full border border-gold/15"
                  />
                  <JewelIcon
                    kind={c.icon}
                    className="relative h-10 w-10 text-gold-deep transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                  />
                </span>
                <h3 className="mt-4 font-display text-xl text-ink transition-colors group-hover:text-gold-deep">
                  {c.name}
                </h3>
                <p className="mt-1 text-[0.78rem] text-muted">{c.tagline}</p>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <a href="/categories" className="btn btn-outline !px-8 !py-3.5 text-[0.7rem]">
            View All 15 Categories
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ Product rails ============================ */

function ProductRail({ id, eyebrow, title, sub, items, cta }: {
  id: string;
  eyebrow: string;
  title: string;
  sub: string;
  items: typeof newArrivals;
  cta: string;
}) {
  return (
    <section id={id} className="scroll-mt-28 py-20 lg:py-24" aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} sub={sub} />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <a href={id === "new-arrivals" ? "/new-arrivals" : "/best-sellers"} className="btn btn-outline !px-8 !py-3.5 text-[0.7rem]">
            {cta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ Featured products ============================ */

function FeaturedRail() {
  const items = getProducts().filter((p) => p.featured).slice(0, 4);
  if (!items.length) return null;
  return (
    <ProductRail
      id="featured"
      eyebrow="Handpicked for you"
      title="Featured Jewellery"
      sub="A considered edit of pieces selected for their timeless beauty and craft."
      items={items}
      cta="Explore the Catalogue"
    />
  );
}

/* ============================ Testimonials ============================ */

function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-28 bg-cream py-20 lg:py-24" aria-labelledby="testimonials-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Word of mouth"
            title="Loved by families, for generations"
            sub="Real moments from customers who trust us with their milestones."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.slice(0, 3).map((t, i) => (
            <Reveal key={t.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <figure className="card-luxe relative flex h-full flex-col rounded-xl p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[0_28px_50px_-30px_rgb(166_130_60/0.5)]">
                <QuoteIcon className="absolute right-6 top-6 h-8 w-8 text-gold/25" />
                <div className="flex gap-1 text-gold-deep" role="img" aria-label={`Rated ${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <StarIcon key={s} className={`h-4 w-4 ${s < t.rating ? "text-gold-deep" : "text-line"}`} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 font-display text-[1.15rem] leading-relaxed text-ink-soft">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <span className="block font-medium tracking-wide text-ink">{t.name}</span>
                  <span className="block text-[0.78rem] uppercase tracking-[0.16em] text-muted">{t.location}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ Visit us ============================ */

function VisitSection() {
  return (
    <section id="visit-us" className="scroll-mt-28 bg-ivory py-20 lg:py-24" aria-labelledby="visit-title">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            Our showroom
          </p>
          <h2 id="visit-title" className="mt-4 text-4xl leading-[1.08] sm:text-5xl">
            Visit Shri Madhav Jewellers
          </h2>
          <Ornament className="mt-5 h-3 w-28 text-gold-deep" />
          <p className="mt-5 max-w-md leading-relaxed text-muted">
            Walk into our showroom for a personal consultation — try the pieces, meet the craftsmen, and take
            home jewellery that&rsquo;s weighed, hallmarked and billed transparently in front of you.
          </p>

          <ul className="mt-8 space-y-4 text-[0.95rem]">
            <li className="flex gap-3.5">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <span className="text-ink-soft">
                {siteConfig.address.line1}, {siteConfig.address.line2},<br />
                {siteConfig.address.city}, {siteConfig.address.state} — {siteConfig.address.pincode}, {siteConfig.address.country}
              </span>
            </li>
            <li>
              <a href={`tel:${siteConfig.phone}`} className="flex gap-3.5 text-ink-soft transition-colors hover:text-gold-deep">
                <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="flex gap-3.5 text-ink-soft transition-colors hover:text-gold-deep">
                <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
                {siteConfig.email}
              </a>
            </li>
            <li className="flex gap-3.5">
              <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <span className="text-ink-soft">
                {siteConfig.hours.map((h) => (
                  <span key={h.days} className="block">
                    <span className="text-ink">{h.days}:</span> {h.hours}
                  </span>
                ))}
              </span>
            </li>
          </ul>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="https://maps.google.com/?q=Shri+Madhav+Jewellers"
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold"
            >
              Get Directions
            </a>
            <a href={`tel:${siteConfig.phone}`} className="btn btn-outline">
              Call the Showroom
            </a>
          </div>
        </Reveal>

        {/* Map placeholder */}
        <Reveal delay={1}>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-cream">
            <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage:
              "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
              backgroundSize: "44px 44px" }} />
            <div aria-hidden="true" className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold/15 blur-2xl" />
            <div className="relative flex aspect-[4/3] flex-col items-center justify-center p-8 text-center">
              <span className="relative flex h-20 w-20 items-center justify-center">
                <span aria-hidden="true" className="absolute inset-0 animate-soft-pulse rounded-full bg-gold/20" />
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-deep text-white shadow-[0_16px_30px_-10px_rgb(166_130_60/0.8)]">
                  <MapPinIcon className="h-6 w-6" />
                </span>
              </span>
              <p className="mt-5 font-display text-2xl text-ink">{siteConfig.name}</p>
              <p className="mt-1 max-w-xs text-sm text-muted">
                {siteConfig.address.line1}, {siteConfig.address.city}, {siteConfig.address.state}
              </p>
              <p className="mt-4 rounded-full border border-gold/40 px-4 py-1.5 text-[0.68rem] uppercase tracking-[0.2em] text-gold-deep">
                Interactive map coming soon
              </p>
            </div>
            {/* fake zoom controls */}
            <div aria-hidden="true" className="absolute bottom-4 right-4 flex flex-col gap-1.5 text-muted">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white/80 text-lg">+</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white/80 text-lg">−</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ Page ============================ */

function Home() {
  return (
    <>
      <Hero />
      <UspStrip />
      <RateBanner />
      <CollectionsSection />
      <CategoriesSection />
      <ProductRail
        id="new-arrivals"
        eyebrow="Just in"
        title="New Arrivals"
        sub="Fresh from the karigars — the latest designs in 22K, 18K and sterling silver."
        items={newArrivals}
        cta="Browse All New Arrivals"
      />
      <ProductRail
        id="best-sellers"
        eyebrow="Customer favourites"
        title="Best Sellers"
        sub="The pieces our customers return for — classics that never go out of style."
        items={bestSellers}
        cta="Shop Best Sellers"
      />
      <FeaturedRail />
      <TestimonialsSection />
      <VisitSection />
      <NewsletterSignup />
    </>
  );
}
