const fs = require("fs");
const path = require("path");

const roots = [
  path.join("C:/Users/Admin/Downloads/VuaProxy/tat-ca-khu-vuc"),
  "C:/Users/Admin/Downloads/VuaProxy"
];

const replacements = [
  ['<h1 id="lcpTitle">US Residential Proxies</h1>', '<h1 id="lcpTitle">Proxy Dân Cư</h1>'],
  ['<h2 id="lcpPackTitle">Residential Proxies United States tại Vua Proxy</h2>', '<h2 id="lcpPackTitle">Proxy Dân Cư tại Vua Proxy</h2>'],
  ["location-country-page.js?v=20260914cleanurl", "location-country-page.js?v=20260914vi1"]
];

let files = 0;
let changed = 0;

function processFile(file) {
  if (!file.endsWith(".html")) return;
  let t = fs.readFileSync(file, "utf8");
  if (!t.includes("lcpTitle") && !t.includes("location-country-page.js")) return;
  files++;
  let next = t;
  for (const [a, b] of replacements) next = next.split(a).join(b);
  if (next !== t) {
    fs.writeFileSync(file, next);
    changed++;
  }
}

for (const root of roots) {
  if (root.endsWith("tat-ca-khu-vuc")) {
    for (const name of fs.readdirSync(root)) {
      processFile(path.join(root, name));
    }
  } else {
    processFile(path.join(root, "khu-vuc-quoc-gia.html"));
  }
}

console.log({ files, changed });
