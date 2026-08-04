import { products as seedProducts, type Product } from "~/lib/catalogue";
import { collections as seedCollections, type Collection } from "~/lib/catalogue";
import { categories as seedCategories, type Category } from "~/lib/catalogue";
export type Catalogue = { products: Product[]; collections: Collection[]; categories: Category[] };
const current = (): Catalogue => {
  if (typeof window !== "undefined") return (window as any).__CATALOGUE__ || { products: seedProducts, collections: seedCollections, categories: seedCategories };
  return (globalThis as any).__CATALOGUE_SERVER__ || { products: seedProducts, collections: seedCollections, categories: seedCategories };
};
export const getCatalogue = () => current();
export const getProducts = () => current().products;
export const getCollections = () => current().collections;
export const getCategories = () => current().categories;
// Compatibility exports: dynamic proxies ensure existing consumers see request data without client fs imports.
export const products = new Proxy(seedProducts, { get: (_, p) => (current().products as any)[p as any] }) as Product[];
export const collections = new Proxy(seedCollections, { get: (_, p) => (current().collections as any)[p as any] }) as Collection[];
export const categories = new Proxy(seedCategories, { get: (_, p) => (current().categories as any)[p as any] }) as Category[];
export const getProduct = (idOrSlug: string) => getProducts().find(p => p.id === idOrSlug || p.slug === idOrSlug);
export const getCategory = (slug: string) => getCategories().find(c => c.slug === slug);
export const featuredCategories = new Proxy([] as Category[], { get: (_, p) => getCategories().filter(c => c.featured)[p as any] }) as Category[];
export const newArrivals = new Proxy([] as Product[], { get: (_, p) => getProducts().filter(x => x.isNew).slice(0,8)[p as any] }) as Product[];
export const bestSellers = new Proxy([] as Product[], { get: (_, p) => getProducts().filter(x => x.isBestSeller).slice(0,8)[p as any] }) as Product[];
