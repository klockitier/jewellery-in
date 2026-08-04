/**
 * Business configuration for Shri Madhav Jewellers.
 *
 * NOTE: Several fields below are PLACEHOLDERS (address line, phone, email,
 * social handles) — the owner should supply the real values before launch.
 * They live here so every page (header, footer, contact sections) reads from
 * one place.
 */

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface BusinessHours {
  days: string;
  hours: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  estd: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    /** Placeholder map coordinates (lat, lng) for the embedded map later. */
    coords?: { lat: number; lng: number };
  };
  phone: string;
  phoneDisplay: string;
  email: string;
  hours: BusinessHours[];
  socials: SocialLinks;
  /**
   * Shipping & fulfilment — shown on product pages and used by the cart later.
   * TODO(owner): confirm real dispatch time, shipping charge and return window.
   */
  shipping: {
    dispatchTime: string; // e.g. "Within 24 hours"
    deliveryEstimate: string; // e.g. "3–5 business days"
    deliveryEstimateMetro: string;
    charge: string; // "Free" or an amount — FREE_SHIPPING_THRESHOLD below
    freeShippingThreshold: number; // ₹ — free shipping on orders above this
    returnsWindow: string; // e.g. "7 days"
    insured: boolean;
  };
  /** Products are priced in INR. */
  currency: "INR";
}

export const siteConfig: SiteConfig = {
  name: "Shri Madhav Jewellers",
  shortName: "Shri Madhav",
  tagline: "Fine gold & silver jewellery, crafted with devotion",
  description:
    "Shri Madhav Jewellers is a premium Indian jewellery showroom offering handcrafted gold and silver jewellery — rings, chains, necklaces, mangalsutra, earrings, bangles and more — at transparent, live metal rates.",
  estd: "Since 1987",
  address: {
    line1: "12, Main Market Road", // TODO(owner): confirm real showroom address
    line2: "Opp. City Bank",
    city: "Your City",
    state: "Your State",
    pincode: "400001",
    country: "India",
    coords: { lat: 19.076, lng: 72.8777 },
  },
  phone: "+919800000000", // TODO(owner): real phone
  phoneDisplay: "+91 98000 00000",
  email: "hello@shrimadhavjewellers.in", // TODO(owner): real email
  hours: [
    { days: "Monday – Saturday", hours: "10:30 AM – 8:30 PM" },
    { days: "Sunday", hours: "11:00 AM – 6:00 PM" },
    { days: "Public Holidays", hours: "Open — call ahead" },
  ],
  socials: {
    instagram: "#",
    facebook: "#",
    youtube: "#",
    whatsapp: "#",
  },
  shipping: {
    dispatchTime: "Within 24 hours",
    deliveryEstimate: "3–5 business days", // TODO(owner): confirm courier timelines
    deliveryEstimateMetro: "2–3 business days", // metros
    charge: "Free insured shipping", // TODO(owner): confirm
    freeShippingThreshold: 10000, // ₹ — free shipping above this cart value
    returnsWindow: "7 days", // TODO(owner): confirm exchange/return window
    insured: true,
  },
  currency: "INR",
};
