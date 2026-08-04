// Production server for the built site. The TanStack Start build emits a portable
// fetch handler (dist/server/server.js) plus static client assets (dist/client);
// this wraps them in a Bun server on port 3000 — static files first, SSR for the
// rest. Run `bun run build` before starting. Restart it with `bun run publish`.
//
// Starting a new instance supersedes the old one: it frees the port no matter
// which user owns the current server (provisioning starts it as `engine`; a team
// member's `bun run publish` runs as their own user), so publish never collides
// with an already-running server. Every sandbox user has passwordless sudo, so
// the takeover works across user boundaries.
import handler from "./dist/server/server.js";
import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { products as seedProducts } from "./src/config/products";
import { collections as seedCollections } from "./src/config/collections";
import { categories as seedCategories } from "./src/config/categories";

// Pinned, NOT read from the environment. The published preview URL
// (<label>.<PUBLIC_SITE_DOMAIN>) is reverse-proxied to 0.0.0.0:3000 inside the
// sandbox, so the default site MUST bind there. Bun auto-loads .env files, so
// honouring process.env.PORT/HOST would let a stray env var or a .env in the site
// dir silently move the site off :3000 (or onto loopback) and break the public URL.
const PORT = 3000;
const HOST = "0.0.0.0";
const CLIENT_DIR = `${import.meta.dir}/dist/client`;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const cashfreeBase = () => process.env.CASHFREE_MODE === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${cashfreeBase()}${path}`, { ...init, headers: { "content-type": "application/json", "x-client-id": process.env.CASHFREE_CLIENT_ID ?? "", "x-client-secret": process.env.CASHFREE_CLIENT_SECRET ?? "", "x-api-version": "2022-09-01", ...(init.headers ?? {}) } });
}
/** Public origin for external callbacks (Cashfree return_url). Priority:
 *  PUBLIC_SITE_URL env (set when a custom domain is added) → the known
 *  published site URL. Deliberately NOT derived from req.url or forwarded
 *  headers: this platform proxies to the server with an internal hostname
 *  (…preview.bl.run) that customers' browsers cannot use — the original
 *  redirect bug was exactly that. */
const DEFAULT_PUBLIC_ORIGIN = "https://092f4fe8c2c6de6062d71800ad81fc1f.ctonew.app";
function publicOrigin(): string {
  return process.env.PUBLIC_SITE_URL ?? DEFAULT_PUBLIC_ORIGIN;
}
// ── Rates providers ──────────────────────────────────────────────────────────
// GET /api/rates serves one of three providers, selected by RATES_PROVIDER.
// "india" is the DEFAULT — Indian-market rates (₹/gram) parsed defensively from
// goodreturns.in via the free r.jina.ai reader proxy, with the keyless "free"
// international-spot provider as automatic fallback. "free" (gold-api.com XAU/XAG
// + open.er-api.com USD→INR, keyless) and "perplexity" (needs PERPLEXITY_API_KEY)
// remain available as explicit overrides.
// All providers return the same RateQuote shape ({ gold24k, gold22k, gold18k,
// silver, lastUpdated, source, currency: "INR", unit: "per-gram" }) and all fail
// gracefully: any error returns { ok:false } and the client falls back to the
// stored CONFIG_RATES (src/config/rates.ts). Never throw.

// ── Provider "free": keyless international spot rates (fallback for "india") ─
// gold-api.com (XAU/XAG, USD per troy ounce, keyless) + open.er-api.com
// (USD→INR, keyless) → converted to INR per gram.
const TROY_OZ_PER_GRAM = 31.1034768;
const FREE_CACHE_MS = 10 * 60 * 1000; // serve in-memory cache for 10 min
const GOLD_BAND: [number, number] = [3000, 20000]; // plausible ₹/g for 24K
const SILVER_BAND: [number, number] = [20, 500]; // plausible ₹/g for silver
let freeCache: { quote: Record<string, unknown>; at: number } | null = null;
let freeInFlight: Promise<Response> | null = null; // single-flight on cache miss
// Webhook-confirmed orders are retained for the lifetime of this server. The
// browser remains the source of the guest order record (smj.orders.v1).
const webhookPaidOrders = new Set<string>();

async function validCashfreeWebhook(req: Request, raw: string): Promise<boolean> {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  // Cashfree signs v3 webhooks as base64(HMAC-SHA256(timestamp + raw body));
  // if no secret has been supplied, accept the payload but never trust fields
  // beyond the documented order id/status/amount shape.
  if (!secret) return true;
  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");
  if (!signature || !timestamp) return false;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + raw));
    const expected = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return expected === signature;
  } catch { return false; }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

async function freeRates(): Promise<Response> {
  // Fresh cache → serve it; every client request otherwise hammers the free APIs.
  if (freeCache && Date.now() - freeCache.at < FREE_CACHE_MS) {
    return json({ ok: true, quote: freeCache.quote });
  }
  // Concurrent cache misses share one upstream fetch.
  if (freeInFlight) return freeInFlight;
  freeInFlight = (async () => {
    try {
      const [goldRes, silverRes, fxRes] = await Promise.all([
        fetch("https://api.gold-api.com/price/XAU", { signal: AbortSignal.timeout(8000) }),
        fetch("https://api.gold-api.com/price/XAG", { signal: AbortSignal.timeout(8000) }),
        fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(8000) }),
      ]);
      if (!goldRes.ok || !silverRes.ok || !fxRes.ok) return json({ ok: false, error: "provider-unavailable" });
      const gold = await goldRes.json() as any;
      const silver = await silverRes.json() as any;
      const fx = await fxRes.json() as any;
      const usdInr = Number(fx?.rates?.INR);
      const xauUsdOz = Number(gold?.price);
      const xagUsdOz = Number(silver?.price);
      if (![usdInr, xauUsdOz, xagUsdOz].every((n) => Number.isFinite(n) && n > 0)) {
        return json({ ok: false, error: "invalid-provider-response" });
      }
      const gold24k = round2((xauUsdOz / TROY_OZ_PER_GRAM) * usdInr);
      const gold22k = round2(gold24k * 0.916);
      const gold18k = round2(gold24k * 0.75);
      const silverInr = round2((xagUsdOz / TROY_OZ_PER_GRAM) * usdInr);
      // Sanity band — reject implausible values so a broken feed can't poison
      // the site; the client falls back to stored CONFIG_RATES.
      if (gold24k < GOLD_BAND[0] || gold24k > GOLD_BAND[1] || silverInr < SILVER_BAND[0] || silverInr > SILVER_BAND[1]) {
        return json({ ok: false, error: "out-of-range" });
      }
      const parsed = new Date(gold?.updatedAt).getTime();
      const lastUpdated = Number.isFinite(parsed) ? String(gold.updatedAt) : new Date().toISOString();
      const quote = {
        gold24k, gold22k, gold18k, silver: silverInr,
        lastUpdated, source: "api", currency: "INR", unit: "per-gram",
      };
      freeCache = { quote, at: Date.now() };
      return json({ ok: true, quote });
    } catch {
      return json({ ok: false, error: "provider-unavailable" });
    } finally {
      freeInFlight = null;
    }
  })();
  return freeInFlight;
}

// ── Provider "india" (DEFAULT): Indian market rates, ₹/gram ─────────────────
// goodreturns.in gold-rates page via the free r.jina.ai reader proxy (returns
// markdown). India retail rates run ~16% above international spot (import duty +
// GST) — this is what the owner wants shown. r.jina.ai rate-limits per domain, so
// cache aggressively (60 min success, 5 min failure) and single-flight requests.
const INDIA_URL = "https://r.jina.ai/https://www.goodreturns.in/gold-rates/";
const INDIA_CACHE_MS = 60 * 60 * 1000; // success cache (politeness)
const INDIA_FAIL_CACHE_MS = 5 * 60 * 1000; // failure cache (don't hammer a down feed)
interface IndiaQuote { gold24k: number; gold22k: number; gold18k: number; silver: number; lastUpdated: string; source: string; currency: string; unit: string; }
let indiaCache: { quote: IndiaQuote; at: number } | null = null;
let indiaFailAt = 0;
let indiaInFlight: Promise<IndiaQuote | null> | null = null;

/** "₹14,422" / "14,422" / "₹ 13,220" → 14422 (strips ₹, commas, spaces). */
function parseInr(raw: string): number | null {
  const n = Number(raw.replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Most reliable: the prose sentence "...per gram for 24/22/18 karat gold". */
function goldFromSentence(md: string): { gold24k: number; gold22k: number; gold18k: number } | null {
  const g = (karat: string) => {
    // The value sits immediately before "per gram for N karat gold"; allow only a
    // tiny gap that cannot cross another bold ₹ token (no ₹ or * in between).
    const m = md.match(new RegExp(`\\*\\*₹\\s*([\\d,]+(?:\\.[\\d]+)?)\\*\\*[^₹*]{0,12}?per gram for ${karat} karat gold`, "i"));
    return m ? parseInr(m[1]) : null;
  };
  const gold24k = g("24"); const gold22k = g("22"); const gold18k = g("18");
  if (gold24k === null || gold22k === null || gold18k === null) return null;
  return { gold24k, gold22k, gold18k };
}

/** Ticker: "22k Gold₹ 13,220/gm" → 22K gold; "Silver₹ 2,35,000/kg" → ₹/kg. */
function goldFromTicker(md: string): { gold22k: number } | null {
  const m = md.match(/22k\s*gold\s*₹\s*([\d,]+(?:\.[\d]+)?)\s*\/\s*gm/i);
  if (!m) return null;
  const n = parseInr(m[1]);
  return n === null ? null : { gold22k: n };
}
function silverFromTicker(md: string): number | null {
  const m = md.match(/silver\s*₹\s*([\d,]+(?:\.[\d]+)?)\s*\/\s*kg/i);
  if (!m) return null;
  const n = parseInr(m[1]);
  return n === null ? null : n / 1000; // kg → gram
}

/** Backup: the "| Gram | 24K | 22K | 18K |" per-gram table, "| 1 | ..." row. */
function goldFromGramTable(md: string): { gold24k: number; gold22k: number; gold18k: number } | null {
  const header = md.indexOf("| Gram | 24K | 22K | 18K |");
  if (header < 0) return null;
  const row = md.slice(header).match(/^\|\s*1\s*\|\s*₹\s*([\d,]+(?:\.[\d]+)?)\s*\|\s*₹\s*([\d,]+(?:\.[\d]+)?)\s*\|\s*₹\s*([\d,]+(?:\.[\d]+)?)\s*\|/m);
  if (!row) return null;
  const gold24k = parseInr(row[1]); const gold22k = parseInr(row[2]); const gold18k = parseInr(row[3]);
  if (gold24k === null || gold22k === null || gold18k === null) return null;
  return { gold24k, gold22k, gold18k };
}

/**
 * Defensive parse, in order of reliability: prose sentence → ticker → gram table.
 * Returns the quote values (unrounded) or null when anything is missing/inconsistent.
 */
function parseIndiaRates(md: string): { gold24k: number; gold22k: number; gold18k: number; silver: number } | null {
  const sentence = goldFromSentence(md);
  const ticker = goldFromTicker(md);
  const table = goldFromGramTable(md);
  const gold24k = sentence?.gold24k ?? table?.gold24k;
  const gold22k = sentence?.gold22k ?? ticker?.gold22k ?? table?.gold22k;
  const gold18k = sentence?.gold18k ?? table?.gold18k;
  const silver = silverFromTicker(md);
  const values = [gold24k, gold22k, gold18k, silver];
  if (values.some((n) => n === null || !Number.isFinite(n) || n <= 0)) return null;
  const g24 = gold24k as number; const g22 = gold22k as number; const g18 = gold18k as number;
  // Cross-check karat ratios (±3%): 24K ≈ 22K/0.916 ≈ 18K/0.75.
  if (Math.abs(g22 - g24 * 0.916) / (g24 * 0.916) > 0.03) return null;
  if (Math.abs(g18 - g24 * 0.75) / (g24 * 0.75) > 0.03) return null;
  // Sanity bands — same as the free provider.
  if (g24 < GOLD_BAND[0] || g24 > GOLD_BAND[1] || (silver as number) < SILVER_BAND[0] || (silver as number) > SILVER_BAND[1]) return null;
  return { gold24k: round2(g24), gold22k: round2(g22), gold18k: round2(g18), silver: round2(silver as number) };
}

async function indiaQuote(): Promise<IndiaQuote | null> {
  if (indiaCache && Date.now() - indiaCache.at < INDIA_CACHE_MS) return indiaCache.quote;
  if (Date.now() - indiaFailAt < INDIA_FAIL_CACHE_MS) return null;
  if (indiaInFlight) return indiaInFlight;
  indiaInFlight = (async () => {
    try {
      const r = await fetch(INDIA_URL, { signal: AbortSignal.timeout(25_000) });
      if (!r.ok) throw new Error(`upstream-${r.status}`);
      const parsed = parseIndiaRates(await r.text());
      if (!parsed) throw new Error("unparseable-payload");
      const quote: IndiaQuote = { ...parsed, lastUpdated: new Date().toISOString(), source: "india", currency: "INR", unit: "per-gram" };
      indiaCache = { quote, at: Date.now() };
      return quote;
    } catch {
      indiaFailAt = Date.now();
      return null;
    } finally {
      indiaInFlight = null;
    }
  })();
  return indiaInFlight;
}

/** Provider "india" as a response. */
async function indiaRates(): Promise<Response> {
  const quote = await indiaQuote();
  return quote ? json({ ok: true, quote }) : json({ ok: false, error: "provider-unavailable" });
}

/** Default path: India-market rates first, keyless spot provider as fallback. */
async function ratesWithFallback(): Promise<Response> {
  const quote = await indiaQuote();
  if (quote) return json({ ok: true, quote });
  return freeRates();
}

// ── Provider "perplexity" (optional): needs PERPLEXITY_API_KEY ──────────────
async function perplexityRates(): Promise<Response> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) return json({ ok: false, error: "not-configured" });
  try {
    const r = await fetch("https://api.perplexity.ai/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify({ model: "sonar", temperature: 0, system: "Return ONLY a valid JSON object. No markdown, prose, or currency symbols.", user: "Give current India retail/spot rates in INR per gram for 24K, 22K, and 18K gold and 999 silver. Keys exactly: gold24k, gold22k, gold18k, silver. Values must be positive numbers." }
) });
    if (!r.ok) return json({ ok: false, error: "provider-unavailable" });
    const raw = await r.json() as any; const text = String(raw?.choices?.[0]?.message?.content ?? ""); const match = text.replace(/```(?:json)?/gi, "").match(/\{[\s\S]*\}/); if (!match) return json({ ok: false, error: "invalid-provider-response" });
    const values = JSON.parse(match[0]); const nums = [values.gold24k, values.gold22k, values.gold18k, values.silver]; if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n) || n <= 0)) return json({ ok: false, error: "invalid-provider-response" });
    return json({ ok: true, quote: { ...values, lastUpdated: new Date().toISOString(), source: "perplexity", currency: "INR", unit: "per-gram" } });
  } catch { return json({ ok: false, error: "provider-unavailable" }); }
}

async function ratesResponse(): Promise<Response> {
  const provider = process.env.RATES_PROVIDER || "india";
  if (provider === "india") return ratesWithFallback(); // india → free → {ok:false}
  if (provider === "free") return freeRates();
  if (provider === "perplexity") return perplexityRates();
  return json({ ok: false, error: "provider-not-supported" });
}

/** Quote for SSR bootstrap. Failures intentionally return null so the app keeps its config fallback. */
async function ssrRatesPayload(): Promise<Record<string, unknown> | null> {
  try {
    const response = await ratesResponse();
    if (!response.ok) return null;
    const data = await response.json() as { ok?: boolean; quote?: Record<string, unknown> };
    const quote = data.ok && data.quote;
    if (!quote) return null;
    const values = [quote.gold24k, quote.gold22k, quote.gold18k, quote.silver];
    return values.every((n) => typeof n === "number" && Number.isFinite(n)) ? quote : null;
  } catch { return null; }
}

function ssrMoney(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function ssrTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(date);
}

async function injectSSRRatePayload(response: Response): Promise<Response> {
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) return response;
  const payload = await ssrRatesPayload();
  if (!payload) return response;
  const html = await response.text();
  // The portable SSR handler has no access to the provider, so rewrite its
  // deterministic config snapshot before sending. The browser reads the same
  // quote below, making the first client render hydration-identical.
  const quote = payload as { gold24k: number; gold22k: number; gold18k: number; silver: number; lastUpdated?: string; source?: string };
  const old = [7690, 7050, 5770, 97.5].map(ssrMoney);
  const fresh = [quote.gold24k, quote.gold22k, quote.gold18k, quote.silver].map(ssrMoney);
  let body = html;
  old.forEach((value, index) => { body = body.split(value).join(fresh[index]); });
  const oldTime = ssrTime("2026-08-03T10:45:00+05:30");
  const freshTime = ssrTime(String(quote.lastUpdated ?? ""));
  if (freshTime) body = body.split(oldTime).join(freshTime);
  body = body.replace("Stored rates — live feed not connected", `Live${quote.source === "india" ? " (India market)" : quote.source === "api" ? " (international spot)" : ""} · updated ${freshTime}`);
  const safe = JSON.stringify(payload).replace(/</g, "\\u003c");
  const marker = `<script type="application/json" id="smj-rates">${safe}</script>`;
  body = body.includes("</body>") ? body.replace("</body>", `${marker}</body>`) : `${body}${marker}`;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

type Overlay = { version: 1; products: Record<string, any>; collections: Record<string, any>; categories: Record<string, any> };
const DATA_FILE = `${import.meta.dir}/data/catalogue.json`;
const emptyOverlay = (): Overlay => ({ version: 1, products: {}, collections: {}, categories: {} });
function readOverlay(): Overlay { try { const o = JSON.parse(readFileSync(DATA_FILE, "utf8")); return { ...emptyOverlay(), ...o }; } catch { return emptyOverlay(); } }
function mergeList<T extends Record<string, any>>(seed: T[], changes: Record<string, any>, key: string): T[] {
  const out = seed.map(x => ({ ...x })); const index = new Map(out.map(x => [x[key], x]));
  for (const [id, patch] of Object.entries(changes || {})) { if ((patch as any)?.deleted) { const i = out.findIndex(x => x[key] === id); if (i >= 0) out.splice(i, 1); index.delete(id); } else if (index.has(id)) Object.assign(index.get(id), patch); else out.push({ ...(patch as any), [key]: id }); }
  return out;
}
function catalogue() { const o = readOverlay(); return { products: mergeList(seedProducts as any, o.products, "id"), collections: mergeList(seedCollections as any, o.collections, "slug"), categories: mergeList(seedCategories as any, o.categories, "slug") }; }
function saveOverlay(o: Overlay) { mkdirSync(`${import.meta.dir}/data`, { recursive: true }); const tmp = `${DATA_FILE}.${process.pid}.tmp`; writeFileSync(tmp, JSON.stringify(o, null, 2)); renameSync(tmp, DATA_FILE); }
const b64 = (x: Uint8Array | string) => Buffer.from(x).toString("base64url");
function sessionToken(username: string) { const payload = b64(JSON.stringify({ u: username, exp: Date.now() + 86400000 })); return `${payload}.${b64(createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(payload).digest())}`; }
function validSession(req: Request) { const raw = req.headers.get("cookie")?.match(/(?:^|;\s*)smj_admin=([^;]+)/)?.[1]; if (!raw || !process.env.ADMIN_SESSION_SECRET) return false; const [p, sig] = raw.split("."); if (!p || !sig) return false; try { const expected = createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(p).digest(); const got = Buffer.from(sig, "base64url"); const data = JSON.parse(Buffer.from(p, "base64url").toString()); return got.length === expected.length && timingSafeEqual(got, expected) && data.exp > Date.now() && data.u === process.env.ADMIN_USERNAME; } catch { return false; } }
const attempts = new Map<string, { n: number; at: number }>();
function slugify(v: string) { return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
async function adminApi(req: Request, pathname: string): Promise<Response | null> {
  if (!pathname.startsWith("/api/admin/")) return null;
  if (pathname === "/api/admin/login" && req.method === "POST") { try { const b = await req.json() as any; const ip = req.headers.get("x-forwarded-for") || "unknown"; const a = attempts.get(ip); const now = Date.now(); if (a && now-a.at < 900000 && a.n >= 10) return json({ error: "too-many-attempts" }, 429); if (!a || now-a.at >= 900000) attempts.set(ip, { n: 1, at: now }); else a.n++; const u = String(b.username ?? ""), p = String(b.password ?? ""); const eu = process.env.ADMIN_USERNAME ?? "", ep = process.env.ADMIN_PASSWORD ?? ""; const eq = (x: string, y: string) => { const xb = Buffer.from(x), yb = Buffer.from(y); return xb.length === yb.length && timingSafeEqual(xb, yb); }; if (!eq(u, eu) || !eq(p, ep)) return json({ error: "invalid-credentials" }, 401); return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": `smj_admin=${sessionToken(u)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400` } }); } catch { return json({ error: "invalid-request" }, 400); } }
  if (pathname === "/api/admin/logout" && req.method === "POST") return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": "smj_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict" } });
  if (pathname === "/api/admin/session" && req.method === "GET") return validSession(req) ? json({ authed: true }) : json({ authed: false }, 401);
  if (!validSession(req)) return json({ error: "unauthorized" }, 401);
  const m = pathname.match(/^\/api\/admin\/(products|collections|categories)(?:\/([^/]+))?$/); const resource = m?.[1], id = m?.[2];
  if (pathname === "/api/admin/catalogue" && req.method === "GET") return json({ ...catalogue(), overlay: readOverlay() });
  if (pathname === "/api/admin/upload" && req.method === "POST") { const form = await req.formData(); const file = form.get("file"); if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > 5*1024*1024) return json({ error: "invalid-image" }, 400); const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] || ".bin").toLowerCase(); const safe = (file.name.replace(/[^a-z0-9._-]/gi, "_").slice(0,80) || "image") + ext; const name = `${Date.now()}-${randomBytes(4).toString("hex")}-${safe.replace(/\.[a-z0-9]+$/i, "")}${ext}`; mkdirSync(`${import.meta.dir}/public/images/uploads`, { recursive: true }); writeFileSync(`${import.meta.dir}/public/images/uploads/${name}`, Buffer.from(await file.arrayBuffer())); return json({ url: `/images/uploads/${name}` }); }
  if (!resource) return json({ error: "not-found" }, 404); const o = readOverlay(); const seed = resource === "products" ? seedProducts : resource === "collections" ? seedCollections : seedCategories; const key = resource === "products" ? "id" : "slug"; const map = (o as any)[resource] as Record<string, any>;
  if (req.method === "DELETE" && id) { map[id] = { deleted: true }; saveOverlay(o); return json({ ok: true }); }
  if (req.method === "POST") { const body = await req.json() as any; if (resource === "products") { if (!body.name || !body.category || !body.metal || !body.purity || body.weightGrams == null || body.makingCharge == null || !body.gender || !body.occasion) return json({ error: "missing-fields" }, 400); let n=9001; while (map[`p${n}`]) n++; body.id=`p${n}`; body.slug=body.slug || slugify(body.name); Object.assign(body, { tags: body.tags || [], images: body.images || [], isNew: !!body.isNew, isBestSeller: !!body.isBestSeller, inStock: body.inStock !== false }); map[body.id]=body; } else { const required = resource === "collections" ? ["slug","name"] : ["slug","name","icon"]; if (required.some(k => !body[k])) return json({ error: "missing-fields" }, 400); map[body.slug]=body; } saveOverlay(o); return json({ [resource.slice(0,-1)]: catalogue()[resource as "products"|"collections"|"categories"].find((x:any)=>x[key] === (resource === "products" ? body.id : body.slug)) }); }
  if (req.method === "PUT" && resource === "products" && id) { const existing = catalogue().products.find(x=>x.id===id); if (!existing) return json({ error: "not-found" },404); const patch=await req.json() as any; if (patch.name && !patch.slug) patch.slug=slugify(patch.name); map[id]={ ...(map[id]||{}), ...patch }; saveOverlay(o); return json({ product: catalogue().products.find(x=>x.id===id) }); }
  return json({ error: "not-found" }, 404);
}

async function api(req: Request, pathname: string): Promise<Response | null> {
  const admin = await adminApi(req, pathname); if (admin) return admin;
  if (pathname === "/api/rates" && req.method === "GET") {
    return ratesResponse();
  }
  if (pathname === "/api/payments/cashfree/config" && req.method === "GET") return json({ configured: !!(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET), mode: process.env.CASHFREE_MODE === "production" ? "production" : "sandbox" });
  if (pathname === "/api/payments/cashfree/order" && req.method === "POST") {
    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) return json({ configured: false });
    try { const body = await req.json() as any; const order = body.order; const response = await apiFetch("/orders", { method: "POST", body: JSON.stringify({ order_id: order.id, order_amount: Number(Number(order.amounts.total).toFixed(2)), order_currency: "INR", customer_details: { customer_id: order.id, customer_name: order.customer.name, customer_email: order.customer.email, customer_phone: order.customer.phone }, order_meta: { return_url: `${publicOrigin()}/order/${order.id}?cashfree=return` } }) }); const data = await response.json() as any; if (!response.ok || !data.payment_session_id) return json({ configured: true, error: "gateway-unavailable" }, 502); return json({ configured: true, paymentSessionId: data.payment_session_id, paymentLink: data.payment_link || data.payment_link_url || data.link || undefined, orderId: order.id, mode: process.env.CASHFREE_MODE === "production" ? "production" : "sandbox", clientId: process.env.CASHFREE_CLIENT_ID }); } catch { return json({ configured: true, error: "gateway-unavailable" }, 502); }
  }
  if (pathname === "/api/payments/cashfree/status" && req.method === "GET") {
    const id = new URL(req.url).searchParams.get("order_id"); if (!id || !process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) return json({ status: "UNKNOWN" });
    try { const r = await apiFetch(`/orders/${encodeURIComponent(id)}`); const d = await r.json() as any; return json({ status: String(d.order_status ?? "UNKNOWN").toUpperCase() }); } catch { return json({ status: "UNKNOWN" }); }
  }
  if (pathname === "/api/payments/cashfree/webhook" && req.method === "POST") {
    // Always acknowledge quickly; malformed/unverified notifications are ignored.
    try {
      const raw = await req.text();
      if (!(await validCashfreeWebhook(req, raw))) return json({ received: true });
      const payload = JSON.parse(raw) as any;
      const orderId = String(payload?.data?.order?.order_id ?? payload?.order_id ?? "");
      const status = String(payload?.data?.payment?.payment_status ?? payload?.data?.order?.order_status ?? payload?.order_status ?? "").toUpperCase();
      const amount = Number(payload?.data?.order?.order_amount ?? payload?.order_amount);
      if (orderId && status === "PAID" && Number.isFinite(amount) && amount >= 0) webhookPaidOrders.add(orderId);
    } catch { /* webhook must never throw */ }
    return json({ received: true });
  }
  return null;
}

// Free PORT regardless of which user owns the current listener. lsof runs under
// sudo so it can see (and the kill can signal) a process owned by another user;
// the loop waits for the socket to actually release before we bind.
const freePort =
  `for _ in $(seq 1 25); do ` +
  `pids=$(lsof -t -iTCP:${String(PORT)} -sTCP:LISTEN 2>/dev/null || true); ` +
  `if [ -z "$pids" ]; then exit 0; fi; ` +
  `kill $pids 2>/dev/null || true; sleep 0.2; ` +
  `done`;

// Take over the port, re-freeing and retrying if another publish grabbed it in the
// gap between freeing and binding (last publish wins). Bun.serve throws EADDRINUSE
// synchronously, so without this a raced publish would die while the shell already
// reported success.
for (let attempt = 1; ; attempt++) {
  await Bun.$`sudo sh -c ${freePort}`.quiet().nothrow();
  try {
    Bun.serve({
      port: PORT,
      hostname: HOST,
      async fetch(req) {
        const { pathname } = new URL(req.url);
        const apiResponse = await api(req, pathname);
        if (apiResponse) return apiResponse;
        if (pathname !== "/") {
          const file = Bun.file(CLIENT_DIR + pathname);
          if (await file.exists()) return new Response(file);
        }
        const merged = catalogue();
        (globalThis as any).__CATALOGUE_SERVER__ = merged;
        const rendered = await (handler as { fetch: (r: Request) => Response | Promise<Response> }).fetch(req);
        let withCatalogue = rendered;
        if ((rendered.headers.get("content-type") ?? "").includes("text/html")) {
          const html = await rendered.text(); const payload = JSON.stringify(merged).replace(/</g, "\u003c");
          const body = html.replace("</body>", `<script>window.__CATALOGUE__=${payload}</script></body>`);
          const headers = new Headers(rendered.headers); headers.delete("content-length"); withCatalogue = new Response(body, { status: rendered.status, headers });
        }
        return injectSSRRatePayload(withCatalogue);
      },
    });
    break;
  } catch (err) {
    if (attempt >= 10) throw err;
    await Bun.sleep(200);
  }
}

console.log(`team-site serving on http://${HOST}:${String(PORT)}`);
