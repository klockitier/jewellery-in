import type { Metal, Purity } from "./pricing";

export type ProductBadge = "new" | "bestseller" | "offer";
export type StoneDetails = { type: string; carat?: number; count?: number; clarity?: string };
export interface Product {
  id: string; slug: string; name: string; category: string; metal: Metal; purity: Purity;
  featured?: boolean;
  weightGrams: number; makingCharge: number; stones?: StoneDetails; gender: "women" | "men" | "unisex";
  occasion: "bridal" | "everyday" | "festive" | "office" | "gifting"; tags: string[];
  isNew: boolean; isBestSeller: boolean; offer?: string; offerPercent?: number; inStock: boolean;
  /** Optional scarcity hint — shows "Only a few left" on the product page. */
  lowStock?: boolean;
  images: string[]; image?: string; shortDescription: string; description: string; careInstructions?: string; badge?: ProductBadge;
}

type Seed = [string, string, Metal, Purity, number, number, "women"|"men"|"unisex", Product["occasion"], string[], boolean?, boolean?, number?];
const seed: Seed[] = [
  ["rings","Kamal Petal Gold Ring","gold","22k",3.2,1450,"women","everyday",["floral","daily"],false,true], ["rings","Aranya Diamond Ring","gold","18k",2.8,1800,"women","office",["diamond","minimal"],true], ["rings","Vedant Signet Ring","gold","22k",5.6,2100,"men","festive",["signet","classic"]], ["rings","Mangalya Band Ring","gold","22k",4.4,1650,"unisex","gifting",["band","traditional"],false,false,5],
  ["chains","Nitya Box Chain","gold","22k",8.5,2800,"women","everyday",["chain","lightweight"],true], ["chains","Rudra Rope Chain","gold","22k",14.2,3600,"men","festive",["rope","bold"],false,true], ["chains","Saanvi Bead Chain","gold","18k",6.4,2400,"women","office",["bead","delicate"]], ["chains","Rajveer Curb Chain","silver","925",18,850,"men","everyday",["curb","silver"],false,false,10],
  ["necklaces","Meenakshi Temple Necklace","gold","22k",28.5,9200,"women","bridal",["temple","bridal"],false,true], ["necklaces","Gulab Haar Necklace","gold","22k",16.8,5800,"women","festive",["floral","festive"],true], ["necklaces","Ahalya Layered Necklace","gold","18k",12.2,4300,"women","office",["layered","modern"]], ["necklaces","Sudarshan Necklace","silver","925",22,1100,"unisex","gifting",["silver","statement"],false,false,8],
  ["mangalsutra","Saubhagya Bead Mangalsutra","gold","22k",7.2,2700,"women","everyday",["black beads","daily"],true,true], ["mangalsutra","Vatsala Pendant Mangalsutra","gold","22k",10.5,3400,"women","festive",["pendant","traditional"]], ["mangalsutra","Aarohi Lite Mangalsutra","gold","18k",5.2,1900,"women","office",["lightweight","daily"],false,false,5], ["mangalsutra","Moksha Two-tone Mangalsutra","gold","22k",8.8,3100,"women","gifting",["two-tone","modern"]],
  ["earrings","Kundan Drop Earrings","gold","22k",6.2,2500,"women","bridal",["kundan","drop"],false,true], ["earrings","Aaradhya Gold Studs","gold","18k",2.1,950,"women","office",["studs","daily"],true], ["earrings","Mogra Flower Earrings","gold","22k",4.8,1800,"women","festive",["floral","lightweight"]], ["earrings","Chandrika Silver Drops","silver","925",7.5,520,"women","everyday",["drop","silver"],false,false,10],
  ["jhumki","Antique Meenakari Jhumki","gold","22k",5.1,2300,"women","bridal",["meenakari","temple"],false,true], ["jhumki","Lakshmi Bell Jhumki","gold","22k",7.4,2900,"women","festive",["lakshmi","bell"],true], ["jhumki","Tara Pearl Jhumki","gold","18k",3.7,1600,"women","gifting",["pearl","classic"]], ["jhumki","Rajasi Silver Jhumki","silver","925",9.2,640,"women","everyday",["silver","bell"],false,false,8],
  ["bali","Kaveri Classic Bali","gold","22k",3.6,1350,"women","everyday",["hoop","classic"],false,true], ["bali","Pearl Bali Hoops","gold","18k",2.4,1100,"women","office",["pearl","hoop"],true], ["bali","Aditiya Bold Bali","gold","22k",6.8,2200,"men","festive",["hoop","bold"]], ["bali","Silver Twist Bali","silver","925",4.8,360,"unisex","gifting",["twist","silver"],false,false,10],
  ["bangles","Gauri Polki Bangle","gold","22k",12.6,4500,"women","bridal",["polki","bridal"],false,true], ["bangles","Suhana Daily Bangle","gold","22k",8.8,2900,"women","everyday",["daily","lightweight"],true], ["bangles","Kalyan Engraved Bangle","gold","22k",15.4,5100,"men","festive",["engraved","classic"]], ["bangles","Rajhans Silver Bangle","silver","925",11.5,720,"unisex","gifting",["silver","engraved"]],
  ["bracelets","Aarav Link Bracelet","gold","18k",8.2,2800,"men","office",["link","modern"],true], ["bracelets","Sia Beaded Bracelet","gold","22k",5.5,1900,"women","everyday",["beaded","daily"]], ["bracelets","Navya Charm Bracelet","gold","18k",4.1,1550,"women","gifting",["charm","gift"]], ["bracelets","Sterling Curb Bracelet","silver","925",14.5,620,"men","everyday",["curb","silver"],false,false,10],
  ["kada","Temple Gold Kada","gold","22k",18.6,3400,"men","festive",["temple","solid"],false,true], ["kada","Veer Engraved Kada","gold","22k",22.2,4200,"men","gifting",["engraved","bold"]], ["kada","Ananta Open Kada","gold","18k",11.8,3000,"unisex","office",["open","modern"],true], ["kada","Silver Heritage Kada","silver","925",24,980,"men","everyday",["silver","heritage"]],
  ["payal","Rupali Ghungroo Payal","silver","925",24,900,"women","festive",["ghungroo","bell"],true,true], ["payal","Mogra Floral Payal","silver","925",31,1050,"women","bridal",["floral","bridal"]], ["payal","Komal Everyday Payal","silver","925",18,720,"women","everyday",["daily","lightweight"]], ["payal","Rajwadi Broad Payal","silver","925",42,1350,"women","festive",["broad","traditional"],false,false,8],
  ["pendants","Om Shakti Pendant","gold","22k",2.2,980,"unisex","everyday",["om","spiritual"],false,true], ["pendants","Ganesha Blessing Pendant","gold","22k",3.8,1250,"unisex","gifting",["ganesha","gift"],true], ["pendants","Aarya Heart Pendant","gold","18k",2.4,1050,"women","office",["heart","minimal"]], ["pendants","Silver Lotus Pendant","silver","925",5.2,380,"women","everyday",["lotus","silver"],false,false,10],
  ["nose-pins","Nose Pin Trio","gold","18k",0.9,550,"women","everyday",["stud","daily"],true], ["nose-pins","Moti Pearl Nose Pin","gold","22k",0.5,420,"women","festive",["pearl","delicate"]], ["nose-pins","Chandni Floral Nose Pin","gold","18k",0.7,480,"women","office",["floral","minimal"]], ["nose-pins","Silver Star Nose Pin","silver","925",0.4,120,"women","gifting",["star","silver"]],
  ["silver","Silver Lakshmi Pendant Set","silver","925",16,850,"unisex","gifting",["lakshmi","gift"],true,true], ["silver","Chandi Filigree Earrings","silver","925",8.4,520,"women","festive",["filigree","drop"]], ["silver","Triveni Silver Chain","silver","925",20,760,"unisex","everyday",["chain","silver"]], ["silver","Kundan Silver Ring","silver","925",4.8,390,"women","office",["kundan","silver"],false,false,10],
  ["coins","24K Lakshmi Gold Coin — 2g","gold","24k",2,180,"unisex","gifting",["coin","lakshmi","24k"],true,true], ["coins","24K Gold Coin — 5g","gold","24k",5,240,"unisex","gifting",["coin","24k"]], ["coins","24K Gold Coin — 10g","gold","24k",10,350,"unisex","gifting",["coin","investment"],false,true], ["coins","Silver Shubh Coin — 20g","silver","925",20,180,"unisex","gifting",["coin","silver"],true], ["coins","Silver Ganesh Coin — 50g","silver","925",50,280,"unisex","gifting",["coin","ganesh","silver"],false,false,5], ["coins","Silver Lakshmi Coin — 100g","silver","925",100,420,"unisex","gifting",["coin","lakshmi","silver"]],
];
/**
 * Product photography (gallery) — content-verified CC0/public-domain photos
 * downloaded locally into /images/products (see premium-site-assets-no-vision
 * skill). Every URL here was curl-verified 200 and exists as a local file, so
 * nothing depends on a third-party host at runtime. Products without an entry
 * keep the hand-drawn line-art fallback (unbreakable).
 *
 * NOTE: these are verified CATEGORY stand-ins (e.g. "gold necklace" photos on
 * necklace products) — the owner should replace them with real product
 * photography before launch. TODO(owner): real product photos.
 */
const IMG = (n: string) => `/images/products/${n}`;

const GALLERY: Record<string, string[]> = {
  // rings
  "kamal-petal-gold-ring": [IMG("ring-gold-2.jpg"), IMG("ring-gold-1.jpg")],
  "aranya-diamond-ring": [IMG("ring-gold-1.jpg"), IMG("ring-gold-3.jpg")],
  "mangalya-band-ring": [IMG("ring-gold-3.jpg")],
  // chains
  "nitya-box-chain": [IMG("chain-gold-1.jpg"), IMG("necklace-gold-3.jpg")],
  "rudra-rope-chain": [IMG("chain-gold-1.jpg"), IMG("necklace-gold-1.jpg")],
  "rajveer-curb-chain": [IMG("chain-gold-1.jpg")],
  // necklaces
  "meenakshi-temple-necklace": [IMG("bridal-set-1.jpg"), IMG("necklace-gold-1.jpg")],
  "gulab-haar-necklace": [IMG("necklace-gold-2.jpg"), IMG("necklace-gold-3.jpg")],
  "sudarshan-necklace": [IMG("necklace-silver-3.webp"), IMG("necklace-silver-2.webp")],
  // mangalsutra
  "saubhagya-bead-mangalsutra": [IMG("necklace-gold-3.jpg"), IMG("necklace-gold-1.jpg")],
  "vatsala-pendant-mangalsutra": [IMG("pendant-gold-1.jpg"), IMG("necklace-gold-2.jpg")],
  "aarohi-lite-mangalsutra": [IMG("pendant-gold-3.jpg"), IMG("chain-gold-1.jpg")],
  // earrings
  "kundan-drop-earrings": [IMG("earrings-gold-1.jpg"), IMG("earrings-gold-2.jpg")],
  "aaradhya-gold-studs": [IMG("jhumka-1.webp"), IMG("earrings-gold-2.jpg")],
  // jhumki
  "antique-meenakari-jhumki": [IMG("jhumka-1.webp"), IMG("jhumka-2.jpg")],
  "lakshmi-bell-jhumki": [IMG("jhumka-2.jpg"), IMG("jhumka-1.webp")],
  "tara-pearl-jhumki": [IMG("earrings-gold-2.jpg")],
  // bali
  "kaveri-classic-bali": [IMG("earrings-gold-1.jpg"), IMG("earrings-gold-2.jpg")],
  "pearl-bali-hoops": [IMG("earrings-gold-2.jpg"), IMG("earrings-gold-1.jpg")],
  // bangles
  "gauri-polki-bangle": [IMG("bangle-gold-1.webp"), IMG("bangle-gold-2.webp")],
  "suhana-daily-bangle": [IMG("bangle-gold-4.webp"), IMG("bangle-gold-3.webp")],
  "rajhans-silver-bangle": [IMG("bangle-silver-1.jpg"), IMG("bangle-silver-2.jpg")],
  // bracelets
  "aarav-link-bracelet": [IMG("bangle-gold-3.webp"), IMG("bangle-gold-1.webp")],
  "sterling-curb-bracelet": [IMG("bangle-silver-2.jpg"), IMG("bangle-silver-1.jpg")],
  // kada
  "temple-gold-kada": [IMG("bangle-gold-5.jpg"), IMG("bangle-gold-1.webp")],
  "ananta-open-kada": [IMG("bangle-gold-2.webp"), IMG("bangle-gold-3.webp")],
  "silver-heritage-kada": [IMG("bangle-silver-1.jpg"), IMG("bangle-silver-2.jpg")],
  // payal (silver circle-jewellery stand-in until real payal photos)
  "rupali-ghungroo-payal": [IMG("bangle-silver-1.jpg"), IMG("bangle-silver-2.jpg")],
  "mogra-floral-payal": [IMG("bangle-silver-2.jpg")],
  // pendants
  "om-shakti-pendant": [IMG("pendant-gold-2.jpg"), IMG("pendant-gold-1.jpg")],
  "ganesha-blessing-pendant": [IMG("pendant-gold-1.jpg"), IMG("pendant-gold-3.jpg")],
  "aarya-heart-pendant": [IMG("pendant-gold-3.jpg")],
  // silver
  "silver-lakshmi-pendant-set": [IMG("necklace-silver-3.webp"), IMG("necklace-silver-2.webp")],
  "triveni-silver-chain": [IMG("chain-gold-1.jpg"), IMG("necklace-silver-2.webp")],
  // coins
  "24k-lakshmi-gold-coin-2g": [IMG("coin-gold-3.jpg"), IMG("coin-gold-4.jpg")],
  "24k-gold-coin-5g": [IMG("coin-gold-5.jpg"), IMG("coin-gold-6.jpg")],
  "24k-gold-coin-10g": [IMG("coin-gold-4.jpg"), IMG("coin-gold-3.jpg")],
  "silver-shubh-coin-20g": [IMG("coin-silver-1.jpg"), IMG("coin-silver-2.jpg")],
  "silver-ganesh-coin-50g": [IMG("coin-silver-3.jpg"), IMG("coin-silver-4.jpg")],
  "silver-lakshmi-coin-100g": [IMG("coin-silver-2.jpg"), IMG("coin-silver-3.jpg")],
};

export const products: Product[] = seed.map((s, i) => { const [category,name,metal,purity,weight,making,gender,occasion,tags,isNew=false,isBestSeller=false,offerPercent] = s; const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); const images = GALLERY[slug] ?? []; return { id:`p${String(i+1).padStart(3,"0")}`, slug, name, category, metal, purity, weightGrams:weight, makingCharge:making, gender, occasion, tags, isNew, isBestSeller, offerPercent, offer: offerPercent ? `${offerPercent}% off` : undefined, inStock: i % 17 !== 0, lowStock: i % 23 === 0 && i % 17 !== 0, images, image: images[0], shortDescription:`A thoughtfully crafted ${name.toLowerCase()} for your most meaningful moments.`, description:`Hand-finished by our karigars in a timeless Shri Madhav design.`, careInstructions:"Store separately in the supplied box and clean gently with a soft cloth.", badge:isNew ? "new" : isBestSeller ? "bestseller" : offerPercent ? "offer" : undefined }; });
export function getProduct(idOrSlug: string) { return products.find(p => p.id === idOrSlug || p.slug === idOrSlug); }
export const newArrivals = products.filter(p=>p.isNew).slice(0,8);
export const bestSellers = products.filter(p=>p.isBestSeller).slice(0,8);
