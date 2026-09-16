const fs = require("fs");
const path = require("path");

const file = "js/site-header.js";
let t = fs.readFileSync(file, "utf8");

t = t.replace(
  /const TICKER_INTRO =\s*"[^"]*";\s*const TICKER_WARN =\s*"[^"]*";/,
  `const TICKER_TEXT =
    "⚠️ Nghiêm cấm sử dụng PROXY và VPS vào mục đích trái pháp luật. Bạn sẽ phải chịu toàn bộ trách nhiệm trước pháp luật khi sử dụng dịch vụ của chúng tôi. Tks!";`
);

t = t.replace(
  `function unitHtml() {
      return (
        '<span class="site-ticker__unit">' +
        '<span class="site-ticker__intro">' +
        TICKER_INTRO +
        "</span>" +
        '<span class="site-ticker__gap" aria-hidden="true"></span>' +
        '<span class="site-ticker__warn">' +
        TICKER_WARN +
        "</span></span>"
      );
    }`,
  `function unitHtml() {
      return (
        '<span class="site-ticker__unit">' +
        '<span class="site-ticker__warn">' +
        TICKER_TEXT +
        "</span></span>"
      );
    }`
);

if (!t.includes("TICKER_TEXT") || t.includes("TICKER_INTRO")) {
  console.error("replace failed", {
    hasText: t.includes("TICKER_TEXT"),
    hasIntro: t.includes("TICKER_INTRO")
  });
  process.exit(1);
}

fs.writeFileSync(file + ".tmp", t);
fs.renameSync(file + ".tmp", file);
console.log("ok site-header");

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
      const nh = h.replace(/site-header\.js\?v=[^"']+/g, "site-header.js?v=20260915tick2");
      if (nh !== h) {
        fs.writeFileSync(full, nh);
        n++;
      }
    }
  }
}
walk(".");
console.log("bumped", n);
