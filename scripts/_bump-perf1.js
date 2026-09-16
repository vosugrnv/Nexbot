const fs = require("fs");
const p = "C:/Users/Admin/Downloads/VuaProxy/index.html";
let t = fs.readFileSync(p, "utf8");
t = t.replace(/css\/style\.css\?v=[^"]+/, "css/style.css?v=20260914perf1");
t = t.replace(/js\/wnf-globe\.js\?v=[^"]+/, "js/wnf-globe.js?v=20260914perf1");
t = t.replace(/js\/app\.js\?v=[^"]+/, "js/app.js?v=20260914perf1");
fs.writeFileSync(p, t);
console.log("ok", t.includes("Giải"), t.includes("20260914perf1"));
