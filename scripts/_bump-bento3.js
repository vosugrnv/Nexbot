const fs = require("fs");
const path = require("path");

const bump = "20260912bento3";
const root = path.join(__dirname, "..");
const templatePath = path.join(root, "khu-vuc-quoc-gia.html");

let html = fs.readFileSync(templatePath, "utf8");
html = html.replace(/style\.css\?v=[^"'&\s]+/g, "style.css?v=" + bump);
html = html.replace(/location-country-page\.js\?v=[^"'&\s]+/g, "location-country-page.js?v=" + bump);
html = html.replace(/side-banners\.js\?v=[^"'&\s]+/g, "side-banners.js?v=" + bump);
fs.writeFileSync(templatePath, html);

// bump side-banners load in site-header too
const hdr = path.join(root, "js", "site-header.js");
let hs = fs.readFileSync(hdr, "utf8");
const hs2 = hs.replace(/side-banners\.js\?v=[^"'&\s]+/g, "side-banners.js?v=" + bump);
if (hs2 !== hs) fs.writeFileSync(hdr, hs2);

const src = fs.readFileSync(path.join(root, "js", "locations-data.js"), "utf8");
const codes = [...new Set([...src.matchAll(/code:\s*"([a-z]{2})"/g)].map((m) => m[1]))];
const dir = path.join(root, "tat-ca-khu-vuc");
codes.forEach((code) => {
  fs.writeFileSync(path.join(dir, code + ".html"), html);
});

console.log("bumped+synced", codes.length, bump);
