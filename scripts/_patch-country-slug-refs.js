const fs = require("fs");
const path = require("path");

const m = JSON.parse(fs.readFileSync("scripts/_country-slug-map.json", "utf8"));
const map = Object.fromEntries(m.map((x) => [x.oldSlug, x.newSlug]));
const byCode = Object.fromEntries(m.map((x) => [x.code, x.newSlug]));

// Fix site-header featured fallbacks
{
  const f = "js/site-header.js";
  let t = fs.readFileSync(f, "utf8");
  t = t.replace(/slug: "united-states"/g, 'slug: "proxy-my"');
  t = t.replace(/slug: "united-kingdom"/g, 'slug: "proxy-anh"');
  t = t.replace(/slug: "japan"/g, 'slug: "proxy-nhat-ban"');
  t = t.replace(/slug: "germany"/g, 'slug: "proxy-duc"');
  t = t.replace(/slug: "france"/g, 'slug: "proxy-phap"');
  t = t.replace(/slug: "canada"/g, 'slug: "proxy-canada"');
  t = t.replace(/slug: "bangladesh"/g, 'slug: "proxy-bangladesh"');
  t = t.replace(/slug: "india"/g, 'slug: "proxy-an-do"');
  t = t.replace(/slug: "indonesia"/g, 'slug: "proxy-indonesia"');
  t = t.replace(/slug: "hong-kong"/g, 'slug: "proxy-hong-kong"');
  t = t.replace(/slug: "uae"/g, 'slug: "proxy-uae"');
  t = t.replace(/slug: "australia"/g, 'slug: "proxy-uc"');
  t = t.replace(/slug: "vietnam"/g, 'slug: "proxy-viet-nam"');
  fs.writeFileSync(f + ".tmp", t);
  fs.renameSync(f + ".tmp", f);
  console.log("site-header featured slugs ok");
}

const SKIP = new Set(["node_modules", ".git", "api", "scripts", "vi", "images"]);
let files = 0;
let repl = 0;

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/\.(html|js)$/.test(ent.name)) {
      let t = fs.readFileSync(full, "utf8");
      if (!t.includes("/tat-ca-khu-vuc/") && !t.includes("locations-data.js?v=")) continue;
      const orig = t;
      for (const [oldS, neu] of Object.entries(map)) {
        const a = "/tat-ca-khu-vuc/" + oldS;
        if (!t.includes(a)) continue;
        const parts = t.split(a);
        repl += parts.length - 1;
        t = parts.join("/tat-ca-khu-vuc/" + neu);
      }
      t = t.replace(/locations-data\.js\?v=[^"']+/g, "locations-data.js?v=20260915slug1");
      t = t.replace(/location-country-page\.js\?v=[^"']+/g, "location-country-page.js?v=20260915slug1");
      t = t.replace(/site-header\.js\?v=[^"']+/g, "site-header.js?v=20260915slug1");
      if (t !== orig) {
        fs.writeFileSync(full, t);
        files++;
      }
    }
  }
}
walk(".");
console.log({ files, repl, us: byCode.us, th: byCode.th });

// regenerate clean URL list (includes new slugs)
require("./_export-vuaproxy-urls-clean.js");
