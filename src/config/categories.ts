/**
 * Product categories — config driven so new categories are trivial to add.
 * `icon` maps to a line-art illustration in components/JewelIcon.tsx.
 * Extend freely: { slug, name, tagline, icon, featured? }
 */

export type CategoryIconKey =
  | "rings"
  | "chains"
  | "necklaces"
  | "mangalsutra"
  | "earrings"
  | "jhumki"
  | "bali"
  | "bangles"
  | "bracelets"
  | "kada"
  | "payal"
  | "pendants"
  | "nose-pins"
  | "silver"
  | "coins";

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  icon: CategoryIconKey;
  /** Shown in the homepage "popular categories" grid. */
  featured?: boolean;
}

export const categories: Category[] = [
  { slug: "rings", name: "Rings", tagline: "Solitaire to stackable", icon: "rings", featured: true },
  { slug: "chains", name: "Chains", tagline: "Classic & rope chains", icon: "chains", featured: true },
  { slug: "necklaces", name: "Necklaces", tagline: "Statement & everyday", icon: "necklaces", featured: true },
  { slug: "mangalsutra", name: "Mangalsutra", tagline: "The sacred thread", icon: "mangalsutra", featured: true },
  { slug: "earrings", name: "Earrings", tagline: "Studs, drops & more", icon: "earrings", featured: true },
  { slug: "jhumki", name: "Jhumki", tagline: "Heirloom chandeliers", icon: "jhumki", featured: true },
  { slug: "bali", name: "Bali", tagline: "Classic hoops", icon: "bali", featured: true },
  { slug: "bangles", name: "Bangles", tagline: "A wrist of tradition", icon: "bangles", featured: true },
  { slug: "bracelets", name: "Bracelets", tagline: "Modern & minimal", icon: "bracelets" },
  { slug: "kada", name: "Kada", tagline: "Bold solid cuffs", icon: "kada" },
  { slug: "payal", name: "Payal", tagline: "The gentle jingle", icon: "payal" },
  { slug: "pendants", name: "Pendants", tagline: "Daily grace", icon: "pendants" },
  { slug: "nose-pins", name: "Nose Pins", tagline: "Delicate accents", icon: "nose-pins" },
  { slug: "silver", name: "Silver Jewellery", tagline: "Sterling 925 everyday", icon: "silver" },
  { slug: "coins", name: "Coins & Bullion", tagline: "Wealth you can wear", icon: "coins" },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export const featuredCategories = categories.filter((c) => c.featured);
