const fs = require("fs");
const path = require("path");

function check(f) {
  const t = fs.readFileSync(f, "utf8");
  console.log(
    f,
    "fav1=" + t.includes("fav1"),
    "fav2=" + t.includes("fav2"),
    "f32=" + t.includes("favicon-32")
  );
}
check("index.html");
check("tat-ca-khu-vuc.html");
check("tin-nhan.html");

// Force replace any remaining fav1 → fav2 and inject multi icons if missing
const VER = "20260915fav2";
const BLOCK =
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
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (ent.name.endsWith(".html")) {
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
        fs.writeFileSync(full, t);
        n++;
      }
    }
  }
}
walk(".");
console.log("forced", n);
check("index.html");
