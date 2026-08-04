/**
 * Featured collections shown on the homepage. Each maps to an image under
 * /public/images and a set of product ids (filled in by the catalogue task).
 */

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  alt: string;
  cta: string;
  href: string;
  /** Optional list of product ids this collection features (catalogue task). */
  productIds?: string[];
}

export const collections: Collection[] = [
  {
    slug: "bridal",
    name: "The Bridal Edit",
    tagline: "For the day you remember forever",
    description:
      "Statement necklaces, jhumki and mangalsutra in 22K gold — hand-finished for the bride who wants tradition and luxury in one look.",
    image: "/images/collection-bridal.jpg",
    alt: "Elegant gold necklace from the bridal collection",
    cta: "Explore the Bridal Edit",
    href: "/collections/bridal",
  },
  {
    slug: "everyday",
    name: "Everyday Elegance",
    tagline: "Light, wearable, timeless",
    description:
      "Delicate chains, studs and pendants in 18K and 22K gold — designed to move from morning meetings to evening plans.",
    image: "/images/collection-everyday.jpg",
    alt: "Gold bracelet from the everyday elegance collection",
    cta: "Shop Everyday Pieces",
    href: "/collections/everyday",
  },
  {
    slug: "gifting",
    name: "Gifting & Coins",
    tagline: "Meaningful gifts in pure gold",
    description:
      "Gold coins, bars and gift-ready jewellery — the traditions of Akshaya Tritiya, Diwali and weddings, beautifully boxed.",
    image: "/images/collection-gifting.jpg",
    alt: "Fine gold coins and bullion for gifting",
    cta: "Browse Gifting",
    href: "/collections/gifting",
  },
  {
    slug: "heritage",
    name: "Heritage & Temple",
    tagline: "Craft carried across generations",
    description:
      "Temple jewellery, antique finishes and devotional pieces inspired by the artistry of Indian goldsmiths.",
    image: "/images/hero-gold.jpg",
    alt: "Handcrafted heritage gold jewellery",
    cta: "Discover Heritage",
    href: "/collections/heritage",
  },
];
