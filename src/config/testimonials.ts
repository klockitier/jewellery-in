/**
 * Customer testimonials.
 *
 * IMPORTANT: these are PLACEHOLDER quotes written for design purposes.
 * Replace with real, verified customer reviews (owner-provided) before launch —
 * never show fabricated testimonials on a live site.
 */

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  rating: number; // 1..5
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "The purity is certified, the rates are transparent, and the craftsmanship is beautiful. My bridal set felt like it was made just for me.",
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "I've bought from Yogesh for every festival for years. Fair pricing on gold and the family always treats you like their own.",
    name: "Rajesh Agarwal",
    location: "Delhi",
    rating: 5,
  },
  {
    id: "t3",
    quote:
      "Ordered a mangalsutra online — the making charge was displayed openly and the delivery was flawless. Trustworthy, end to end.",
    name: "Ananya Iyer",
    location: "Bengaluru",
    rating: 5,
  },
  {
    id: "t4",
    quote:
      "Their silver collection is stunning and the exchange policy made my anniversary gift effortless. Highly recommended.",
    name: "Vikram Malhotra",
    location: "Pune",
    rating: 4,
  },
];
