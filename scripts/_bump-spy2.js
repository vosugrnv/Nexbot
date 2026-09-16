const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const bump = "20260911spy2";

function bumpFile(file) {
  let s = fs.readFileSync(file, "utf8");
  const orig = s;
  s = s.replace(/proxy-mega-menu\.js\?v=[^"'&\s]+/g, "proxy-mega-menu.js?v=" + bump);
  s = s.replace(/style\.css\?v=[^"'&\s]+/g, "style.css?v=" + bump);
  if (s !== orig) {
    try {
      fs.writeFileSync(file, s);
      return true;
    } catch (e) {
      console.warn("skip", path.basename(file), e.code || e.message);
    }
  }
  return false;
}

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "vi" || name === ".git") continue;
    const p = path.join(dir, name);
    let st;
    try {
      st = fs.statSync(p);
    } catch (_) {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (/\.html$/i.test(name)) out.push(p);
  }
}

const files = [];
walk(root, files);
let n = 0;
files.forEach((f) => {
  if (bumpFile(f)) n++;
});
console.log("bumped", n, bump);
