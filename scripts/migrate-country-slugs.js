/**
 * Migrate country URLs: /tat-ca-khu-vuc/vn → /tat-ca-khu-vuc/vietnam
 * - adds slug to locations-data.js
 * - updates link builders
 * - vercel 301 redirects + serve.js
 * - rebuilds products-data.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function slugifyName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/* ---- 1) Patch locations-data.js: add slug field + helpers ---- */
const locPath = path.join(root, "js", "locations-data.js");
let locSrc = fs.readFileSync(locPath, "utf8");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(locSrc, sandbox);
const locations = sandbox.window.VUAPROXY_LOCATIONS;
if (!Array.isArray(locations) || !locations.length) {
  throw new Error("VUAPROXY_LOCATIONS empty");
}

const used = new Map();
for (const loc of locations) {
  let slug = slugifyName(loc.name);
  if (!slug) slug = String(loc.code || "xx").toLowerCase();
  if (used.has(slug)) {
    slug = slug + "-" + String(loc.code).toLowerCase();
  }
  used.set(slug, loc.code);
  loc.slug = slug;
}

// Rebuild array literal with slug after code
const arrStart = locSrc.indexOf("window.VUAPROXY_LOCATIONS = [");
const arrEnd = locSrc.indexOf("];", arrStart);
if (arrStart < 0 || arrEnd < 0) throw new Error("locations array markers not found");

function fmtLoc(l) {
  return (
    "  {\n" +
    '    code: "' + l.code + '",\n' +
    '    slug: "' + l.slug + '",\n' +
    '    name: ' + JSON.stringify(l.name) + ",\n" +
    '    nameVi: ' + JSON.stringify(l.nameVi) + ",\n" +
    "    ips: " + Number(l.ips || 0) + ",\n" +
    '    region: "' + l.region + '"\n' +
    "  }"
  );
}

const helpers = `
window.VUAPROXY_slugifyCountry = function (name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
};

window.VUAPROXY_countryPathSeg = function (item) {
  if (!item) return "";
  if (item.slug) return String(item.slug);
  if (item.name) return window.VUAPROXY_slugifyCountry(item.name);
  return String(item.code || "").toLowerCase();
};

window.VUAPROXY_countryHref = function (item) {
  const seg = window.VUAPROXY_countryPathSeg(item);
  return seg ? "/tat-ca-khu-vuc/" + encodeURIComponent(seg) : "/tat-ca-khu-vuc";
};

window.VUAPROXY_findLocation = function (key) {
  const list = window.VUAPROXY_LOCATIONS || [];
  const k = String(key || "").toLowerCase();
  if (!k) return null;
  return (
    list.find(function (x) { return x.slug === k; }) ||
    list.find(function (x) { return x.code === k; }) ||
    null
  );
};
`;

const featured = locSrc.slice(arrEnd + 2); // from after ];
// Keep featured/tabs from original after array
const afterFeatured = featured.includes("window.VUAPROXY_LOCATION_FEATURED")
  ? featured.replace(/\s*$/, "")
  : "\n" + featured;

locSrc =
  locSrc.slice(0, arrStart) +
  "window.VUAPROXY_LOCATIONS = [\n" +
  locations.map(fmtLoc).join(",\n") +
  "\n]" +
  afterFeatured.replace(/\s*$/, "") +
  "\n" +
  helpers.trim() +
  "\n";

// Avoid duplicating helpers if re-run
if ((locSrc.match(/VUAPROXY_countryHref/g) || []).length > 1) {
  throw new Error("helpers already present — abort to avoid duplicate");
}
fs.writeFileSync(locPath, locSrc);
console.log("locations-data.js: added slug for", locations.length, "countries");
console.log("  sample:", locations.find((x) => x.code === "vn"), locations.find((x) => x.code === "us"));

const codeToSlug = Object.fromEntries(locations.map((l) => [l.code, l.slug]));

/* ---- 2) Patch JS link builders ---- */
function patchFile(rel, replacer) {
  const p = path.join(root, rel);
  let t = fs.readFileSync(p, "utf8");
  const next = replacer(t);
  if (next === t) console.warn("no change:", rel);
  else {
    fs.writeFileSync(p, next);
    console.log("patched", rel);
  }
}

patchFile("js/locations-page.js", (t) =>
  t.replace(
    'return "/tat-ca-khu-vuc/" + item.code;',
    'return (window.VUAPROXY_countryHref ? window.VUAPROXY_countryHref(item) : ("/tat-ca-khu-vuc/" + (item.slug || item.code)));'
  )
);

patchFile("js/proxy-packages.js", (t) =>
  t.replace(
    'href: "/tat-ca-khu-vuc/" + country.code,',
    'href: (window.VUAPROXY_countryHref ? window.VUAPROXY_countryHref(country) : ("/tat-ca-khu-vuc/" + (country.slug || country.code))),'
  )
);

patchFile("js/proxy-mega-menu.js", (t) =>
  t.replace(
    /function countryHref\(_typeSlug, country\) \{\s*const code = String\(country && country\.code \? country\.code : ""\)[\s\S]*?return "\/tat-ca-khu-vuc";\s*\}/,
    `function countryHref(_typeSlug, country) {
    if (window.VUAPROXY_countryHref) return window.VUAPROXY_countryHref(country);
    const seg = String((country && (country.slug || country.code)) || "")
      .toLowerCase()
      .trim();
    if (seg) return "/tat-ca-khu-vuc/" + encodeURIComponent(seg);
    return "/tat-ca-khu-vuc";
  }`
  )
);

patchFile("js/site-header.js", (t) => {
  t = t.replace(
    "if (hit && hit.code) return \"/tat-ca-khu-vuc/\" + encodeURIComponent(hit.code);",
    "if (hit) return window.VUAPROXY_countryHref ? window.VUAPROXY_countryHref(hit) : (\"/tat-ca-khu-vuc/\" + encodeURIComponent(hit.slug || hit.code));"
  );
  t = t.replace(
    /'<a class="footer-country" href="\/tat-ca-khu-vuc\/' \+\s*c\.code \+/m,
    `'<a class="footer-country" href="' + (window.VUAPROXY_countryHref ? window.VUAPROXY_countryHref(c) : ("/tat-ca-khu-vuc/" + (c.slug || c.code))) + '`
  );
  // fix possible broken concatenation if original was multi-line differently
  return t;
});

patchFile("js/side-banners.js", (t) =>
  t.replace('href: "/tat-ca-khu-vuc/us"', 'href: "/tat-ca-khu-vuc/united-states"')
);

patchFile("js/category-taxonomy.js", (t) =>
  t.replace('href: "/tat-ca-khu-vuc/vn"', 'href: "/tat-ca-khu-vuc/vietnam"')
);

/* location-country-page.js — resolver + links + canonical */
patchFile("js/location-country-page.js", (t) => {
  t = t.replace(
    /function codeFromPath\(\) \{[\s\S]*?return q \? String\(q\)\.toLowerCase\(\) : "";\s*\}/,
    `function pathKey() {
    const parts = (location.pathname || "").replace(/\\/+$/, "").split("/").filter(Boolean);
    const i = parts.indexOf("tat-ca-khu-vuc");
    if (i >= 0 && parts[i + 1]) return String(parts[i + 1]).toLowerCase();
    const q = new URLSearchParams(location.search).get("code") || new URLSearchParams(location.search).get("slug");
    return q ? String(q).toLowerCase() : "";
  }`
  );
  t = t.replace(
    /function findCountry\(code\) \{\s*return locations\.find\(function \(x\) \{ return x\.code === code; \}\) \|\| null;\s*\}/,
    `function findCountry(key) {
    if (window.VUAPROXY_findLocation) return window.VUAPROXY_findLocation(key);
    const k = String(key || "").toLowerCase();
    return (
      locations.find(function (x) { return x.slug === k; }) ||
      locations.find(function (x) { return x.code === k; }) ||
      null
    );
  }
  function countryHref(item) {
    return window.VUAPROXY_countryHref
      ? window.VUAPROXY_countryHref(item)
      : ("/tat-ca-khu-vuc/" + (item.slug || item.code));
  }`
  );
  t = t.replace(
    /'<a class="loc-card" href="\/tat-ca-khu-vuc\/' \+ item\.code \+ '">'/g,
    `'<a class="loc-card" href="' + countryHref(item) + '">'`
  );
  // more flexible replace for loc-card href
  t = t.replace(
    'href="/tat-ca-khu-vuc/" + item.code + \'"\'',
    'href="' + " + countryHref(item) + " + '\'"'
  );
  t = t.replace(
    /href="\/tat-ca-khu-vuc\/" \+ item\.code \+ '/g,
    'href="' + " + countryHref(item) + '"
  );
  t = t.replace(
    'url: "https://www.vuaproxy.cloud/tat-ca-khu-vuc/" + country.code,',
    'url: "https://www.vuaproxy.cloud" + countryHref(country),'
  );
  t = t.replace(
    '"https://www.vuaproxy.cloud/tat-ca-khu-vuc/" + country.code',
    '"https://www.vuaproxy.cloud" + countryHref(country)'
  );
  // init: use pathKey + optional replaceState
  t = t.replace(
    /const code = codeFromPath\(\);\s*const country = findCountry\(code\);/,
    `const key = pathKey();
    const country = findCountry(key);
    if (country && country.slug && key === country.code && key !== country.slug) {
      try {
        history.replaceState(null, "", countryHref(country) + (location.search || "") + (location.hash || ""));
      } catch (_) {}
    }`
  );
  // breadcrumb: show name not code
  t = t.replace(
    'document.getElementById("bcCountry").textContent = country.code.toUpperCase();',
    'document.getElementById("bcCountry").textContent = country.nameVi || country.name || country.code.toUpperCase();'
  );
  return t;
});

/* Fix site-header footer if still broken */
{
  const p = path.join(root, "js/site-header.js");
  let t = fs.readFileSync(p, "utf8");
  if (t.includes('href="/tat-ca-khu-vuc/\' +\n          c.code +')) {
    t = t.replace(
      /href="\/tat-ca-khu-vuc\/' \+\s*\n\s*c\.code \+\s*\n\s*'/,
      `href="' +\n          (window.VUAPROXY_countryHref ? window.VUAPROXY_countryHref(c) : ("/tat-ca-khu-vuc/" + (c.slug || c.code))) +\n          '`
    );
    fs.writeFileSync(p, t);
    console.log("re-patched site-header footer");
  }
}

/* Fix location-country-page loc-card if needed */
{
  const p = path.join(root, "js/location-country-page.js");
  let t = fs.readFileSync(p, "utf8");
  if (t.includes('"/tat-ca-khu-vuc/" + item.code')) {
    t = t.replace(/"\/tat-ca-khu-vuc\/" \+ item\.code/g, "countryHref(item).replace(/^\\//,'')"); // wrong
  }
  // cleaner: read the line
  t = fs.readFileSync(p, "utf8");
  t = t.replace(
    /href="\/tat-ca-khu-vuc\/" \+ item\.code \+ "/g,
    'href="\' + countryHref(item) + \'"'
  );
  // another pattern from original: '/tat-ca-khu-vuc/' + item.code + '
  t = t.replace(
    /'\/tat-ca-khu-vuc\/' \+ item\.code/g,
    "countryHref(item)"
  );
  fs.writeFileSync(p, t);
  console.log("normalized location-country-page hrefs");
}

/* ---- 3) Bulk replace hardcoded /tat-ca-khu-vuc/{code} in content (not vn-datacenter) ---- */
function replaceHardcoded(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return;
  let t = fs.readFileSync(p, "utf8");
  let n = 0;
  t = t.replace(/\/tat-ca-khu-vuc\/([a-z]{2})(?![a-z0-9-])/gi, (m, code) => {
    const c = code.toLowerCase();
    if (c === "vn" && m.includes("vn-datacenter")) return m;
    const slug = codeToSlug[c];
    if (!slug) return m;
    n++;
    return "/tat-ca-khu-vuc/" + slug;
  });
  if (n) {
    fs.writeFileSync(p, t);
    console.log("hardcoded", rel, n);
  }
}

[
  "index.html",
  "chia-se.html",
  "khu-vuc-quoc-gia.html",
  "js/chia-se-data.js",
  "tat-ca-khu-vuc.html"
].forEach(replaceHardcoded);

/* footer links inside all country html shells */
for (const f of fs.readdirSync(path.join(root, "tat-ca-khu-vuc"))) {
  if (!f.endsWith(".html")) continue;
  replaceHardcoded(path.join("tat-ca-khu-vuc", f));
}

/* ---- 4) serve.js ---- */
patchFile("serve.js", (t) =>
  t.replace(
    /\/\* Country location pages:[\s\S]*?if \(\/\^\\\/tat-ca-khu-vuc\\\/\[a-z\]\{2\}\\\/\?\$\/i\.test\(filePath\)\) \{[\s\S]*?\}/,
    `/* Country location pages: /tat-ca-khu-vuc/vietnam → khu-vuc-quoc-gia.html (legacy /vn redirects) */
  const countrySeg = filePath.match(/^\\/tat-ca-khu-vuc\\/([a-z0-9-]+)\\/?$/i);
  if (countrySeg) {
    const seg = countrySeg[1].toLowerCase();
    const CODE_TO_SLUG = ${JSON.stringify(codeToSlug)};
    if (/^[a-z]{2}$/.test(seg) && CODE_TO_SLUG[seg] && CODE_TO_SLUG[seg] !== seg) {
      res.writeHead(301, { Location: "/tat-ca-khu-vuc/" + CODE_TO_SLUG[seg] });
      res.end();
      return;
    }
    serveFile(path.join(__dirname, "khu-vuc-quoc-gia.html"), res);
    return;
  }`
  )
);

/* ---- 5) vercel.json redirects ---- */
const vercelPath = path.join(root, "vercel.json");
const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
vercel.redirects = (vercel.redirects || []).filter(
  (r) => !(r.source || "").startsWith("/tat-ca-khu-vuc/") || (r.source || "").includes(":path")
);
const countryRedirects = locations.map((l) => ({
  source: "/tat-ca-khu-vuc/" + l.code,
  destination: "/tat-ca-khu-vuc/" + l.slug,
  permanent: true
}));
// insert country redirects near top (after cart/wishlist)
const insertAt = Math.min(2, vercel.redirects.length);
vercel.redirects = [
  ...vercel.redirects.slice(0, insertAt),
  ...countryRedirects,
  ...vercel.redirects.slice(insertAt)
];
vercel.rewrites = (vercel.rewrites || []).map((r) => {
  if (r.source === "/tat-ca-khu-vuc/:code") {
    return { source: "/tat-ca-khu-vuc/:slug", destination: "/khu-vuc-quoc-gia" };
  }
  return r;
});
fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n");
console.log("vercel.json: redirects", countryRedirects.length);

/* ---- 6) rebuild products ---- */
require("child_process").execSync("node scripts/build-proxy-products.js", {
  cwd: root,
  stdio: "inherit"
});

/* ---- 7) bump cache on country template scripts if present ---- */
console.log("done");
console.log("vn →", codeToSlug.vn, "| us →", codeToSlug.us, "| gb →", codeToSlug.gb);
