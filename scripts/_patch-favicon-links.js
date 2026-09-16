const fs = require("fs");
const path = require("path");

const VER = "20260915fav2";
const FAV_BLOCK =
  '<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png?v=' +
  VER +
  '">\n' +
  '<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16.png?v=' +
  VER +
  '">\n' +
  '<link rel="shortcut icon" type="image/png" href="/images/favicon.png?v=' +
  VER +
  '">\n' +
  '<link rel="apple-touch-icon" href="/images/apple-touch-icon.png?v=' +
  VER +
  '">';

const SKIP = new Set(["node_modules", ".git", "api", "scripts", "vi", "images"]);
let n = 0;

function patch(html) {
  let t = html;
  // remove existing favicon / apple-touch lines
  t = t.replace(/\s*<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*>/gi, "");
  t = t.replace(/\s*<link[^>]+rel=["']apple-touch-icon["'][^>]*>/gi, "");
  // insert after charset or viewport
  if (/<meta charset=/i.test(t)) {
    t = t.replace(/(<meta charset=["'][^"']*["']\s*\/?>)/i, "$1\n" + FAV_BLOCK);
  } else if (/<head[^>]*>/i.test(t)) {
    t = t.replace(/<head[^>]*>/i, (m) => m + "\n" + FAV_BLOCK);
  } else {
    return html;
  }
  return t;
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (ent.name.endsWith(".html")) {
      const o = fs.readFileSync(full, "utf8");
      const t = patch(o);
      if (t !== o) {
        fs.writeFileSync(full, t);
        n++;
      }
    }
  }
}

walk(".");
console.log("patched", n);
