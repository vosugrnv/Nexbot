const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC = "images/icon-vuaproxy.png";
const VER = "20260915prev";

async function out(file, size) {
  const tmp = file + ".tmp.png";
  await sharp(SRC)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .png()
    .toFile(tmp);
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch (_) {}
  fs.renameSync(tmp, file);
  console.log("wrote", file, size);
}

async function main() {
  await out("images/favicon-32.png", 32);
  await out("images/favicon.png", 128);
  await out("images/apple-touch-icon.png", 180);
  await out("favicon.png", 64);
  await out("favicon.ico", 64);

  for (const f of [
    "images/favicon-16.png",
    "images/favicon-48.png",
    "images/favicon-source-v.png",
    "images/favicon-v-master.png",
    "images/_peek-fav.png",
    "images/_peek-icon.png"
  ]) {
    try {
      fs.unlinkSync(f);
      console.log("rm", f);
    } catch (_) {}
  }

  const BLOCK = [
    '<link rel="shortcut icon" href="/images/favicon.png?v=' + VER + '">',
    '<link rel="icon" type="image/png" href="/images/favicon.png?v=' + VER + '">',
    '<link rel="apple-touch-icon" href="/images/apple-touch-icon.png?v=' + VER + '">'
  ].join("\n");

  const SKIP = new Set(["node_modules", ".git", "api", "scripts", "vi", "images"]);
  let n = 0;
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(ent.name)) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.name.endsWith(".html")) {
        try {
          let t = fs.readFileSync(full, "utf8");
          const o = t;
          t = t.replace(/\s*<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/gi, "");
          t = t.replace(/\s*<link[^>]*rel=["']apple-touch-icon["'][^>]*>/gi, "");
          if (/<meta\s+charset=/i.test(t)) {
            t = t.replace(/(<meta\s+charset=["'][^"']*["']\s*\/?>)/i, "$1\n" + BLOCK);
          } else if (/<head[^>]*>/i.test(t)) {
            t = t.replace(/<head[^>]*>/i, (m) => m + "\n" + BLOCK);
          }
          if (t !== o) {
            fs.writeFileSync(full + ".tmp", t);
            fs.renameSync(full + ".tmp", full);
            n++;
          }
        } catch (_) {}
      }
    }
  }
  walk(".");
  console.log("html", n, VER);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
