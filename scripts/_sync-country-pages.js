const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const template = fs.readFileSync(path.join(root, "khu-vuc-quoc-gia.html"), "utf8");
const src = fs.readFileSync(path.join(root, "js", "locations-data.js"), "utf8");
const codes = [...new Set([...src.matchAll(/code:\s*"([a-z]{2})"/g)].map((m) => m[1]))];

const dir = path.join(root, "tat-ca-khu-vuc");
let n = 0;
codes.forEach((code) => {
  const file = path.join(dir, code + ".html");
  fs.writeFileSync(file, template);
  n++;
});
console.log("synced", n, "country pages from khu-vuc-quoc-gia.html");
