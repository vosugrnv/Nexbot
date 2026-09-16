const fs = require("fs");
let s = fs.readFileSync("admin.html", "utf8");
s = s.replace(/admin-app\.js\?v=[^"']+/, "admin-app.js?v=20260911paid1");
fs.writeFileSync("admin.html", s);
console.log((s.match(/admin-app\.js\?v=[^"']+/) || [])[0]);
