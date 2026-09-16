const fs = require("fs");
const path = require("path");
const VER = "20260915fav1";
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
      t = t.replace(/favicon\.png\?v=[^"']+/g, "favicon.png?v=" + VER);
      t = t.replace(/apple-touch-icon\.png\?v=[^"']+/g, "apple-touch-icon.png?v=" + VER);
      if (t !== o) {
        fs.writeFileSync(full, t);
        n++;
      }
    }
  }
}
walk(".");
console.log("bumped", n);
