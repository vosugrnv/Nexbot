const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function stripHtml(html) {
  let s = html;
  s = s.replace(/<a class="icon-btn wish-btn"[\s\S]*?<\/a>\s*/g, "");
  s = s.replace(/<a class="cart-btn"[\s\S]*?<\/a>\s*/g, "");
  s = s.replace(/<a class="bn-item" href="\/wishlist"[\s\S]*?<\/a>\s*/g, "");
  s = s.replace(/<a class="bn-item" href="\/cart"[\s\S]*?<\/a>\s*/g, "");
  s = s.replace(/<button class="btn btn-outline" id="addToCartBtn">[\s\S]*?<\/button>\s*/g, "");
  s = s.replace(/<script src="[^"]*wish-store\.js[^"]*"><\/script>\s*/g, "");
  s = s.replace(/<script src="[^"]*wishlist-page\.js[^"]*"><\/script>\s*/g, "");
  s = s.replace(/<script src="[^"]*cart-page\.js[^"]*"><\/script>\s*/g, "");
  s = s.replace(/site-header\.js\?v=[^"]+/g, "site-header.js?v=20260914nocart1");
  return s;
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "api") continue;
    const full = path.join(dir, name);
    let st;
    try { st = fs.statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

let n = 0;
for (const file of walk(root)) {
  let before;
  try { before = fs.readFileSync(file, "utf8"); } catch { continue; }
  if (!/wishlist|\/cart"|cart-btn|wish-btn|addToCartBtn|wish-store|cart-page|site-header\.js/.test(before)) continue;
  const after = stripHtml(before);
  if (after !== before) {
    try {
      fs.writeFileSync(file, after);
      n++;
    } catch (e) {
      console.warn("skip", file, e.code);
    }
  }
}
console.log("stripped html files:", n);

for (const f of ["cart.html", "wishlist.html"]) {
  const fp = path.join(root, f);
  if (fs.existsSync(fp)) {
    try {
      fs.unlinkSync(fp);
      console.log("deleted", f);
    } catch (e) {
      console.warn("delete fail", f, e.code);
    }
  }
}

// product.js via temp rename if locked
const productPath = path.join(root, "js", "product.js");
try {
  let s = fs.readFileSync(productPath, "utf8");
  if (s.includes('addToCartBtn").addEventListener') || s.includes("wireProductWish")) {
    s = s.replace(
      /document\.getElementById\("addToCartBtn"\)\.addEventListener\([\s\S]*?\}\)\(\);\s*/,
      `document.getElementById("buyNowBtn")?.addEventListener("click", () => {
  if (typeof addToCart === "function") addToCart(currentCartItem());
  location.href = "/thanh-toan";
});
document.getElementById("addToCartBtn")?.remove();
document.getElementById("productWishBtn")?.remove();

`
    );
    const tmp = productPath + ".tmp";
    fs.writeFileSync(tmp, s);
    try {
      fs.renameSync(tmp, productPath);
    } catch {
      fs.copyFileSync(tmp, productPath);
      fs.unlinkSync(tmp);
    }
    console.log("patched product.js");
  } else {
    console.log("product.js already patched or pattern missing");
  }
} catch (e) {
  console.warn("product.js skip:", e.code || e.message);
}
