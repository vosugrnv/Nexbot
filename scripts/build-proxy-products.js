/** Build RAW_PRODUCTS in products-data.js from locations + proxy packages */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const locSrc = fs.readFileSync(path.join(root, "js", "locations-data.js"), "utf8");
const pkgSrc = fs.readFileSync(path.join(root, "js", "proxy-packages.js"), "utf8");

const sandbox = { console, window: {} };
vm.createContext(sandbox);
vm.runInContext(locSrc + "\n" + pkgSrc, sandbox);
const locations = sandbox.window.VUAPROXY_LOCATIONS;
const products = sandbox.window.VUAPROXY_allCountryPackages(locations);

const productsFile = path.join(root, "js", "products-data.js");
let tpl = fs.readFileSync(productsFile, "utf8");
const start = tpl.indexOf("const RAW_PRODUCTS = ");
const end = tpl.indexOf("\nRAW_PRODUCTS.forEach");
if (start < 0 || end < 0) throw new Error("RAW_PRODUCTS markers not found");

const json = JSON.stringify(products, null, 2);
const next =
  tpl.slice(0, start) +
  "const RAW_PRODUCTS = " +
  json +
  ";\n" +
  tpl.slice(end + 1);

fs.writeFileSync(productsFile, next);
console.log("Wrote", products.length, "products for", locations.length, "countries");
console.log("Sample:", products[0].id, products[0].name);
