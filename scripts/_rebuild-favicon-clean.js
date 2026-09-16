const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = "images/favicon-source-v.png";
const VER = "20260915fav5";

/** Neutral near-black only — keeps red shadows + grey server bars. */
function isBg(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max <= 18 && max - min <= 6;
}

function floodTransparent(data, w, h) {
  const ch = 4;
  const visited = new Uint8Array(w * h);
  const stack = [];

  function push(x, y) {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    const i = idx * ch;
    if (!isBg(data[i], data[i + 1], data[i + 2])) return;
    visited[idx] = 1;
    stack.push(idx);
  }

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (stack.length) {
    const idx = stack.pop();
    const i = idx * ch;
    data[i + 3] = 0;
    const x = idx % w;
    const y = (idx / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  // Soft fringe: dark pixels next to hole get partial alpha (no recolor)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const i = idx * ch;
      if (data[i + 3] === 0) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      if (max > 40) continue;
      let nearHole = false;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (data[(ny * w + nx) * ch + 3] === 0) {
          nearHole = true;
          break;
        }
      }
      if (nearHole && isBg(r, g, b)) {
        data[i + 3] = 0;
      } else if (nearHole && max <= 35 && Math.max(r, g, b) - Math.min(r, g, b) <= 8) {
        data[i + 3] = Math.min(data[i + 3], Math.round((max / 35) * 180));
      }
    }
  }
}

async function build() {
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);
  floodTransparent(buf, w, h);

  // bbox from remaining opaque / semi-opaque pixels
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (buf[i + 3] < 16) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.08);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const chh = maxY - minY + 1;
  const side = Math.max(cw, chh);
  console.log("bbox", { minX, minY, cw, chh, side });

  const master = await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: cw, height: chh })
    .extend({
      top: Math.floor((side - chh) / 2),
      bottom: Math.ceil((side - chh) / 2),
      left: Math.floor((side - cw) / 2),
      right: Math.ceil((side - cw) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  fs.writeFileSync("images/favicon-v-master.png", master);

  // corner check
  const check = await sharp(master).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const c0 = check.data;
  console.log("corner rgba", c0[0], c0[1], c0[2], c0[3]);

  async function out(file, size) {
    const tmp = file + ".tmp.png";
    await sharp(master)
      .resize(size, size, { fit: "fill", kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9 })
      .toFile(tmp);
    try {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch (_) {}
    fs.renameSync(tmp, file);
    console.log("wrote", file, size);
  }

  await out("images/favicon-16.png", 16);
  await out("images/favicon-32.png", 32);
  await out("images/favicon-48.png", 48);
  await out("images/favicon.png", 128);
  await out("images/apple-touch-icon.png", 180);
  await out("favicon.png", 64);
  await out("favicon.ico", 64);
}

async function bumpHtml() {
  const BLOCK =
    '<link rel="icon" href="/favicon.ico?v=' +
    VER +
    '" sizes="any">\n' +
    '<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png?v=' +
    VER +
    '">\n' +
    '<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16.png?v=' +
    VER +
    '">\n' +
    '<link rel="icon" type="image/png" sizes="128x128" href="/images/favicon.png?v=' +
    VER +
    '">\n' +
    '<link rel="apple-touch-icon" href="/images/apple-touch-icon.png?v=' +
    VER +
    '">';
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
            const tmp = full + ".tmp";
            fs.writeFileSync(tmp, t);
            fs.renameSync(tmp, full);
            n++;
          }
        } catch (_) {}
      }
    }
  }
  walk(".");
  console.log("html patched", n, VER);
}

build()
  .then(bumpHtml)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
