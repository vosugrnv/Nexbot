const fs = require("fs");
const path = require("path");
const cssPath = path.join(__dirname, "..", "css", "style.css");
let css = fs.readFileSync(cssPath, "utf8");
const start = css.indexOf(".lcp-why{padding:64px 0 48px;");
const end = css.indexOf(".lcp-reviews{padding:28px 0 48px;");
if (start < 0 || end < 0) {
  console.error("markers", start, end);
  process.exit(1);
}
const next = fs.readFileSync(path.join(__dirname, "_bento-why-css.css"), "utf8");
css = css.slice(0, start) + next + "\n\n" + css.slice(end);
// responsive tweaks for new col layout
css = css.replace(
  ".lcp-bento{grid-template-columns:repeat(2,minmax(0,1fr))}",
  ".lcp-bento{grid-template-columns:1fr;border-radius:18px}.lcp-bento-col{border-right:0;border-bottom:1px solid rgba(255,255,255,.08)}.lcp-bento-col:last-child{border-bottom:0}"
);
css = css.replace(
  ".lcp-bento{grid-template-columns:1fr}\n  .lcp-bento-card{min-height:0}",
  ".lcp-bento{grid-template-columns:1fr}"
);
fs.writeFileSync(cssPath, css);
console.log("css patched", start, end);
