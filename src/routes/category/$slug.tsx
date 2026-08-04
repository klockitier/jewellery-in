import { createFileRoute } from "@tanstack/react-router";
import { CatalogueView } from "~/components/CatalogueView";
import { getCategory } from "~/lib/catalogue";
import { pageHead } from "~/lib/seo";
export const Route=createFileRoute("/category/$slug")({head:({params})=>{const c=getCategory(params.slug);return pageHead({title:`${c?.name??"Category"} — Shri Madhav Jewellers`,description:c?.tagline??"Explore our jewellery collection.",path:`/category/${params.slug}`})},component:()=> <Category/>});
function Category(){const {slug}=Route.useParams();const c=getCategory(slug);return c?<CatalogueView categorySlug={slug}/>:<main className="mx-auto max-w-3xl px-6 py-28 text-center"><p className="eyebrow">Collection not found</p><h1 className="mt-3 font-display text-5xl">This category is coming soon</h1><a className="btn btn-gold mt-8 inline-flex" href="/catalogue">Browse catalogue</a></main>}
