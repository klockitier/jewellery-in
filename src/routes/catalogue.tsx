import { createFileRoute } from "@tanstack/react-router";
import { CatalogueView } from "~/components/CatalogueView";
import { pageHead } from "~/lib/seo";
export const Route=createFileRoute("/catalogue")({head:()=>pageHead({title:"Jewellery Catalogue — Yogesh Jewellers",description:"Browse gold and silver jewellery by category, purity, occasion and price.",path:"/catalogue"}),component:()=> <CatalogueView/>});
