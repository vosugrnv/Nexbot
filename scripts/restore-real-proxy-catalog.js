const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = "C:/Users/Admin/Downloads/VuaProxy";

process.chdir(root);
console.log("Extracting original products-data.js from git...");
const raw = execSync("git show HEAD:js/products-data.js", {
  maxBuffer: 80 * 1024 * 1024,
  encoding: "utf8"
});

const start = raw.indexOf("const RAW_PRODUCTS = ");
const arrStart = raw.indexOf("[", start);
// find matching ]; for RAW_PRODUCTS — look for "];\n\nRAW_PRODUCTS.forEach"
const marker = "\nRAW_PRODUCTS.forEach";
const forEachAt = raw.indexOf(marker, arrStart);
if (forEachAt < 0) throw new Error("RAW_PRODUCTS.forEach not found");
// walk back to ];
let end = forEachAt;
while (end > arrStart && raw[end] !== "]") end--;
const jsonText = raw.slice(arrStart, end + 1);

let products;
try {
  products = JSON.parse(jsonText);
} catch (e) {
  // file uses JS object literals maybe not strict JSON? It was JSON.stringify style from import
  console.error("JSON parse failed, trying Function", e.message);
  products = Function("return (" + jsonText + ")")();
}

console.log("Total original products:", products.length);

function isProxy(p) {
  const hay = [p.name, p.slug, (p.cats || []).join(" ")].join(" ");
  // Keep real proxy products; exclude VPN brand accounts unless they are named Proxy
  if (/proxy/i.test(hay)) return true;
  if ((p.cats || []).some((c) => /^proxy$/i.test(String(c).trim()))) return true;
  return false;
}

function isBlocked(p) {
  const parts = [p.name, p.slug, (p.cats || []).join(" ")];
  if (Array.isArray(p.variants)) {
    for (const v of p.variants) if (v && v.label) parts.push(v.label);
  }
  return /(gmail|hotmail|outlook|tik[\s_-]?tok|tiktok|telegram)/i.test(parts.join(" "));
}

let proxies = products.filter((p) => isProxy(p) && !isBlocked(p));
console.log("Proxy products:", proxies.length);

// Normalize seller to Vua Proxy (single brand, no multi-shop)
proxies = proxies.map((p) => ({
  ...p,
  seller: "Vua Proxy",
  sellerSlug: "vua-proxy",
  sellerToken: "vuaproxy",
  slug: p.slug || undefined
}));

// Prefer products with stock / inStock
const selling = proxies.filter((p) => p.inStock !== false && !(typeof p.stock === "number" && p.stock <= 0));
console.log("In-stock proxy:", selling.length);

const pick = selling.length >= 20 ? selling : proxies;
console.log("Using:", pick.length);

// Build QUICK_PICKS from top rated / stocked
const quickSrc = [...pick].sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.stock || 0) - (a.stock || 0)).slice(0, 25);
const quick = quickSrc.map((p, i) => ({
  id: p.id,
  tag: i % 3 === 0 ? "hot" : "sale",
  name: p.name,
  seller: "Vua Proxy",
  rating: p.rating || 4.7,
  sold: ((800 + (Number(p.id) % 15000)) / 1000).toFixed(1).replace(".", ",") + "k",
  price: p.price,
  stock: typeof p.stock === "number" ? p.stock : 50,
  stockMax: typeof p.stock === "number" ? Math.max(p.stock, Math.round(p.stock * 1.2)) : 60
}));

const preamble = raw.slice(0, start);
// keep helpers before RAW_PRODUCTS, but update comment
const preambleFixed = preamble.replace(
  /\/\* Product catalog data[^*]*\*\//,
  "/* Product catalog — real Proxy SKUs restored from original catalog; single brand Vua Proxy. */"
);

const footer = `
RAW_PRODUCTS.forEach((p) => {
  if(!p.slug) p.slug = slugify(p.name);
});

const QUICK_PICKS_RAW = ${JSON.stringify(quick)};

function isBlockedProduct(p){
  if(!p) return true;
  const parts = [p.name, p.slug, (p.cats || []).join(" ")];
  if(Array.isArray(p.variants)){
    for(const v of p.variants){ if(v && v.label) parts.push(v.label); }
  }
  const hay = parts.join(" ");
  return /(gmail|hotmail|outlook|tik[\\s_-]?tok|tiktok|telegram)/i.test(hay);
}
function applyProductBlocklist(list){
  if(!Array.isArray(list)) return list;
  for(let i = list.length - 1; i >= 0; i--){
    if(isBlockedProduct(list[i])) list.splice(i, 1);
  }
  return list;
}
applyProductBlocklist(RAW_PRODUCTS);
if(typeof QUICK_PICKS_RAW !== "undefined" && Array.isArray(QUICK_PICKS_RAW)){
  applyProductBlocklist(QUICK_PICKS_RAW);
}
if (typeof window !== "undefined") {
  window.RAW_PRODUCTS = RAW_PRODUCTS;
  window.isBlockedProduct = isBlockedProduct;
  window.applyProductBlocklist = applyProductBlocklist;
}
`;

const out =
  preambleFixed +
  "const RAW_PRODUCTS = " +
  JSON.stringify(pick) +
  ";\n" +
  footer;

fs.writeFileSync(path.join(root, "js", "products-data.js"), out);
console.log("Wrote", pick.length, "products,", (out.length / 1024 / 1024).toFixed(2), "MB");
console.log("Sample names:");
pick.slice(0, 8).forEach((p) => console.log("-", p.id, p.name.slice(0, 80), "|", (p.image || "").slice(0, 60)));
