/**
 * Export ONLY current Vua Proxy public URLs (no marketplace / old MMO dump).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ORIGIN = "https://www.vuaproxy.cloud";

const STATIC = [
  "/",
  "/tat-ca-khu-vuc",
  "/gioi-thieu",
  "/faqs",
  "/lien-he",
  "/huong-dan-mua-hang",
  "/nap-tien",
  "/tai-lieu-api",
  "/dieu-khoan-dich-vu",
  "/dieu-khoan-su-dung",
  "/chinh-sach-bao-mat",
  "/chinh-sach-cookies",
  "/chinh-sach-mua-hang",
  "/bao-hanh-va-hoan-tien",
  "/hinh-thuc-thanh-toan",
  "/dmca",
  "/gdpr",
  "/chia-se",
  "/tai-khoan",
  "/don-hang",
  "/tin-nhan",
  "/tin-nhan/vuaproxy",
  "/thanh-toan"
];

const urls = new Set();

function add(p) {
  if (p === "/") urls.add(ORIGIN + "/");
  else urls.add(ORIGIN + p.replace(/\/+$/, ""));
}

for (const p of STATIC) add(p);

// Canonical country pages = slug from locations-data.js only
const locJs = fs.readFileSync(path.join(ROOT, "js/locations-data.js"), "utf8");
const slugRe = /slug:\s*"([^"]+)"/g;
let m;
while ((m = slugRe.exec(locJs))) add("/tat-ca-khu-vuc/" + m[1]);

// Blog / chia-se posts from chia-se-data.js (Vua Proxy articles only)
const shareJs = fs.readFileSync(path.join(ROOT, "js/chia-se-data.js"), "utf8");
const postsBlock = shareJs.match(/const SHARE_POSTS = \[([\s\S]*?)\];/);
if (!postsBlock) throw new Error("SHARE_POSTS not found");
const postSlugRe = /^\s*slug:\s*"([^"]+)"/gm;
let pm;
while ((pm = postSlugRe.exec(postsBlock[1]))) add("/chia-se/" + pm[1]);
// Category filter pages used on listing
for (const cat of ["tin-tuc", "huong-dan", "meo"]) add("/chia-se?cat=" + cat);

function writeSafe(file, content) {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, content);
  try {
    fs.renameSync(tmp, file);
  } catch {
    fs.copyFileSync(tmp, file);
    fs.unlinkSync(tmp);
  }
}

const list = [...urls].sort((a, b) => a.localeCompare(b));
const out = path.join(ROOT, "vuaproxy-all-urls.txt");
const body = list.join("\n") + "\n";
writeSafe(out, body);
writeSafe(path.join(ROOT, "sitemap.txt"), body);

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  list
    .map((u) => {
      const pri = u === ORIGIN + "/" ? "1.0" : u.includes("/tat-ca-khu-vuc/") ? "0.7" : "0.6";
      return (
        "  <url>\n    <loc>" +
        u +
        "</loc>\n    <changefreq>weekly</changefreq>\n    <priority>" +
        pri +
        "</priority>\n  </url>"
      );
    })
    .join("\n") +
  "\n</urlset>\n";
writeSafe(path.join(ROOT, "sitemap.xml"), xml);

console.log(JSON.stringify({ total: list.length, file: out }, null, 2));
console.log(list.slice(0, 20).join("\n"));
console.log("...");
console.log(list.slice(-8).join("\n"));
