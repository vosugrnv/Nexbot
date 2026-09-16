/**
 * Rewrite country slugs → proxy-{vietnamese-name}
 * e.g. Mỹ → proxy-my, Thái Lan → proxy-thai-lan
 * Also refresh vercel redirects + URL export.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function slugifyVi(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function writeSafe(file, content) {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, content);
  try {
    fs.renameSync(tmp, file);
  } catch {
    fs.copyFileSync(tmp, file);
    try {
      fs.unlinkSync(tmp);
    } catch (_) {}
  }
}

const locPath = path.join(ROOT, "js/locations-data.js");
let locSrc = fs.readFileSync(locPath, "utf8");

// Extract location objects via Function eval of array portion
const arrMatch = locSrc.match(/window\.VUAPROXY_LOCATIONS = (\[[\s\S]*?\])\s*\n/);
if (!arrMatch) throw new Error("VUAPROXY_LOCATIONS not found");
const locations = Function("return (" + arrMatch[1] + ")")();

const used = new Map();
const mapping = []; // { code, oldSlug, newSlug, nameVi }

for (const loc of locations) {
  const oldSlug = loc.slug;
  let base = slugifyVi(loc.nameVi || loc.name || loc.code);
  if (!base) base = String(loc.code || "xx").toLowerCase();
  let newSlug = "proxy-" + base;
  if (used.has(newSlug)) {
    newSlug = "proxy-" + base + "-" + String(loc.code).toLowerCase();
  }
  used.set(newSlug, loc.code);
  loc.slug = newSlug;
  mapping.push({ code: loc.code, oldSlug, newSlug, nameVi: loc.nameVi });
}

// Rebuild locations array text (pretty enough)
function objToJs(o) {
  return (
    "  {\n" +
    '    code: "' +
    o.code +
    '",\n' +
    '    slug: "' +
    o.slug +
    '",\n' +
    '    name: "' +
    String(o.name).replace(/\\/g, "\\\\").replace(/"/g, '\\"') +
    '",\n' +
    '    nameVi: "' +
    String(o.nameVi).replace(/\\/g, "\\\\").replace(/"/g, '\\"') +
    '",\n' +
    "    ips: " +
    o.ips +
    ",\n" +
    '    region: "' +
    o.region +
    '"\n' +
    "  }"
  );
}

const newArr =
  "window.VUAPROXY_LOCATIONS = [\n" + locations.map(objToJs).join(",\n") + "\n]\n";

locSrc = locSrc.replace(/window\.VUAPROXY_LOCATIONS = \[[\s\S]*?\]\s*\n/, newArr);

// Improve slugify + findLocation (match old english slug via redirects; also match code)
locSrc = locSrc.replace(
  /window\.VUAPROXY_slugifyCountry = function \(name\) \{[\s\S]*?\};/,
  `window.VUAPROXY_slugifyCountry = function (name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
};`
);

locSrc = locSrc.replace(
  /window\.VUAPROXY_countryPathSeg = function \(item\) \{[\s\S]*?\};/,
  `window.VUAPROXY_countryPathSeg = function (item) {
  if (!item) return "";
  if (item.slug) return String(item.slug);
  const vi = item.nameVi || item.name;
  if (vi) return "proxy-" + window.VUAPROXY_slugifyCountry(vi);
  return String(item.code || "").toLowerCase();
};`
);

locSrc = locSrc.replace(
  /window\.VUAPROXY_findLocation = function \(key\) \{[\s\S]*?\};/,
  `window.VUAPROXY_findLocation = function (key) {
  const list = window.VUAPROXY_LOCATIONS || [];
  let k = String(key || "").toLowerCase();
  if (!k) return null;
  // accept /tat-ca-khu-vuc/proxy-my or bare proxy-my / my / us
  if (k.indexOf("proxy-") === 0) {
    const hit = list.find(function (x) { return x.slug === k; });
    if (hit) return hit;
  }
  return (
    list.find(function (x) { return x.slug === k; }) ||
    list.find(function (x) { return x.slug === "proxy-" + k; }) ||
    list.find(function (x) { return x.code === k; }) ||
    list.find(function (x) {
      return "proxy-" + window.VUAPROXY_slugifyCountry(x.nameVi || x.name) === k ||
        window.VUAPROXY_slugifyCountry(x.nameVi || x.name) === k;
    }) ||
    null
  );
};`
);

writeSafe(locPath, locSrc);

// --- vercel.json redirects ---
const vercelPath = path.join(ROOT, "vercel.json");
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));

const nonKhuRedirects = (vercel.redirects || []).filter(
  (r) => !String(r.source || "").startsWith("/tat-ca-khu-vuc/")
);

const khuRedirects = [];
for (const m of mapping) {
  // ISO code → new
  khuRedirects.push({
    source: "/tat-ca-khu-vuc/" + m.code,
    destination: "/tat-ca-khu-vuc/" + m.newSlug,
    permanent: true
  });
  // old english slug → new (if different)
  if (m.oldSlug && m.oldSlug !== m.newSlug) {
    khuRedirects.push({
      source: "/tat-ca-khu-vuc/" + m.oldSlug,
      destination: "/tat-ca-khu-vuc/" + m.newSlug,
      permanent: true
    });
  }
}

vercel.redirects = [...khuRedirects, ...nonKhuRedirects];
writeSafe(vercelPath, JSON.stringify(vercel, null, 2) + "\n");

// sanity samples
const us = mapping.find((x) => x.code === "us");
const th = mapping.find((x) => x.code === "th");
const vn = mapping.find((x) => x.code === "vn");
console.log("samples", { us, th, vn, total: mapping.length });
console.log("redirects", khuRedirects.length);

// write mapping for reference
writeSafe(
  path.join(ROOT, "scripts/_country-slug-map.json"),
  JSON.stringify(mapping, null, 2)
);
