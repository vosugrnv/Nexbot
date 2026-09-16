const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const ver = "20260914cleanurl";

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "vi") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (ent.name.endsWith(".html")) out.push(full);
  }
  return out;
}

let n = 0;
for (const file of walk(root)) {
  let s = fs.readFileSync(file, "utf8");
  const out = s
    .replace(/checkout\.js\?v=[^"']+/g, `checkout.js?v=${ver}`)
    .replace(/product\.js\?v=[^"']+/g, `product.js?v=${ver}`)
    .replace(/location-country-page\.js\?v=[^"']+/g, `location-country-page.js?v=${ver}`);
  if (out !== s) {
    fs.writeFileSync(file, out);
    n++;
  }
}
console.log("bumped", n, "html files");
