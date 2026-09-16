const fs = require("fs");
let h = fs.readFileSync("index.html", "utf8");
h = h.replace(/css\/style\.css\?v=[^"]+/, "css/style.css?v=20260911hot2");
fs.writeFileSync("index.html", h);
const css = fs.readFileSync("css/style.css", "utf8");
console.log({
  cssVer: /style\.css\?v=20260911hot2/.test(h),
  rectFlag: /\.hot-icon--flag\{[\s\S]*?width:64px/.test(css)
});
