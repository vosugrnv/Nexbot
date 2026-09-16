const fs = require("fs");
const path = require("path");

const bump = "20260912wide1";
const root = path.join(__dirname, "..");
const templatePath = path.join(root, "khu-vuc-quoc-gia.html");

let html = fs.readFileSync(templatePath, "utf8");
html = html.replace(/style\.css\?v=[^"'&\s]+/g, "style.css?v=" + bump);
html = html.replace(/location-country-page\.js\?v=[^"'&\s]+/g, "location-country-page.js?v=" + bump);
html = html.replace(/site-header\.js\?v=[^"'&\s]+/g, "site-header.js?v=" + bump);
fs.writeFileSync(templatePath, html);

const src = fs.readFileSync(path.join(root, "js", "locations-data.js"), "utf8");
const codes = [...new Set([...src.matchAll(/code:\s*"([a-z]{2})"/g)].map((m) => m[1]))];
codes.forEach((code) => {
  fs.writeFileSync(path.join(root, "tat-ca-khu-vuc", code + ".html"), html);
});
console.log("bumped+synced", codes.length, bump);
