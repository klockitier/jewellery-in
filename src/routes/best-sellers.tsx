import { createFileRoute } from "@tanstack/react-router";
import { bestSellers } from "~/config/products";
import { ProductCard } from "~/components/ProductCard";
import { pageHead } from "~/lib/seo";
export const Route = createFileRoute("/best-sellers")({ head: () => pageHead({ title: "Best Sellers — Shri Madhav Jewellers", path: "/best-sellers" }), component: BestSellers });
function BestSellers() { return <main className="bg-cream"><section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"><p className="eyebrow">Customer favourites</p><h1 className="mt-4 text-5xl">Best Sellers</h1><p className="mt-4 text-muted">The pieces families return for, chosen for their timeless beauty.</p><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}</div></section></main>; }
