const fs = require("fs");

const file = "js/site-header.js";
let t = fs.readFileSync(file, "utf8");

const nextWarn =
  '⚠️ Nghiêm cấm sử dụng PROXY và VPS vào mục đích trái pháp luật. Bạn sẽ phải chịu toàn bộ trách nhiệm trước pháp luật khi sử dụng dịch vụ của chúng tôi. Tks!';

const re = /const TICKER_WARN =\s*"[^"]*";/;
if (!re.test(t)) {
  console.error("TICKER_WARN not found");
  process.exit(1);
}
t = t.replace(re, "const TICKER_WARN =\n    " + JSON.stringify(nextWarn) + ";");

fs.writeFileSync(file + ".tmp", t);
fs.renameSync(file + ".tmp", file);
console.log("ok", t.includes("Nghiêm cấm sử dụng PROXY"));

// Bump cache on active HTML (skip vi/ dump)
const path = require("path");
const SKIP = new Set(["node_modules", ".git", "api", "scripts", "vi", "images"]);
let n = 0;
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (ent.name.endsWith(".html")) {
      let h = fs.readFileSync(full, "utf8");
      if (!h.includes("site-header.js?v=")) continue;
      const nh = h.replace(/site-header\.js\?v=[^"']+/g, "site-header.js?v=20260915tick1");
      if (nh !== h) {
        fs.writeFileSync(full, nh);
        n++;
      }
    }
  }
}
walk(".");
console.log("bumped", n);
