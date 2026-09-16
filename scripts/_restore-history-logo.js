const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const assets = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-Admin-Downloads-VuaProxy/assets"
);
const ver = "20260914hist1";

const logoSrc = path.join(assets, "vuaproxy-logo-horizontal-v2.png");
const iconSrc = path.join(assets, "vuaproxy-icon-v2.png");

function floodRemoveBg(data, width, height, isBg) {
  const visited = new Uint8Array(width * height);
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx] || !isBg(idx)) return;
    visited[idx] = 1;
    queue.push(idx);
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (queue.length) {
    const idx = queue.shift();
    data[idx * 4 + 3] = 0;
    const x = idx % width;
    const y = (idx / width) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

async function clearNearWhite(input, output) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.from(data);
  floodRemoveBg(px, info.width, info.height, (idx) => {
    const i = idx * 4;
    return px[i] >= 245 && px[i + 1] >= 245 && px[i + 2] >= 245;
  });
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(output);
  const m = await sharp(output).metadata();
  console.log(path.basename(output), m.width, m.height, "alpha=" + m.hasAlpha);
}

async function main() {
  if (!fs.existsSync(logoSrc) || !fs.existsSync(iconSrc)) {
    throw new Error("Missing history assets: " + logoSrc + " / " + iconSrc);
  }

  const logoOut = path.join(root, "images/logo-vuaproxy.png");
  const iconOut = path.join(root, "images/icon-vuaproxy.png");
  await clearNearWhite(logoSrc, logoOut);
  await clearNearWhite(iconSrc, iconOut);

  // also keep source copies
  fs.copyFileSync(logoSrc, path.join(root, "images/logo-vuaproxy-source.png"));
  fs.copyFileSync(iconSrc, path.join(root, "images/icon-vuaproxy-source.png"));

  await sharp(iconOut).resize(64, 64).png().toFile(path.join(root, "images/_fav.png"));
  await sharp(iconOut).resize(32, 32).png().toFile(path.join(root, "images/_fav32.png"));
  await sharp(iconOut).resize(180, 180).png().toFile(path.join(root, "images/_apple.png"));
  for (const [from, to] of [
    ["_fav.png", "favicon.png"],
    ["_fav32.png", "favicon-32.png"],
    ["_apple.png", "apple-touch-icon.png"]
  ]) {
    const a = path.join(root, "images", from);
    const b = path.join(root, "images", to);
    try { fs.unlinkSync(b); } catch (_) {}
    fs.copyFileSync(a, b);
    try { fs.unlinkSync(a); } catch (_) {}
  }
  console.log("favicons ok");

  for (const rel of ["js/site-header.js", "index.html"]) {
    const file = path.join(root, rel);
    let s = fs.readFileSync(file, "utf8");
    s = s.replace(
      /\/images\/logo-vuaproxy\.(svg|png)\?v=[^"']+/g,
      `/images/logo-vuaproxy.png?v=${ver}`
    );
    s = s.replace(
      /images\/logo-vuaproxy\.(svg|png)\?v=[^"']+/g,
      `images/logo-vuaproxy.png?v=${ver}`
    );
    s = s.replace(/const SHELL_VER = "v\d+"/, 'const SHELL_VER = "v26"');
    s = s.replace(/const ver = "2026[^"]+"/, `const ver = "${ver}"`);
    s = s.replace(/css\/style\.css\?v=[^"']+/g, `css/style.css?v=${ver}`);
    s = s.replace(/site-header\.js\?v=[^"']+/g, `site-header.js?v=${ver}`);
    s = s.replace(
      /"logo":"https:\/\/vuaproxy\.vn\/images\/logo-vuaproxy\.[^"]+"/,
      `"logo":"https://vuaproxy.vn/images/logo-vuaproxy.png?v=${ver}"`
    );
    fs.writeFileSync(file, s);
    console.log("patched", rel);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
