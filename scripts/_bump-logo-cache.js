const fs = require("fs");
const path = require("path");
const SKIP = new Set(["node_modules", ".git", "api", "scripts", "vi", "images"]);
const VER = "20260915logo1";
let n = 0;

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/\.(html|js)$/.test(ent.name)) {
      let t = fs.readFileSync(full, "utf8");
      const o = t;
      t = t.replace(/logo-vuaproxy\.png\?v=[^"'\s]+/g, "logo-vuaproxy.png?v=" + VER);
      t = t.replace(/icon-vuaproxy\.png\?v=[^"'\s]+/g, "icon-vuaproxy.png?v=" + VER);
      t = t.replace(/favicon\.png\?v=[^"'\s]+/g, "favicon.png?v=" + VER);
      t = t.replace(/apple-touch-icon\.png\?v=[^"'\s]+/g, "apple-touch-icon.png?v=" + VER);
      // bare refs without query (header/footer templates)
      t = t.replace(/(["'])(\/?images\/logo-vuaproxy\.png)\1/g, "$1$2?v=" + VER + "$1");
      if (t !== o) {
        fs.writeFileSync(full, t);
        n++;
      }
    }
  }
}
walk(".");
console.log("bumped files", n);
