const fs = require("fs");
const path = require("path");

function walk(d, acc = []) {
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "vi") continue;
    const p = path.join(d, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const files = walk(".");
let n = 0;
for (const f of files) {
  let c = fs.readFileSync(f, "utf8");
  const o = c;
  c = c.replace(/proxy-mega-menu\.js\?v=[^"]+/g, "proxy-mega-menu.js?v=20260911nav1");
  c = c.replace(/site-header\.js\?v=[^"]+/g, "site-header.js?v=20260911nav1");
  c = c.replace(/category-taxonomy\.js\?v=[^"]+/g, "category-taxonomy.js?v=20260911nav1");
  if (c !== o) {
    fs.writeFileSync(f, c);
    n++;
  }
}
console.log("updated html", n);
console.log(
  "mega has legacy listing",
  /tat-ca-san-pham/.test(fs.readFileSync("js/proxy-mega-menu.js", "utf8"))
);
