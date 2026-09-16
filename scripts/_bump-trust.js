const fs = require("fs");
let h = fs.readFileSync("index.html", "utf8");
h = h.replace(/css\/style\.css\?v=[^"]+/, "css/style.css?v=20260911trust1");
fs.writeFileSync("index.html", h);
console.log({
  css: /20260911trust1/.test(h),
  names: /AdsPower<\/span>/.test(h) && /BitBrowser<\/span>/.test(h)
});
