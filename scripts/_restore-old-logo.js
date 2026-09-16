const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const ver = "20260914oldlogo";

async function main() {
  const svg = fs.readFileSync(path.join(root, "images/logo-vuaproxy.svg"));
  await sharp(svg, { density: 300 })
    .resize({
      width: 900,
      height: 180,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(root, "images/logo-vuaproxy.png"));
  console.log("logo png ok");

  const iconSvg = fs.readFileSync(path.join(root, "images/icon-vuaproxy.svg"));
  const tmp = {
    fav: path.join(root, "images/_favicon-new.png"),
    f32: path.join(root, "images/_favicon-32-new.png"),
    apple: path.join(root, "images/_apple-new.png")
  };
  await sharp(iconSvg).resize(64, 64).png().toFile(tmp.fav);
  await sharp(iconSvg).resize(32, 32).png().toFile(tmp.f32);
  await sharp(iconSvg).resize(180, 180).png().toFile(tmp.apple);

  const pairs = [
    [tmp.fav, path.join(root, "images/favicon.png")],
    [tmp.f32, path.join(root, "images/favicon-32.png")],
    [tmp.apple, path.join(root, "images/apple-touch-icon.png")]
  ];
  for (const [from, to] of pairs) {
    try {
      fs.unlinkSync(to);
    } catch (_) {}
    fs.copyFileSync(from, to);
    try {
      fs.unlinkSync(from);
    } catch (_) {}
    console.log("wrote", path.basename(to));
  }

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
    s = s.replace(/const SHELL_VER = "v\d+"/, 'const SHELL_VER = "v25"');
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
