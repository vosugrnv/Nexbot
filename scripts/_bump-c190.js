const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const bump = "20260911c190";

const replacements = [
  [/locations-data\.js\?v=[^"'&\s]+/g, "locations-data.js?v=" + bump],
  [/locations-page\.js\?v=[^"'&\s]+/g, "locations-page.js?v=" + bump],
  [/location-country-page\.js\?v=[^"'&\s]+/g, "location-country-page.js?v=" + bump],
  [/proxy-mega-menu\.js\?v=[^"'&\s]+/g, "proxy-mega-menu.js?v=" + bump],
  [/category-taxonomy\.js\?v=[^"'&\s]+/g, "category-taxonomy.js?v=" + bump],
  [/side-banners\.js\?v=[^"'&\s]+/g, "side-banners.js?v=" + bump],
  [/proxy-packages\.js\?v=[^"'&\s]+/g, "proxy-packages.js?v=" + bump],
  [/products-data\.js\?v=[^"'&\s]+/g, "products-data.js?v=" + bump],
  [/style\.css\?v=[^"'&\s]+/g, "style.css?v=" + bump]
];

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "vi" || name === ".git") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.html$/i.test(name)) out.push(p);
  }
}

const files = [];
walk(root, files);
let n = 0;
files.forEach((file) => {
  let s = fs.readFileSync(file, "utf8");
  let orig = s;
  replacements.forEach(([re, to]) => {
    s = s.replace(re, to);
  });
  if (s !== orig) {
    fs.writeFileSync(file, s);
    n++;
  }
});
console.log("bumped", n, "html files to", bump);

// admin.html too
const admin = path.join(root, "admin.html");
let a = fs.readFileSync(admin, "utf8");
a = a
  .replace(/locations-data\.js\?v=[^"']+/, "locations-data.js?v=" + bump)
  .replace(/proxy-packages\.js\?v=[^"']+/, "proxy-packages.js?v=" + bump)
  .replace(/products-data\.js\?v=[^"']+/, "products-data.js?v=" + bump)
  .replace(/admin-app\.js\?v=[^"']+/, "admin-app.js?v=" + bump);
fs.writeFileSync(admin, a);
console.log("admin bumped");
