const fs = require("fs");
const path = require("path");

global.window = global;
require(path.join(__dirname, "..", "js", "locations-data.js"));
const codes = VUAPROXY_LOCATIONS.map((x) => x.code);
console.log("locations", codes.length);
const miss = codes.filter((c) => !fs.existsSync(path.join(__dirname, "..", "tat-ca-khu-vuc", c + ".html")));
console.log("missing html", miss.length, miss.join(","));
if (miss.length) {
  const template = fs.readFileSync(path.join(__dirname, "..", "khu-vuc-quoc-gia.html"), "utf8");
  miss.forEach((c) => {
    fs.writeFileSync(path.join(__dirname, "..", "tat-ca-khu-vuc", c + ".html"), template);
  });
  console.log("created", miss.length);
}

let mega = fs.readFileSync(path.join(__dirname, "..", "js", "proxy-mega-menu.js"), "utf8");
const oldFlag = /const LOCAL_FLAGS = new Set\([\s\S]*?\);\s*\n\s*function flagUrl\(code\) \{[\s\S]*?\n  \}/;
const newFlag = `function flagUrl(code) {
    const c = String(code || "un").toLowerCase();
    return "/images/flags/" + c + ".png";
  }
  function flagImgHtml(code, name) {
    const c = String(code || "un").toLowerCase();
    const label = String(name || c).replace(/"/g, "&quot;");
    return (
      '<img src="' +
      flagUrl(c) +
      '" alt="' +
      label +
      '" width="20" height="20" loading="lazy" onerror="if(!this.dataset.cdn){this.dataset.cdn=1;this.src=\\'https://flagcdn.com/w40/' +
      c +
      '.png\\'}">'
    );
  }`;
if (oldFlag.test(mega)) {
  mega = mega.replace(oldFlag, newFlag);
} else if (!mega.includes("flagImgHtml")) {
  mega = mega.replace(
    /function flagUrl\(code\) \{[\s\S]*?\n  \}/,
    newFlag
  );
}
// Replace img construction that used flagUrl alone
mega = mega.replace(
  /'<img src="' \+ flagUrl\(([^)]+)\) \+ '" alt="' \+ ([^+]+) \+ '"[^>]*>'/g,
  "flagImgHtml($1, $2)"
);
fs.writeFileSync(path.join(__dirname, "..", "js", "proxy-mega-menu.js"), mega);
console.log("mega patched", mega.includes("flagImgHtml"), mega.includes("flagcdn.com"));

// CSS scroll for mega country grid if needed
const cssPath = path.join(__dirname, "..", "css", "style.css");
let css = fs.readFileSync(cssPath, "utf8");
if (!css.includes(".proxy-mega-countries{") && !css.includes("proxy-mega-countries {")) {
  // try find existing
}
if (!css.includes("proxy-mega-countries") || !css.includes("overflow:auto") || !/proxy-mega-countries[^}]*max-height/.test(css)) {
  css += `
/* Mega menu: many countries */
.proxy-mega-panel .proxy-mega-countries,
.proxy-mega-countries{
  max-height:min(58vh, 420px);
  overflow:auto;
  overscroll-behavior:contain;
  padding-right:4px;
}
`;
  fs.writeFileSync(cssPath, css);
  console.log("css scroll added");
}
