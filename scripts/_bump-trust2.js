const fs = require("fs");
let h = fs.readFileSync("index.html", "utf8");
h = h.replace(/css\/style\.css\?v=[^"]+/, "css/style.css?v=20260911trust2");
fs.writeFileSync("index.html", h);
console.log(/trust2/.test(h), /wordmarks\/adspower/.test(h));
