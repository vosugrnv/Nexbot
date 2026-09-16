/**
 * Export all public Vua Proxy URLs → vuaproxy-all-urls.txt + sitemap.txt
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ORIGIN = "https://www.vuaproxy.cloud";

const SKIP_ROOT = new Set([
  "admin",
  "admin.html",
  "product",
  "product.html",
  "category",
  "category.html",
  "chia-se-bai",
  "chia-se-bai.html",
  "khu-vuc-quoc-gia",
  "khu-vuc-quoc-gia.html",
  "index",
  "index.html",
  "lay-toan-bo-url",
  "lay-toan-bo-url.html"
]);

const urls = new Set();
urls.add(ORIGIN + "/");

function add(p) {
  if (!p) return;
  let u = String(p).trim();
  if (!u.startsWith("http")) {
    if (!u.startsWith("/")) u = "/" + u;
    u = ORIGIN + u.replace(/\.html$/i, "");
  }
  u = u.replace(/\/+$/, "") || ORIGIN + "/";
  if (u === ORIGIN) u = ORIGIN + "/";
  urls.add(u);
}

// Root HTML pages
for (const f of fs.readdirSync(ROOT)) {
  if (!f.endsWith(".html")) continue;
  const base = f.replace(/\.html$/i, "");
  if (SKIP_ROOT.has(f) || SKIP_ROOT.has(base)) continue;
  if (base === "index") {
    add("/");
    continue;
  }
  add("/" + base);
}

// Country pages from locations-data.js (canonical slug URLs)
const locJs = fs.readFileSync(path.join(ROOT, "js/locations-data.js"), "utf8");
const slugRe = /slug:\s*"([^"]+)"/g;
let m;
while ((m = slugRe.exec(locJs))) add("/tat-ca-khu-vuc/" + m[1]);
add("/tat-ca-khu-vuc");

// Also include ISO code paths that still resolve via static files / redirects
const khuDir = path.join(ROOT, "tat-ca-khu-vuc");
if (fs.existsSync(khuDir)) {
  for (const f of fs.readdirSync(khuDir)) {
    if (!f.endsWith(".html")) continue;
    add("/tat-ca-khu-vuc/" + f.replace(/\.html$/i, ""));
  }
}

// Shop pages
const shopDir = path.join(ROOT, "gian-hang");
if (fs.existsSync(shopDir)) {
  for (const f of fs.readdirSync(shopDir)) {
    if (!f.endsWith(".html")) continue;
    add("/gian-hang/" + f.replace(/\.html$/i, ""));
  }
}

// Blog / chia-se (served via rewrite from vi/chia-se)
const chiaDir = path.join(ROOT, "vi/chia-se");
if (fs.existsSync(chiaDir)) {
  add("/chia-se");
  for (const f of fs.readdirSync(chiaDir)) {
    if (!f.endsWith(".html")) continue;
    add("/chia-se/" + f.replace(/\.html$/i, ""));
  }
}

// Product catalog pages under vi/ (public path /tat-ca-san-pham/:slug)
const prodDir = path.join(ROOT, "vi/tat-ca-san-pham");
if (fs.existsSync(prodDir)) {
  add("/tat-ca-san-pham");
  for (const f of fs.readdirSync(prodDir)) {
    if (!f.endsWith(".html")) continue;
    add("/tat-ca-san-pham/" + f.replace(/\.html$/i, ""));
  }
}

// Danh sách hubs
for (const hub of [
  "/danh-sach-san-pham",
  "/danh-sach-shop",
  "/danh-sach-chia-se",
  "/blog",
  "/tin-nhan",
  "/tin-nhan/vuaproxy"
]) {
  add(hub);
}

// Paginated list pages if present
for (const dir of ["vi/danh-sach-san-pham", "vi/danh-sach-shop", "vi/danh-sach-chia-se"]) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  const pub = "/" + dir.replace(/^vi\//, "");
  add(pub);
  for (const f of fs.readdirSync(full)) {
    if (f === "index.html") continue;
    if (!f.endsWith(".html")) continue;
    add(pub + "/" + f.replace(/\.html$/i, ""));
  }
}

const list = [...urls].sort((a, b) => a.localeCompare(b));
const outTxt = path.join(ROOT, "vuaproxy-all-urls.txt");
fs.writeFileSync(outTxt, list.join("\n") + "\n");

console.log(JSON.stringify({ total: list.length, file: outTxt }, null, 2));
console.log("--- sample ---");
console.log(list.slice(0, 15).join("\n"));
console.log("...");
console.log(list.slice(-5).join("\n"));
