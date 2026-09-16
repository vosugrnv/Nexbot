const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const ver = "20260914pagepay1";
const modalLine =
  /[ \t]*<script src="\/js\/checkout-modal\.js\?v=[^"]*"><\/script>\r?\n?/g;

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "vi") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (ent.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function safeWrite(file, content) {
  const tmp = file + ".tmp_strip";
  fs.writeFileSync(tmp, content);
  try {
    fs.unlinkSync(file);
  } catch (_) {}
  fs.renameSync(tmp, file);
}

function patch(s) {
  return s
    .replace(modalLine, "")
    .replace(/location-country-page\.js\?v=[^"']+/g, `location-country-page.js?v=${ver}`)
    .replace(/product\.js\?v=[^"']+/g, `product.js?v=${ver}`)
    .replace(/checkout\.js\?v=[^"']+/g, `checkout.js?v=${ver}`)
    .replace(/css\/style\.css\?v=[^"']+/g, `css/style.css?v=${ver}`);
}

let htmlTouched = 0;
let fail = 0;
for (const file of walk(root)) {
  try {
    const s = fs.readFileSync(file, "utf8");
    if (!s.includes("checkout-modal.js") && !/location-country-page\.js\?v=/.test(s) && !/product\.js\?v=/.test(s)) {
      continue;
    }
    const out = patch(s);
    if (out !== s) {
      safeWrite(file, out);
      htmlTouched++;
    }
  } catch (e) {
    fail++;
    console.error("fail", path.relative(root, file), e.message);
  }
}

console.log("html patched:", htmlTouched, "fail:", fail);
const left = walk(root).filter((f) => {
  try {
    return fs.readFileSync(f, "utf8").includes("checkout-modal.js");
  } catch (_) {
    return false;
  }
});
console.log("remaining checkout-modal refs:", left.length);
if (left.length) console.log(left.slice(0, 5).map((f) => path.relative(root, f)));
