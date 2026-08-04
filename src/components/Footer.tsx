/**
 * Site footer: business info, category links, policy placeholders, hours,
 * contact and socials — all read from config.
 */

import { categories } from "~/config/categories";
import { siteConfig } from "~/config/site";
import {
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "./icons";
import { Logo } from "./Logo";

const POLICIES = [
  { label: "Shipping & Delivery", href: "#" },
  { label: "Returns & Exchange", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/75" id="contact">
      <div className="hairline !bg-[linear-gradient(90deg,transparent,#c6a45c,transparent)]" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1.15fr]">
          {/* Brand */}
          <div>
            <Logo dark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/60">
              {siteConfig.tagline}. Trusted craftsmanship, certified purity and transparent pricing — since 1987.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: FacebookIcon, label: "Facebook" },
                { Icon: YoutubeIcon, label: "YouTube" },
                { Icon: WhatsAppIcon, label: "WhatsApp" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href={siteConfig.socials[label.toLowerCase() as keyof typeof siteConfig.socials] ?? "#"}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-white"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <nav aria-label="Categories">
            <h3 className="text-[0.72rem] font-medium uppercase tracking-[0.3em] text-gold-bright">Categories</h3>
            <ul className="mt-5 grid grid-cols-1 gap-2.5 text-sm">
              {categories.slice(0, 8).map((c) => (
                <li key={c.slug}>
                  <a href="#categories" className="text-ivory/65 transition-colors hover:text-gold-bright">
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Policies */}
          <nav aria-label="Customer care">
            <h3 className="text-[0.72rem] font-medium uppercase tracking-[0.3em] text-gold-bright">Customer Care</h3>
            <ul className="mt-5 grid grid-cols-1 gap-2.5 text-sm">
              {POLICIES.map((p) => (
                <li key={p.label}>
                  <a href={p.href} className="text-ivory/65 transition-colors hover:text-gold-bright">
                    {p.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#new-arrivals" className="text-ivory/65 transition-colors hover:text-gold-bright">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#best-sellers" className="text-ivory/65 transition-colors hover:text-gold-bright">
                  Best Sellers
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-[0.72rem] font-medium uppercase tracking-[0.3em] text-gold-bright">Visit Us</h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" />
                <span className="text-ivory/65">
                  {siteConfig.address.line1},<br />
                  {siteConfig.address.line2},<br />
                  {siteConfig.address.city}, {siteConfig.address.state} — {siteConfig.address.pincode}
                </span>
              </li>
              <li>
                <a href={`tel:${siteConfig.phone}`} className="flex gap-3 text-ivory/65 transition-colors hover:text-gold-bright">
                  <PhoneIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" />
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex gap-3 text-ivory/65 transition-colors hover:text-gold-bright">
                  <MailIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex gap-3">
                <ClockIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" />
                <span className="text-ivory/65">
                  {siteConfig.hours.map((h) => (
                    <span key={h.days} className="block">
                      <span className="text-ivory/85">{h.days}:</span> {h.hours}
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-ivory/10 pt-6 text-[0.78rem] text-ivory/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="tracking-wide">
            Prices shown include live metal rates + making charges + GST.
          </p>
          <p>Photography via Unsplash · Placeholder content</p>
        </div>
      </div>
    </footer>
  );
}
