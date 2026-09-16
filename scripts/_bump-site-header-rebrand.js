const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "api", "scripts", "vi", "images"]);
let n = 0;

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (ent.name.endsWith(".html")) {
      let t = fs.readFileSync(full, "utf8");
      if (!t.includes("site-header.js?v=")) continue;
      const nt = t.replace(/site-header\.js\?v=[^"']+/g, "site-header.js?v=20260914rebrand1");
      if (nt !== t) {
        fs.writeFileSync(full, nt);
        n++;
      }
    }
  }
}

walk(ROOT);
console.log("bumped", n);
