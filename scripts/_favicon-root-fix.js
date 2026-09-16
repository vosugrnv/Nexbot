const fs = require("fs");
const path = require("path");
const VER = "20260915fav3";
const BLOCK =
  '<link rel="icon" href="/favicon.ico?v=' +
  VER +
  '" sizes="any">\n' +
  '<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png?v=' +
  VER +
  '">\n' +
  '<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16.png?v=' +
  VER +
  '">\n' +
  '<link rel="icon" type="image/png" sizes="128x128" href="/images/favicon.png?v=' +
  VER +
  '">\n' +
  '<link rel="apple-touch-icon" href="/images/apple-touch-icon.png?v=' +
  VER +
  '">';

const SKIP = new Set(["node_modules", ".git", "api", "scripts", "vi", "images"]);
let n = 0;
let fail = 0;
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (ent.name.endsWith(".html")) {
      try {
        let t = fs.readFileSync(full, "utf8");
        const o = t;
        t = t.replace(/\s*<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/gi, "");
        t = t.replace(/\s*<link[^>]*rel=["']apple-touch-icon["'][^>]*>/gi, "");
        if (/<meta\s+charset=/i.test(t)) {
          t = t.replace(/(<meta\s+charset=["'][^"']*["']\s*\/?>)/i, "$1\n" + BLOCK);
        } else if (/<head[^>]*>/i.test(t)) {
          t = t.replace(/<head[^>]*>/i, (m) => m + "\n" + BLOCK);
        }
        if (t !== o) {
          const tmp = full + ".tmp";
          fs.writeFileSync(tmp, t);
          fs.renameSync(tmp, full);
          n++;
        }
      } catch (e) {
        fail++;
        console.warn("skip", full, e.code || e.message);
      }
    }
  }
}
walk(".");
console.log({ n, fail });
