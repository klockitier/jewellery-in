import type { CartItem } from "./cart";
import type { PaymentMethod } from "./payment";
export interface Order { id: string; createdAt: string; items: CartItem[]; amounts: { metal: number; making: number; gst: number; offers: number; coupon: number; shipping: number; subtotal: number; total: number }; couponCode?: string; customer: { name: string; phone: string; email: string; address: string; city: string; state: string; pin: string; instructions?: string; billingSame: boolean }; payment: { method: PaymentMethod; status: "pending" | "confirmed" }; status: "awaiting-payment" | "payment-confirmed" | "packed" | "shipped" | "delivered"; }
const KEY="smj.orders.v1";
function read(): Order[] { if(typeof window === "undefined") return []; try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []} }
export const ordersStore={ list:()=>read(), get:(id:string)=>read().find(o=>o.id===id), save:(o:Order)=>{const all=read(); localStorage.setItem(KEY,JSON.stringify([o,...all])); return o;} };
export function newOrderId(){return `SMJ-${Math.random().toString(36).slice(2,10).toUpperCase()}`}
