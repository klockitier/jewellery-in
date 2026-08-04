import { createFileRoute } from "@tanstack/react-router";
import { CatalogueView } from "~/components/CatalogueView";
import { pageHead } from "~/lib/seo";
export const Route=createFileRoute("/search")({head:()=>pageHead({title:"Search Jewellery — Shri Madhav Jewellers",description:"Search our collection of handcrafted gold and silver jewellery.",path:"/search"}),component:()=> <CatalogueView searchMode/>});
