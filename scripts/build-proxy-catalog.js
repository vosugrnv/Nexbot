const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "js", "products-data.js");

const countries = [
  { code: "vn", title: "Viet Nam", baseStatic: 49000, baseRot: 39000 },
  { code: "us", title: "United States", baseStatic: 69000, baseRot: 55000 },
  { code: "uk", title: "United Kingdom", baseStatic: 69000, baseRot: 55000 },
  { code: "de", title: "Germany", baseStatic: 65000, baseRot: 52000 },
  { code: "sg", title: "Singapore", baseStatic: 72000, baseRot: 58000 },
  { code: "jp", title: "Japan", baseStatic: 75000, baseRot: 60000 },
  { code: "kr", title: "Korea", baseStatic: 72000, baseRot: 58000 },
  { code: "au", title: "Australia", baseStatic: 70000, baseRot: 56000 },
  { code: "ca", title: "Canada", baseStatic: 68000, baseRot: 54000 },
  { code: "fr", title: "France", baseStatic: 65000, baseRot: 52000 },
  { code: "nl", title: "Netherlands", baseStatic: 64000, baseRot: 51000 },
  { code: "in", title: "India", baseStatic: 45000, baseRot: 36000 }
];

function svgDataUri(label, color) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="' +
    color +
    '"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient></defs>' +
    '<rect width="640" height="640" rx="48" fill="#0f172a"/>' +
    '<circle cx="320" cy="260" r="120" fill="url(#g)" opacity=".95"/>' +
    '<path d="M180 420c40-70 120-110 140-110s100 40 140 110" fill="none" stroke="#fca5a5" stroke-width="18" stroke-linecap="round"/>' +
    '<text x="320" y="545" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="#fff">' +
    label +
    "</text></svg>";
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function slugify(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function variantsFor(base, idBase, kind) {
  if (kind === "static") {
    return [
      { id: idBase + 1, label: "1 ngay · 1 IP", price: Math.round(base * 0.2), regular: Math.round(base * 0.28), stock: 200 },
      { id: idBase + 2, label: "7 ngay · 1 IP", price: base, regular: Math.round(base * 1.35), stock: 180 },
      { id: idBase + 3, label: "30 ngay · 1 IP", price: Math.round(base * 3.2), regular: Math.round(base * 4.2), stock: 150 },
      { id: idBase + 4, label: "30 ngay · 5 IP", price: Math.round(base * 12), regular: Math.round(base * 16), stock: 80 }
    ];
  }
  return [
    { id: idBase + 1, label: "1 ngay · 2GB", price: Math.round(base * 0.22), regular: Math.round(base * 0.3), stock: 220 },
    { id: idBase + 2, label: "7 ngay · 10GB", price: base, regular: Math.round(base * 1.4), stock: 190 },
    { id: idBase + 3, label: "30 ngay · 50GB", price: Math.round(base * 3.5), regular: Math.round(base * 4.6), stock: 160 },
    { id: idBase + 4, label: "30 ngay · Unlimited", price: Math.round(base * 6.5), regular: Math.round(base * 8.5), stock: 90 }
  ];
}

const SELLER = { seller: "Vua Proxy", sellerSlug: "vua-proxy", sellerToken: "vuaproxy" };
let id = 90001;
const products = [];

for (const c of countries) {
  const staticId = id++;
  const vars = variantsFor(c.baseStatic, staticId * 10, "static");
  const title = c.code === "vn" ? "Việt Nam" : c.title;
  products.push({
    id: staticId,
    name: `Proxy Static IPv4 ${title} — IP riêng, ổn định ads & tool`,
    price: vars[1].price,
    regular: vars[1].regular,
    image: svgDataUri("STATIC " + c.code.toUpperCase(), "#dc2626"),
    rating: Number((4.8 + (staticId % 3) * 0.05).toFixed(2)),
    cats: ["Proxy", "Static", title],
    inStock: true,
    stock: vars.reduce((s, v) => s + (v.stock || 0), 0),
    ...SELLER,
    slug: "proxy-static-ipv4-" + c.code,
    variantGroup: "Thời hạn",
    variants: vars.map((v) => ({ ...v, label: String(v.label).replace(/ngay/g, "ngày") }))
  });
}

for (const c of countries) {
  const rotId = id++;
  const vars = variantsFor(c.baseRot, rotId * 10, "rotating");
  const title = c.code === "vn" ? "Việt Nam" : c.title;
  products.push({
    id: rotId,
    name: `Proxy Xoay Residential ${title} — IP dân cư, đổi IP linh hoạt`,
    price: vars[1].price,
    regular: vars[1].regular,
    image: svgDataUri("XOAY " + c.code.toUpperCase(), "#ea580c"),
    rating: Number((4.7 + (rotId % 4) * 0.05).toFixed(2)),
    cats: ["Proxy", "Rotating", title],
    inStock: true,
    stock: vars.reduce((s, v) => s + (v.stock || 0), 0),
    ...SELLER,
    slug: "proxy-xoay-residential-" + c.code,
    variantGroup: "Gói dung lượng",
    variants: vars.map((v) => ({ ...v, label: String(v.label).replace(/ngay/g, "ngày") }))
  });
}

const bundles = [
  {
    id: id++,
    name: "Combo Proxy Static 10 quốc gia — Gói doanh nghiệp",
    type: "Static",
    price: 1290000,
    regular: 1890000
  },
  {
    id: id++,
    name: "Combo Proxy Xoay Unlimited đa quốc gia — Gói agency",
    type: "Rotating",
    price: 1590000,
    regular: 2290000
  }
];

for (const b of bundles) {
  products.push({
    id: b.id,
    name: b.name,
    price: b.price,
    regular: b.regular,
    image: svgDataUri("COMBO", "#be123c"),
    rating: 4.9,
    cats: ["Proxy", b.type, "Combo"],
    inStock: true,
    stock: 40,
    ...SELLER,
    slug: slugify(b.name),
    variantGroup: "Thời hạn",
    variants: [
      { id: b.id * 10 + 1, label: "30 ngày", price: b.price, regular: b.regular, stock: 25 },
      {
        id: b.id * 10 + 2,
        label: "90 ngày",
        price: Math.round(b.price * 2.6),
        regular: Math.round(b.regular * 2.6),
        stock: 15
      }
    ]
  });
}

const quick = products.slice(0, 12).map((p, i) => ({
  id: p.id,
  tag: i % 3 === 0 ? "hot" : "sale",
  name: p.name,
  seller: "Vua Proxy",
  rating: p.rating,
  sold: (1.2 + i * 0.7).toFixed(1).replace(".", ",") + "k",
  price: p.price,
  stock: p.stock,
  stockMax: Math.round(p.stock * 1.2)
}));

const preamble = `/* Product catalog — Vua Proxy (static + rotating by country). */
function slugify(str){
  return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/đ/gi,"d")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
function productBySlug(slug){
  if(!slug) return null;
  return RAW_PRODUCTS.find(p => p.slug === slug || slugify(p.name) === slug) || null;
}
function productById(id){
  const n = Number(id);
  return RAW_PRODUCTS.find(p => p.id === n) || null;
}
/** SEO path (canonical): /tat-ca-san-pham/ten-san-pham-12345 */
function productSeoPath(p){
  return \`/tat-ca-san-pham/\${p.slug}-\${p.id}\`;
}
/** Clickable href — SEO path không .html */
function productHref(p){
  if(!p) return "/tat-ca-san-pham";
  return productSeoPath(p);
}
/** Resolve product from clean URL or ?slug= / ?id= */
function resolveProductFromLocation(){
  const params = new URLSearchParams(location.search);
  if(params.get("id")) return productById(params.get("id"));
  if(params.get("slug")) return productBySlug(params.get("slug"));
  try{
    if(typeof document !== "undefined"){
      const boot = window.VUAMMO_BOOT_PRODUCT_ID || window.VUAPROXY_BOOT_PRODUCT_ID;
      if(boot){
        const byBoot = productById(boot);
        if(byBoot) return byBoot;
      }
      const ld = document.getElementById("productJsonLd");
      if(ld){
        const j = JSON.parse(ld.textContent || "{}");
        if(j && j.sku){
          const bySku = productById(j.sku);
          if(bySku) return bySku;
        }
      }
    }
  }catch(_){}
  const path = String((typeof location !== "undefined" && location.pathname) || "");
  const idTrail = path.match(/\\/(?:vi\\/)?tat-ca-san-pham\\/[^/]*?-(\\d+)(?:\\.html)?\\/?$/i);
  if(idTrail){
    const byId = productById(idTrail[1]);
    if(byId) return byId;
  }
  const m = path.match(/\\/(?:vi\\/)?tat-ca-san-pham\\/([^/]+)(?:\\.html)?\\/?$/i);
  if(m){
    const raw = decodeURIComponent(m[1]);
    const idMatch = raw.match(/-(\\d+)$/);
    if(idMatch){
      const byId = productById(idMatch[1]);
      if(byId) return byId;
    }
    const slugOnly = raw.replace(/-\\d+$/,"");
    return productBySlug(slugOnly);
  }
  return null;
}

`;

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

const out = preamble + "const RAW_PRODUCTS = " + JSON.stringify(products) + ";\n" + footer;
fs.writeFileSync(outPath, out);
console.log("Wrote", products.length, "products,", (out.length / 1024).toFixed(1), "KB");
