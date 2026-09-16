const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SHOPS = [
  "duonghub",
  "tamdeal",
  "huyshop",
  "phuongmart",
  "tuansale",
  "vietshop",
  "hanhshop",
  "thunguyet95",
  "phongshop",
  "phuongfast",
  "sontiktok",
  "vananh93",
  "trinhstore",
  "ngocdeal",
  "phatshop",
  "nghiafast",
  "maiorder"
];

function rm(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
    console.log("rm", path.relative(ROOT, p));
  } catch (e) {
    console.warn("skip", p, e.message);
  }
}

for (const s of SHOPS) {
  rm(path.join(ROOT, "gian-hang", s + ".html"));
  rm(path.join(ROOT, "images", "shops", s + ".svg"));
}

rm(path.join(ROOT, "vi", "danh-sach-shop"));
rm(path.join(ROOT, "sitemaps"));
rm(path.join(ROOT, "sitemap.xml"));
rm(path.join(ROOT, "sitemap-index.xml"));
rm(path.join(ROOT, "sitemap.txt"));

// Clean vercel.json: drop danh-sach-shop rules + catch-all shop slug rewrite
const vercelPath = path.join(ROOT, "vercel.json");
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
const dropSrc = (rule) => {
  const s = String(rule.source || "");
  if (s.includes("danh-sach-shop")) return false;
  if (s === "/:slug([a-z0-9][a-z0-9-]{0,62})") return false;
  return true;
};
vercel.redirects = (vercel.redirects || []).filter(dropSrc);
vercel.rewrites = (vercel.rewrites || []).filter(dropSrc);
fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n");
console.log("vercel.json cleaned");

// robots.txt — Vua Proxy only
fs.writeFileSync(
  path.join(ROOT, "robots.txt"),
  `User-agent: *
Allow: /

Sitemap: https://www.vuaproxy.cloud/sitemap.xml
`
);
console.log("robots.txt updated");

// Minimal sitemap for Vua Proxy (no marketplace shops / sitemap parts)
const pages = [
  "/",
  "/tat-ca-san-pham",
  "/tat-ca-khu-vuc",
  "/gioi-thieu",
  "/faqs",
  "/lien-he",
  "/huong-dan-mua-hang",
  "/nap-tien",
  "/dang-ky-nguoi-ban",
  "/tai-lieu-api",
  "/dieu-khoan-dich-vu",
  "/dieu-khoan-su-dung",
  "/chinh-sach-bao-mat",
  "/chinh-sach-cookies",
  "/chinh-sach-mua-hang",
  "/bao-hanh-va-hoan-tien",
  "/hinh-thuc-thanh-toan",
  "/dmca",
  "/gdpr"
];
const urls = pages
  .map(
    (p) => `  <url>
    <loc>https://www.vuaproxy.cloud${p === "/" ? "/" : p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === "/" ? "1.0" : "0.6"}</priority>
  </url>`
  )
  .join("\n");
fs.writeFileSync(
  path.join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
);
console.log("sitemap.xml rewritten", pages.length, "urls");

// Strip shop/sitemap hub mentions from lay-toan-bo-url.html if present
const lay = path.join(ROOT, "lay-toan-bo-url.html");
if (fs.existsSync(lay)) {
  let html = fs.readFileSync(lay, "utf8");
  html = html
    .replace(/<li><a href="\/sitemaps\/part-\d+\.xml">[\s\S]*?<\/li>\s*/g, "")
    .replace(/<li><a href="\/danh-sach-shop">[\s\S]*?<\/li>\s*/g, "")
    .replace(/\(3992 URL\)/g, "(sitemap chính)")
    .replace(/đầy đủ \(3992 URL\)/g, "chính của site");
  fs.writeFileSync(lay, html);
  console.log("lay-toan-bo-url.html cleaned");
}

// serve.js local mapping
const serve = path.join(ROOT, "serve.js");
if (fs.existsSync(serve)) {
  let s = fs.readFileSync(serve, "utf8");
  s = s.replace(
    /if \(filePath === "\/danh-sach-shop"[\s\S]*?\n  \}\n/,
    ""
  );
  fs.writeFileSync(serve, s);
  console.log("serve.js cleaned");
}

console.log("done");
