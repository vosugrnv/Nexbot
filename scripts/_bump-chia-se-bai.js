const fs = require("fs");
let h = fs.readFileSync("chia-se-bai.html", "utf8");
h = h.replace(/chia-se-data\.js\?v=[^"]+/g, "chia-se-data.js?v=20260911proxy1");
h = h.replace(/blog-runtime\.js\?v=[^"]+/g, "blog-runtime.js?v=20260911proxy1");
h = h.replace(/chia-se-bai\.js\?v=[^"]+/g, "chia-se-bai.js?v=20260911proxy1");
fs.writeFileSync("chia-se-bai.html", h);
console.log("chia-se-bai ok");
